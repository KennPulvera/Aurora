import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';
import axios from 'axios';
import { formatPeso } from '../utils/currency';

const Reports = () => {
  const [reportData, setReportData] = useState({
    sales: [],
    products: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`/api/orders?industry=${user.industry}`),
        axios.get(`/api/products?industry=${user.industry}`)
      ]);

      setReportData({
        orders: ordersRes.data || [],
        products: productsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = () => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredOrders = reportData.orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return { totalSales, totalOrders, avgOrderValue, orders: filteredOrders };
  };

  const generateProductReport = () => {
    const productSales = {};
    
    reportData.orders.forEach(order => {
      order.items?.forEach(item => {
        const productName = item.product?.name || 'Unknown Product';
        if (productSales[productName]) {
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += item.total;
        } else {
          productSales[productName] = {
            name: productName,
            quantity: item.quantity,
            revenue: item.total
          };
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const downloadReport = (reportType) => {
    let reportContent = '';
    
    if (reportType === 'sales') {
      const salesReport = generateSalesReport();
      reportContent = `Sales Report - ${selectedPeriod}\n\n`;
      reportContent += `Total Sales: ${formatPeso(salesReport.totalSales)}\n`;
      reportContent += `Total Orders: ${salesReport.totalOrders}\n`;
      reportContent += `Average Order Value: ${formatPeso(salesReport.avgOrderValue)}\n\n`;
      reportContent += `Recent Orders:\n`;
      salesReport.orders.forEach(order => {
        reportContent += `${order.orderNumber} - ${formatPeso(order.total)} - ${new Date(order.createdAt).toLocaleDateString()}\n`;
      });
    } else if (reportType === 'products') {
      const productReport = generateProductReport();
      reportContent = `Product Performance Report\n\n`;
      productReport.forEach((product, index) => {
        reportContent += `${index + 1}. ${product.name} - ${product.quantity} sold - ${formatPeso(product.revenue)}\n`;
      });
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const salesReport = generateSalesReport();
  const productReport = generateProductReport();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
          <FileText className="text-primary-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Business analytics and reports</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sales Report</h3>
            <button
              onClick={() => downloadReport('sales')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Download size={16} />
              Download
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatPeso(salesReport.totalSales)}</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{salesReport.totalOrders}</div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatPeso(salesReport.avgOrderValue)}</div>
              <div className="text-sm text-gray-600">Avg Order</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Recent Orders</h4>
            {salesReport.orders.slice(0, 5).map(order => (
              <div key={order._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{order.orderNumber}</span>
                <span className="text-sm font-medium text-green-600">{formatPeso(order.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Product Performance</h3>
            <button
              onClick={() => downloadReport('products')}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Download size={16} />
              Download
            </button>
          </div>

          <div className="space-y-3">
            {productReport.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No product data available</p>
            ) : (
              productReport.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.quantity} units sold</div>
                    </div>
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

      {/* Inventory Report */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Inventory Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{reportData.products.length}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {reportData.products.filter(p => p.stockQuantity <= p.minStockLevel).length}
            </div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {reportData.products.filter(p => p.stockQuantity === 0).length}
            </div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatPeso(reportData.products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0))}
            </div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;