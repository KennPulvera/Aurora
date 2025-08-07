import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Plus, Tag, Receipt, Trash2, Edit,
  TrendingDown, Calculator, RefreshCw
} from 'lucide-react';
import { formatPeso } from '../utils/currency';
import toast from 'react-hot-toast';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [metrics, setMetrics] = useState({
    totalExpenses: 0,
    avgExpense: 0,
    expenseCount: 0,
    topCategory: '',
    categoryBreakdown: []
  });

  const expenseCategories = [
    'Inventory/Stock',
    'Utilities',
    'Rent',
    'Staff Wages',
    'Equipment',
    'Marketing',
    'Supplies',
    'Maintenance',
    'Insurance',
    'Other'
  ];

  const loadExpenses = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const savedExpenses = localStorage.getItem(`expenses_${user.id}`) || '[]';
      const allExpenses = JSON.parse(savedExpenses);
      setExpenses(allExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const calculateMetrics = useCallback(() => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const matchesPeriod = expenseDate >= startDate;
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      return matchesPeriod && matchesCategory;
    });

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    // Category breakdown
    const categoryTotals = {};
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].category : '';

    setMetrics({
      totalExpenses,
      avgExpense,
      expenseCount: filteredExpenses.length,
      topCategory,
      categoryBreakdown
    });
  }, [selectedPeriod, selectedCategory, expenses]);

  useEffect(() => {
    loadExpenses();
    calculateMetrics();
    
    // Listen for inventory restocking expenses
    const handleInventoryExpense = () => {
      loadExpenses();
      calculateMetrics();
      setLastUpdate(new Date());
    };
    
    window.addEventListener('financialUpdate', handleInventoryExpense);
    
    return () => {
      window.removeEventListener('financialUpdate', handleInventoryExpense);
    };
  }, [selectedPeriod, selectedCategory, calculateMetrics]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const currentExpenses = JSON.parse(localStorage.getItem(`expenses_${user.id}`) || '[]');
      
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString(),
        id: editingExpense ? editingExpense.id : Date.now()
      };

      let updatedExpenses;
      if (editingExpense) {
        updatedExpenses = currentExpenses.map(exp => 
          exp.id === editingExpense.id ? expenseData : exp
        );
        toast.success('Expense updated successfully');
      } else {
        updatedExpenses = [...currentExpenses, expenseData];
        toast.success('Expense added successfully');
      }

      localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
      setExpenses(updatedExpenses);
      
      // Trigger financial update
      window.dispatchEvent(new CustomEvent('financialUpdate', { 
        detail: { type: 'expenseUpdate' }
      }));
      
      resetForm();
      calculateMetrics();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date || new Date(expense.createdAt).toISOString().split('T')[0],
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentExpenses = JSON.parse(localStorage.getItem(`expenses_${user.id}`) || '[]');
        const updatedExpenses = currentExpenses.filter(exp => exp.id !== expenseId);
        
        localStorage.setItem(`expenses_${user.id}`, JSON.stringify(updatedExpenses));
        setExpenses(updatedExpenses);
        calculateMetrics();
        toast.success('Expense deleted successfully');
        
        window.dispatchEvent(new CustomEvent('financialUpdate', { 
          detail: { type: 'expenseDelete' }
        }));
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Inventory/Stock': 'bg-blue-100 text-blue-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Rent': 'bg-purple-100 text-purple-800',
      'Staff Wages': 'bg-green-100 text-green-800',
      'Equipment': 'bg-red-100 text-red-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Supplies': 'bg-indigo-100 text-indigo-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Insurance': 'bg-teal-100 text-teal-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  const filteredExpenses = expenses.filter(expense => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate = new Date(0);
    }

    const expenseDate = new Date(expense.date || expense.createdAt);
    const matchesPeriod = expenseDate >= startDate;
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesPeriod && matchesCategory;
  }).sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-red-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600">
              Track expenses including automatic inventory costs
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {expenseCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={() => {
              loadExpenses();
              calculateMetrics();
              setLastUpdate(new Date());
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-red-600" size={24} />
            <span className="text-sm text-red-600 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(metrics.totalExpenses)}
          </div>
          <div className="text-sm text-gray-600">
            {selectedPeriod} expenses
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="text-blue-600" size={24} />
            <span className="text-sm text-blue-600 font-medium">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(metrics.avgExpense)}
          </div>
          <div className="text-sm text-gray-600">
            per expense
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Receipt className="text-purple-600" size={24} />
            <span className="text-sm text-purple-600 font-medium">Count</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {metrics.expenseCount}
          </div>
          <div className="text-sm text-gray-600">
            total expenses
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Tag className="text-green-600" size={24} />
            <span className="text-sm text-green-600 font-medium">Top Category</span>
          </div>
          <div className="text-lg font-bold text-gray-900 mb-1">
            {metrics.topCategory || 'None'}
          </div>
          <div className="text-sm text-gray-600">
            highest spending
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {metrics.categoryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown ({selectedPeriod})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.categoryBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
                <span className="font-semibold text-red-600">
                  {formatPeso(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expenses List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Expense History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No expenses found for this period
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date || expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{expense.description}</div>
                      {expense.notes && (
                        <div className="text-xs text-gray-500 mt-1">{expense.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 text-right">
                      {formatPeso(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-center gap-2 text-blue-800">
          <Receipt className="text-blue-600" size={16} />
          <span className="font-medium">Automatic Expense Tracking:</span>
        </div>
        <div className="mt-2 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Inventory restocking expenses automatically recorded
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ExpenseTracker;