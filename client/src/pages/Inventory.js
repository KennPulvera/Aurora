import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, AlertTriangle, Search, Plus, Minus, Edit,
  DollarSign, Calculator, BarChart3, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';
// Removed complex financial utils - using direct localStorage now

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'add',
    quantity: '',
    reason: '',
    cost: ''
  });
  // const [showCostModal, setShowCostModal] = useState(false); // Reserved for future use
  const [inventoryMetrics, setInventoryMetrics] = useState({
    totalValue: 0,
    lowStockItems: 0,
    profitMargin: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProducts();
    calculateMetrics();
    
    // Listen for financial updates
    const handleFinancialUpdate = () => {
      fetchProducts();
      calculateMetrics();
    };
    
    window.addEventListener('financialUpdate', handleFinancialUpdate);
    
    return () => {
      window.removeEventListener('financialUpdate', handleFinancialUpdate);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      // For now, use localStorage with enhanced product data
      const savedProducts = localStorage.getItem(`inventory_${user.id}`);
      let products = [];
      
      if (savedProducts) {
        products = JSON.parse(savedProducts);
      } else {
        // Initialize with sample products that have cost and pricing data
        products = [
          {
            id: 1,
            name: 'Americano',
            category: 'Coffee',
            quantity: 50,
            cost: 60.00,  // Cost per unit
            price: 123.00, // Selling price
            lowStockThreshold: 10,
            description: 'Premium coffee beans'
          },
          {
            id: 2,
            name: 'Croissant',
            category: 'Pastry',
            quantity: 30,
            cost: 45.00,
            price: 85.00,
            lowStockThreshold: 5,
            description: 'Fresh baked pastry'
          },
          {
            id: 3,
            name: 'Latte',
            category: 'Coffee',
            quantity: 40,
            cost: 75.00,
            price: 150.00,
            lowStockThreshold: 8,
            description: 'Coffee with steamed milk'
          }
        ];
        localStorage.setItem(`inventory_${user.id}`, JSON.stringify(products));
      }
      
      setProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    // Calculate inventory value directly
    const totalValue = products.reduce((sum, product) => 
      sum + ((product.price || 0) * (product.quantity || 0)), 0
    );
    const lowStockItems = products.filter(p => p.quantity <= (p.lowStockThreshold || 5)).length;
    
    // Calculate average profit margin
    const avgProfitMargin = products.length > 0 
      ? products.reduce((sum, product) => {
          const margin = product.cost && product.price 
            ? ((product.price - product.cost) / product.price) * 100 
            : 0;
          return sum + margin;
        }, 0) / products.length
      : 0;
    
    setInventoryMetrics({
      totalValue,
      lowStockItems,
      profitMargin: avgProfitMargin
    });
  };

  const handleStockAdjustment = async () => {
    if (!selectedProduct || !stockAdjustment.quantity) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const adjustmentAmount = stockAdjustment.type === 'add' 
        ? parseInt(stockAdjustment.quantity)
        : -parseInt(stockAdjustment.quantity);
      
      const costPerUnit = parseFloat(stockAdjustment.cost) || selectedProduct.cost || 0;

      // Update local inventory
      const updatedProducts = products.map(product =>
        product.id === selectedProduct.id
          ? { 
              ...product, 
              quantity: product.quantity + adjustmentAmount,
              cost: costPerUnit || product.cost // Update cost if provided
            }
          : product
      );
      
      setProducts(updatedProducts);
      localStorage.setItem(`inventory_${user.id}`, JSON.stringify(updatedProducts));

      // Record expense if adding stock (restocking)
      if (stockAdjustment.type === 'add' && costPerUnit > 0) {
        const totalCost = costPerUnit * parseInt(stockAdjustment.quantity);
        const expense = {
          id: Date.now(),
          description: `Restocked ${selectedProduct.name} (${stockAdjustment.quantity} units)`,
          amount: totalCost,
          category: 'Inventory/Stock',
          date: new Date().toISOString().split('T')[0],
          notes: stockAdjustment.reason,
          productId: selectedProduct.id,
          type: 'inventory_restock'
        };
        
        // Save expense directly to localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const currentExpenses = JSON.parse(localStorage.getItem(`expenses_${user.id}`) || '[]');
        currentExpenses.push(expense);
        localStorage.setItem(`expenses_${user.id}`, JSON.stringify(currentExpenses));
        
        toast.success(`Stock added & expense recorded: ${formatPeso(totalCost)}`);
      } else {
        toast.success(`Stock ${stockAdjustment.type === 'add' ? 'added' : 'removed'} successfully`);
      }

      // Trigger financial update event
      window.dispatchEvent(new CustomEvent('financialUpdate', { 
        detail: { type: 'inventoryUpdate' }
      }));
      calculateMetrics();
      
      setShowStockModal(false);
      setStockAdjustment({ type: 'add', quantity: '', reason: '', cost: '' });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity === 0) return { status: 'out', color: 'text-red-600', bg: 'bg-red-100' };
    if (product.stockQuantity <= product.minStockLevel) return { status: 'low', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  // Legacy variables - now calculated in metrics
  // const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStockLevel);
  // const outOfStockProducts = products.filter(p => p.stockQuantity === 0);
  // const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Package className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600">
              Track stock, costs & profit margins with expense integration
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            fetchProducts();
            calculateMetrics();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Enhanced Stats Cards with Profit Margins */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Package className="text-blue-600" size={24} />
            <span className="text-sm text-blue-600 font-medium">Items</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{products.length}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm text-green-600 font-medium">Value</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatPeso(inventoryMetrics.totalValue)}</div>
          <div className="text-sm text-gray-600">Inventory Value</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="text-purple-600" size={24} />
            <span className="text-sm text-purple-600 font-medium">Profit</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{inventoryMetrics.profitMargin.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Avg Profit Margin</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200"
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-yellow-600" size={24} />
            <span className="text-sm text-yellow-600 font-medium">Low Stock</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{inventoryMetrics.lowStockItems}</div>
          <div className="text-sm text-gray-600">Items Need Restock</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-gray-600" size={24} />
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="text-sm font-bold text-gray-900 mb-1">CONNECTED</div>
          <div className="text-xs text-gray-600">To Expenses &<br/>Financial System</div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.stockQuantity} {product.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.lowStockThreshold || 5}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {formatPeso(product.cost || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatPeso(product.price || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.cost && product.price ? (
                        <span className={`font-semibold ${
                          ((product.price - product.cost) / product.price) * 100 > 30 
                            ? 'text-green-600' 
                            : ((product.price - product.cost) / product.price) * 100 > 15 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {(((product.price - product.cost) / product.price) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPeso((product.price || 0) * product.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status === 'out' ? 'Out of Stock' : 
                         stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Adjust Stock - {selectedProduct.name}</h2>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                Current Stock: <span className="font-medium">{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="add"
                      checked={stockAdjustment.type === 'add'}
                      onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
                      className="mr-2"
                    />
                    <Plus size={16} className="mr-1" />
                    Add Stock
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="remove"
                      checked={stockAdjustment.type === 'remove'}
                      onChange={(e) => setStockAdjustment({...stockAdjustment, type: e.target.value})}
                      className="mr-2"
                    />
                    <Minus size={16} className="mr-1" />
                    Remove Stock
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              {stockAdjustment.type === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Unit (for expense tracking)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockAdjustment.cost}
                    onChange={(e) => setStockAdjustment({...stockAdjustment, cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder={`Current: ${formatPeso(selectedProduct.cost || 0)}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use current cost. This will be recorded as an expense.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({...stockAdjustment, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Reason for adjustment..."
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setStockAdjustment({ type: 'add', quantity: '', reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustment}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Update Stock
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Inventory;