import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Calculator, RefreshCw,
  BarChart3, Package, Clock, Percent, Target
} from 'lucide-react';
import { formatPeso } from '../utils/currency';

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
    ordersByPeriod: []
  });
  
  const [menuItems, setMenuItems] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadMenuData = () => {
    try {
      // Load menu items with cost and price data
      const savedMenu = localStorage.getItem('menuItems') || '[]';
      const menu = JSON.parse(savedMenu);
      setMenuItems(menu);
    } catch (error) {
      console.error('Error loading menu data:', error);
    }
  };

  const loadOrderData = () => {
    try {
      // Load completed orders from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const completed = orders.filter(order => 
        order.status === 'completed' || order.status === 'ready'
      );
      setCompletedOrders(completed);
    } catch (error) {
      console.error('Error loading order data:', error);
    }
  };

  const calculateSalesMetrics = useCallback(() => {
    const now = new Date();
    let startDate;
    
    // Calculate period start date
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
        startDate = new Date(0); // All time
    }

    // Filter orders by period
    const periodOrders = completedOrders.filter(order => 
      new Date(order.createdAt || order.timestamp) >= startDate
    );

    let totalRevenue = 0;
    let totalCost = 0;
    const productSales = {};

    // Calculate revenue and cost for each order
    periodOrders.forEach(order => {
      totalRevenue += order.total || 0;
      
      // Calculate cost and track product sales
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Find menu item to get cost
          const menuItem = menuItems.find(m => 
            m.name === item.name || m.id === item.id
          );
          
          if (menuItem) {
            const itemCost = (menuItem.cost || 0) * item.quantity;
            totalCost += itemCost;
            
            // Track product sales
            if (!productSales[menuItem.name]) {
              productSales[menuItem.name] = {
                name: menuItem.name,
                quantity: 0,
                revenue: 0,
                cost: 0,
                profit: 0
              };
            }
            
            productSales[menuItem.name].quantity += item.quantity;
            productSales[menuItem.name].revenue += (menuItem.price || 0) * item.quantity;
            productSales[menuItem.name].cost += itemCost;
            productSales[menuItem.name].profit = 
              productSales[menuItem.name].revenue - productSales[menuItem.name].cost;
          }
        });
      }
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const avgOrderValue = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0;

    // Sort products by profit
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    setSalesData({
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin,
      totalOrders: periodOrders.length,
      avgOrderValue,
      topProducts,
      ordersByPeriod: periodOrders
    });
  }, [selectedPeriod, completedOrders, menuItems]);

  useEffect(() => {
    loadMenuData();
    loadOrderData();
    calculateSalesMetrics();
    
    // Listen for updates from POS and Order Queue
    const handleOrderUpdate = () => {
      loadOrderData();
      calculateSalesMetrics();
      setLastUpdate(new Date());
    };
    
    window.addEventListener('orderCreated', handleOrderUpdate);
    window.addEventListener('orderUpdated', handleOrderUpdate);
    window.addEventListener('financialUpdate', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderUpdate);
      window.removeEventListener('orderUpdated', handleOrderUpdate);  
      window.removeEventListener('financialUpdate', handleOrderUpdate);
    };
  }, [selectedPeriod, calculateSalesMetrics]);

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMarginColor = (margin) => {
    if (margin > 30) return 'text-green-600';
    if (margin > 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
            <p className="text-gray-600">
              Connected to Menu, POS & Order Queue for real-time profit tracking
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
          <button
            onClick={() => {
              loadMenuData();
              loadOrderData();
              calculateSalesMetrics();
              setLastUpdate(new Date());
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm text-green-600 font-medium">Revenue</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            {salesData.totalOrders} orders
          </div>
        </motion.div>

        {/* Cost Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calculator className="text-red-600" size={24} />
            <span className="text-sm text-red-600 font-medium">COGS</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.totalCost)}
          </div>
          <div className="text-sm text-gray-600">
            Cost of Goods Sold
          </div>
        </motion.div>

        {/* Net Profit Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl border ${
            salesData.netProfit >= 0 
              ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200' 
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className={`${salesData.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`} size={24} />
            <span className={`text-sm font-medium ${salesData.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
              Net Profit
            </span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${getProfitColor(salesData.netProfit)}`}>
            {formatPeso(salesData.netProfit)}
          </div>
          <div className="text-sm text-gray-600">
            Revenue - COGS
          </div>
        </motion.div>

        {/* Profit Margin Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Percent className="text-blue-600" size={24} />
            <span className="text-sm text-blue-600 font-medium">Margin</span>
          </div>
          <div className={`text-2xl font-bold mb-1 ${getMarginColor(salesData.profitMargin)}`}>
            {salesData.profitMargin.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">
            Avg: {formatPeso(salesData.avgOrderValue)}
          </div>
        </motion.div>
      </div>

      {/* Profit Calculation Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="text-purple-600" size={20} />
          Profit Calculation ({selectedPeriod})
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="text-gray-700">Total Revenue</span>
            <span className="font-bold text-green-600">{formatPeso(salesData.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-gray-700">Cost of Goods Sold (COGS)</span>
            <span className="font-bold text-red-600">-{formatPeso(salesData.totalCost)}</span>
          </div>
          <div className="border-t-2 border-gray-200 pt-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-semibold">Net Profit</span>
              <span className={`font-bold text-xl ${getProfitColor(salesData.netProfit)}`}>
                {formatPeso(salesData.netProfit)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Products by Profit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="text-orange-600" size={20} />
          Top Products by Profit ({selectedPeriod})
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Qty Sold</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Revenue</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Cost</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Profit</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500">Margin</th>
              </tr>
            </thead>
            <tbody>
              {salesData.topProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No sales data available for this period
                  </td>
                </tr>
              ) : (
                salesData.topProducts.map((product, index) => {
                  const margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="text-right py-3 text-gray-600">{product.quantity}</td>
                      <td className="text-right py-3 text-green-600 font-medium">
                        {formatPeso(product.revenue)}
                      </td>
                      <td className="text-right py-3 text-red-600">
                        {formatPeso(product.cost)}
                      </td>
                      <td className={`text-right py-3 font-bold ${getProfitColor(product.profit)}`}>
                        {formatPeso(product.profit)}
                      </td>
                      <td className={`text-right py-3 font-medium ${getMarginColor(margin)}`}>
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200"
      >
        <div className="flex items-center gap-2 text-green-800">
          <Clock className="text-green-600" size={16} />
          <span className="font-medium">Live Data Connections:</span>
        </div>
        <div className="mt-2 text-sm text-green-700 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Menu Items ({menuItems.length} items)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Order Queue (Real-time)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            POS System (Live)
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesAnalytics;