import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, ChefHat, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders/queue/${user.industry}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <AlertCircle size={16} />;
      case 'preparing':
        return <ChefHat size={16} />;
      case 'ready':
        return <CheckCircle size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getTimeElapsed = (createdAt) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMs = now - orderTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const readyOrders = orders.filter(order => order.status === 'ready');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Queue</h1>
          <p className="text-gray-600">Manage and track order status</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary flex items-center gap-2"
        >
          <Clock size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <ChefHat className="text-primary-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preparing</p>
              <p className="text-2xl font-bold text-orange-600">{preparingOrders.length}</p>
            </div>
            <ChefHat className="text-orange-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </motion.div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('preparing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'preparing'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setSelectedStatus('ready')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === 'ready'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ready
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-soft p-6 border-l-4 border-primary-600"
          >
            {/* Order Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {order.customer.name}
                </span>
              </div>
              <p className="text-sm text-gray-600">{order.customer.phone}</p>
              {order.orderType && (
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {order.orderType}
                </span>
              )}
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="text-gray-900">${item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-lg text-primary-600">${order.total}</span>
              </div>
            </div>

            {/* Time Elapsed */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Elapsed: {getTimeElapsed(order.createdAt)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'confirmed')}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {order.status === 'confirmed' && (
                <button
                  onClick={() => updateOrderStatus(order._id, 'preparing')}
                  className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Start Preparing
                </button>
              )}
              
              {order.status === 'preparing' && (
                <button
                  onClick={() => updateOrderStatus(order._id, 'ready')}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark Ready
                </button>
              )}
              
              {order.status === 'ready' && (
                <button
                  onClick={() => updateOrderStatus(order._id, 'delivered')}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Mark Delivered
                </button>
              )}
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                <strong>Notes:</strong> {order.notes}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {selectedStatus === 'all' 
              ? 'No orders in the queue at the moment.'
              : `No ${selectedStatus} orders at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderQueue; 