import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Calendar, Tag, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const savedExpenses = localStorage.getItem(`expenses_${user.id}`);
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  };

  const saveExpenses = (newExpenses) => {
    localStorage.setItem(`expenses_${user.id}`, JSON.stringify(newExpenses));
    setExpenses(newExpenses);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expense = {
      id: editingExpense ? editingExpense.id : Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newExpenses;
    if (editingExpense) {
      newExpenses = expenses.map(exp => exp.id === editingExpense.id ? expense : exp);
      toast.success('Expense updated successfully');
    } else {
      newExpenses = [expense, ...expenses];
      toast.success('Expense added successfully');
    }

    saveExpenses(newExpenses);
    resetForm();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const newExpenses = expenses.filter(exp => exp.id !== expenseId);
      saveExpenses(newExpenses);
      toast.success('Expense deleted successfully');
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

  const categories = [
    'Office Supplies',
    'Utilities',
    'Rent',
    'Marketing',
    'Travel',
    'Equipment',
    'Insurance',
    'Professional Services',
    'Raw Materials',
    'Other'
  ];

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }).reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600">Track business expenses</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-red-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(getTotalExpenses())}
          </div>
          <div className="text-sm text-gray-600">Total Expenses</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(getMonthlyExpenses())}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Tag className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{expenses.length}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No expenses recorded yet. Add your first expense to get started!
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{expense.description}</h4>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {expense.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('en-PH')}
                      {expense.notes && (
                        <span> • {expense.notes}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-red-600">{formatPeso(expense.amount)}</div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Categories</h3>
          
          {getExpensesByCategory().length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data available</p>
          ) : (
            <div className="space-y-3">
              {getExpensesByCategory().map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{category}</div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">{formatPeso(amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingExpense ? 'Update' : 'Add'} Expense
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Expenses;