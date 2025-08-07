import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, TrendingUp, TrendingDown, 
  DollarSign, ShoppingCart, Package, Calculator, RefreshCw,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';
import { formatPeso } from '../utils/currency';

const BusinessReports = () => {
  const [reportData, setReportData] = useState({
    sales: { revenue: 0, orders: 0, avgOrder: 0, growth: 0 },
    expenses: { total: 0, count: 0, avgExpense: 0, categories: [] },
    profit: { net: 0, margin: 0, cogs: 0 },
    inventory: { value: 0, items: 0, lowStock: 0 },
    topProducts: [],
    trends: []
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  // const [comparisonPeriod, setComparisonPeriod] = useState('previous'); // Reserved for future use
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const generateReport = useCallback(() => {
    try {
      // Get date ranges
      const now = new Date();
      const { currentStart, previousStart } = getDateRanges(now, selectedPeriod);
      
      // Load data
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const expenses = JSON.parse(localStorage.getItem(`expenses_${user.id}`) || '[]');
      const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
      const inventory = JSON.parse(localStorage.getItem(`inventory_${user.id}`) || '[]');
      
      // Filter data by periods
      const currentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        return orderDate >= currentStart && (order.status === 'completed' || order.status === 'ready');
      });
      
      const previousOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.timestamp);
        return orderDate >= previousStart && orderDate < currentStart && (order.status === 'completed' || order.status === 'ready');
      });
      
      const currentExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate >= currentStart;
      });
      
      // Calculate sales metrics
      const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      const avgOrder = currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;
      
      // Calculate expenses
      const totalExpenses = currentExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const avgExpense = currentExpenses.length > 0 ? totalExpenses / currentExpenses.length : 0;
      
      // Expense categories
      const expenseCategories = {};
      currentExpenses.forEach(expense => {
        const category = expense.category || 'Other';
        expenseCategories[category] = (expenseCategories[category] || 0) + expense.amount;
      });
      
      const categoryArray = Object.entries(expenseCategories)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
      
      // Calculate COGS and profit
      let totalCOGS = 0;
      const productSales = {};
      
      currentOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const menuItem = menuItems.find(m => m.name === item.name || m.id === item.id);
            if (menuItem) {
              const itemCost = (menuItem.cost || 0) * item.quantity;
              totalCOGS += itemCost;
              
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
      
      const netProfit = currentRevenue - totalCOGS;
      const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;
      
      // Top products
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5);
      
      // Inventory metrics
      const inventoryValue = inventory.reduce((sum, item) => 
        sum + ((item.price || 0) * (item.quantity || 0)), 0
      );
      const lowStockItems = inventory.filter(item => 
        (item.quantity || 0) <= (item.lowStockThreshold || 5)
      ).length;
      
      // Trends (simplified)
      const trends = generateTrends(currentOrders, previousOrders, currentExpenses);
      
      setReportData({
        sales: {
          revenue: currentRevenue,
          orders: currentOrders.length,
          avgOrder,
          growth: revenueGrowth
        },
        expenses: {
          total: totalExpenses,
          count: currentExpenses.length,
          avgExpense,
          categories: categoryArray
        },
        profit: {
          net: netProfit,
          margin: profitMargin,
          cogs: totalCOGS
        },
        inventory: {
          value: inventoryValue,
          items: inventory.length,
          lowStock: lowStockItems
        },
        topProducts,
        trends
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    generateReport();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      generateReport();
      setLastUpdate(new Date());
    };
    
    window.addEventListener('orderCreated', handleDataUpdate);
    window.addEventListener('orderUpdated', handleDataUpdate);
    window.addEventListener('financialUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('orderCreated', handleDataUpdate);
      window.removeEventListener('orderUpdated', handleDataUpdate);
      window.removeEventListener('financialUpdate', handleDataUpdate);
    };
  }, [selectedPeriod, generateReport]);

  const getDateRanges = (now, period) => {
    let currentStart, previousStart;
    
    switch (period) {
      case 'today':
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        break;
      case 'week':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 7);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        break;
      case 'month':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 30);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 30);
        break;
      case 'quarter':
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 90);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 90);
        break;
      default:
        currentStart = new Date(0);
        previousStart = new Date(0);
    }
    
    return { currentStart, previousStart };
  };

  const generateTrends = (currentOrders, previousOrders, expenses) => {
    const trends = [];
    
    // Revenue trend
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    trends.push({
      metric: 'Revenue',
      current: currentRevenue,
      change: revenueChange,
      type: revenueChange >= 0 ? 'positive' : 'negative'
    });
    
    // Order count trend
    const orderChange = previousOrders.length > 0 ? 
      ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;
    
    trends.push({
      metric: 'Orders',
      current: currentOrders.length,
      change: orderChange,
      type: orderChange >= 0 ? 'positive' : 'negative'
    });
    
    // Expense trend
    const currentExpenseTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    trends.push({
      metric: 'Expenses',
      current: currentExpenseTotal,
      change: 0, // Would need previous period expenses for comparison
      type: 'neutral'
    });
    
    return trends;
  };

  const downloadReport = () => {
    const reportContent = generateReportContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    return `
BUSINESS REPORT - ${selectedPeriod.toUpperCase()}
Generated: ${new Date().toLocaleString()}

=== SALES SUMMARY ===
Revenue: ${formatPeso(reportData.sales.revenue)}
Orders: ${reportData.sales.orders}
Average Order: ${formatPeso(reportData.sales.avgOrder)}
Growth: ${reportData.sales.growth.toFixed(1)}%

=== PROFIT ANALYSIS ===
Net Profit: ${formatPeso(reportData.profit.net)}
Profit Margin: ${reportData.profit.margin.toFixed(1)}%
Cost of Goods Sold: ${formatPeso(reportData.profit.cogs)}

=== EXPENSES ===
Total Expenses: ${formatPeso(reportData.expenses.total)}
Number of Expenses: ${reportData.expenses.count}
Average Expense: ${formatPeso(reportData.expenses.avgExpense)}

Top Expense Categories:
${reportData.expenses.categories.slice(0, 5).map(cat => 
  `- ${cat.category}: ${formatPeso(cat.amount)}`
).join('\n')}

=== INVENTORY ===
Inventory Value: ${formatPeso(reportData.inventory.value)}
Total Items: ${reportData.inventory.items}
Low Stock Items: ${reportData.inventory.lowStock}

=== TOP PRODUCTS ===
${reportData.topProducts.map((product, index) => 
  `${index + 1}. ${product.name}: ${formatPeso(product.profit)} profit (${product.quantity} sold)`
).join('\n')}

=== TRENDS ===
${reportData.trends.map(trend => 
  `${trend.metric}: ${formatPeso(trend.current)} (${trend.change.toFixed(1)}%)`
).join('\n')}
    `;
  };

  const getGrowthIcon = (change) => {
    if (change > 0) return <TrendingUp className="text-green-600" size={16} />;
    if (change < 0) return <TrendingDown className="text-red-600" size={16} />;
    return <Activity className="text-gray-600" size={16} />;
  };

  const getGrowthColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Reports</h1>
            <p className="text-gray-600">
              Comprehensive business performance analysis
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
            <option value="quarter">This Quarter</option>
          </select>
          <button
            onClick={() => {
              generateReport();
              setLastUpdate(new Date());
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <div className="flex items-center gap-1">
              {getGrowthIcon(reportData.sales.growth)}
              <span className={`text-sm font-medium ${getGrowthColor(reportData.sales.growth)}`}>
                {reportData.sales.growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(reportData.sales.revenue)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="text-purple-600" size={24} />
            <span className={`text-sm font-medium ${getGrowthColor(reportData.profit.margin)}`}>
              {reportData.profit.margin.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(reportData.profit.net)}
          </div>
          <div className="text-sm text-gray-600">Net Profit</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-red-600" size={24} />
            <span className="text-sm text-red-600 font-medium">
              {reportData.expenses.count} items
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(reportData.expenses.total)}
          </div>
          <div className="text-sm text-gray-600">Total Expenses</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="text-blue-600" size={24} />
            <span className="text-sm text-blue-600 font-medium">
              {formatPeso(reportData.sales.avgOrder)}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {reportData.sales.orders}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Profit Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="text-purple-600" size={20} />
            Profit Breakdown
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Revenue</span>
              <span className="font-bold text-green-600">{formatPeso(reportData.sales.revenue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-700">Cost of Goods Sold</span>
              <span className="font-bold text-red-600">-{formatPeso(reportData.profit.cogs)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Operating Expenses</span>
              <span className="font-bold text-red-600">-{formatPeso(reportData.expenses.total)}</span>
            </div>
            <div className="border-t-2 pt-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-semibold text-gray-700">Net Profit</span>
                <span className={`font-bold text-xl ${getGrowthColor(reportData.profit.net)}`}>
                  {formatPeso(reportData.profit.net - reportData.expenses.total)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="text-red-600" size={20} />
            Top Expense Categories
          </h3>
          
          <div className="space-y-3">
            {reportData.expenses.categories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{category.category}</span>
                <span className="font-bold text-red-600">{formatPeso(category.amount)}</span>
              </div>
            ))}
            {reportData.expenses.categories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No expense data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Products and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-orange-600" size={20} />
            Top Performing Products
          </h3>
          
          <div className="space-y-3">
            {reportData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <div className="text-sm text-gray-500">{product.quantity} sold</div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600">{formatPeso(product.profit)}</span>
                  <div className="text-sm text-gray-500">{formatPeso(product.revenue)} revenue</div>
                </div>
              </div>
            ))}
            {reportData.topProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </motion.div>

        {/* Inventory Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            Inventory Overview
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Total Value</span>
              <span className="font-bold text-blue-600">{formatPeso(reportData.inventory.value)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Total Items</span>
              <span className="font-bold text-gray-600">{reportData.inventory.items}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Low Stock Items</span>
              <span className="font-bold text-yellow-600">{reportData.inventory.lowStock}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-2 text-gray-800 mb-2">
          <Activity className="text-gray-600" size={16} />
          <span className="font-medium">Data Sources:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Menu Items & Pricing
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Order Queue & POS
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Expense Tracking
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Inventory System
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BusinessReports;