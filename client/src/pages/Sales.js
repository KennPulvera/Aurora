import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingCart, Calendar, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { formatPeso } from '../utils/currency';

const Sales = () => {
  const [salesData, setSalesData] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod] = useState('today');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchSalesData();
    fetchRecentOrders();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const fetchSalesData = async () => {
    try {
      const ordersResponse = await axios.get(`/api/orders?industry=${user.industry}`);
      const orders = ordersResponse.data;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 30);

      // Calculate sales for different periods
      const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
      const weekOrders = orders.filter(order => new Date(order.createdAt) >= weekStart);
      const monthOrders = orders.filter(order => new Date(order.createdAt) >= monthStart);

      const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const weekSales = weekOrders.reduce((sum, order) => sum + order.total, 0);
      const monthSales = monthOrders.reduce((sum, order) => sum + order.total, 0);

      // Calculate average order value
      const avgOrderValue = orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0;

      // Get top products (simplified - would need proper product aggregation in real app)
      const productMap = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          if (productMap[item.product.name]) {
            productMap[item.product.name].quantity += item.quantity;
            productMap[item.product.name].revenue += item.total;
          } else {
            productMap[item.product.name] = {
              name: item.product.name,
              quantity: item.quantity,
              revenue: item.total
            };
          }
        });
      });

      const topProducts = Object.values(productMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setSalesData({
        todaySales,
        weekSales,
        monthSales,
        totalOrders: orders.length,
        avgOrderValue,
        topProducts
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await axios.get(`/api/orders?industry=${user.industry}`);
      setRecentOrders(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="text-primary-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600">Track your sales performance</p>
        </div>
      </div>

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm text-green-600 font-medium">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.todaySales)}
          </div>
          <div className="text-sm text-gray-600">Today's Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-blue-600" size={24} />
            <span className="text-sm text-blue-600 font-medium">7 Days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.weekSales)}
          </div>
          <div className="text-sm text-gray-600">This Week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="text-purple-600" size={24} />
            <span className="text-sm text-purple-600 font-medium">30 Days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.monthSales)}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="text-orange-600" size={24} />
            <span className="text-sm text-orange-600 font-medium">AVG</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(salesData.avgOrderValue)}
          </div>
          <div className="text-sm text-gray-600">Avg Order Value</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
          
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{order.orderNumber}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customer?.name || 'Walk-in'} • {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{formatPeso(order.total)}</div>
                    <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          
          <div className="space-y-3">
            {salesData.topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No product data yet</p>
            ) : (
              salesData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.quantity} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{formatPeso(product.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{salesData.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {salesData.topProducts.reduce((sum, p) => sum + p.quantity, 0)}
            </div>
            <div className="text-sm text-gray-600">Items Sold</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatPeso(salesData.monthSales)}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {salesData.topProducts.length}
            </div>
            <div className="text-sm text-gray-600">Active Products</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sales;