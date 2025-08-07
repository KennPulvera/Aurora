import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, ChefHat, Package, 
  Timer, ArrowRight, Hash, User, DollarSign, RefreshCw 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
// Removed complex financial utils - using direct localStorage now

// Individual timer component that doesn't cause parent re-renders
const OrderTimer = ({ order, type = 'badge' }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const getDuration = () => {
    const orderTime = typeof order.timestamp === 'string' ? new Date(order.timestamp).getTime() : order.timestamp;
    const totalSeconds = Math.floor((currentTime - orderTime) / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (order.status === 'preparing' && order.startedAt) {
      const prepStartTime = typeof order.startedAt === 'string' ? new Date(order.startedAt).getTime() : order.startedAt;
      const prepSeconds = Math.floor((currentTime - prepStartTime) / 1000);
      const prepMinutes = Math.floor(prepSeconds / 60);
      const prepSecs = prepSeconds % 60;
      return `${totalMinutes}:${seconds.toString().padStart(2, '0')} total, ${prepMinutes}:${prepSecs.toString().padStart(2, '0')} preparing`;
    }
    
    if (order.status === 'ready' && order.completedAt) {
      const completedTime = typeof order.completedAt === 'string' ? new Date(order.completedAt).getTime() : order.completedAt;
      const readySeconds = Math.floor((currentTime - completedTime) / 1000);
      const readyMinutes = Math.floor(readySeconds / 60);
      const readySecs = readySeconds % 60;
      return `${totalMinutes}:${seconds.toString().padStart(2, '0')} total, ready ${readyMinutes}:${readySecs.toString().padStart(2, '0')} ago`;
    }
    
    return `${totalMinutes}:${seconds.toString().padStart(2, '0')} in queue`;
  };
  
  const getTimerColor = () => {
    const orderTime = typeof order.timestamp === 'string' ? new Date(order.timestamp).getTime() : order.timestamp;
    const totalMinutes = Math.floor((currentTime - orderTime) / (1000 * 60));
    
    if (order.status === 'ready') {
      const completedTime = order.completedAt ? (typeof order.completedAt === 'string' ? new Date(order.completedAt).getTime() : order.completedAt) : orderTime;
      const readyMinutes = Math.floor((currentTime - completedTime) / (1000 * 60));
      if (readyMinutes > 10) return 'bg-red-100 text-red-700 border-red-200';
      if (readyMinutes > 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-green-100 text-green-700 border-green-200';
    }
    
    if (order.status === 'preparing') {
      const prepTime = order.startedAt ? Math.floor((currentTime - (typeof order.startedAt === 'string' ? new Date(order.startedAt).getTime() : order.startedAt)) / (1000 * 60)) : 0;
      if (prepTime > 15) return 'bg-red-100 text-red-700 border-red-200';
      if (prepTime > 10) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    
    if (totalMinutes > 10) return 'bg-red-100 text-red-700 border-red-200';
    if (totalMinutes > 5) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  if (type === 'large') {
    return (
      <div className="mb-3">
        <div className={`text-center py-2 px-3 rounded-lg border-2 transition-colors duration-300 ${getTimerColor()}`}>
          <div className="text-xs opacity-75 mb-1">Time Elapsed</div>
          <div className="text-lg font-mono font-bold">
            {getDuration()}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full border transition-colors duration-300 ${getTimerColor()}`}>
      ⏱️ {getDuration()}
    </span>
  );
};

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Debug: Log when orders state changes (disabled for production)
  // useEffect(() => {
  //   console.log('Orders updated:', orders.length, 'orders');
  // }, [orders]);

  // const user = JSON.parse(localStorage.getItem('user') || '{}'); // Reserved for future API use

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 5 seconds for real-time updates
    const interval = setInterval(fetchOrders, 5000);
    
    // Refresh when window comes into focus
    const handleFocus = () => fetchOrders();
    window.addEventListener('focus', handleFocus);
    
    // Listen for new orders from POS
    const handleNewOrder = (event) => {
      // console.log('New order received from POS:', event.detail); // Debug disabled for production
      setLastUpdate(new Date());
      fetchOrders(); // Immediately refresh when new order is created
      toast.success(`New order #${event.detail.id} received!`);
    };
    window.addEventListener('orderCreated', handleNewOrder);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('orderCreated', handleNewOrder);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      // For now, always use localStorage (since API isn't set up yet)
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Only show orders that are not completed
      const activeOrders = localOrders.filter(order => order.status !== 'completed');
      
      setOrders(activeOrders);
      setLastUpdate(new Date());
      
      // TODO: Re-enable API when backend is ready
      // const response = await axios.get(`/api/orders/queue/${user.industry}`);
      // setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };



  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Get all orders from localStorage (including completed ones)
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Update the specific order in the complete list
      const updatedAllOrders = allOrders.map(order => 
        order.id === orderId ? { 
          ...order, 
          status: newStatus,
          ...(newStatus === 'preparing' && { startedAt: new Date().toISOString() }),
          ...(newStatus === 'ready' && { completedAt: new Date().toISOString() })
        } : order
      );
      
      // Save complete updated list to localStorage
      localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
      
      // Update local display state (filter out completed orders for queue display)
      const activeOrders = updatedAllOrders.filter(order => order.status !== 'completed');
      setOrders(activeOrders);
      
              // Simplified - financial updates handled by event listeners
      
      // Trigger event for other components that might be listening
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { orderId, newStatus } 
      }));
      
      // Also trigger financial update event
      window.dispatchEvent(new CustomEvent('financialUpdate', { 
        detail: { type: 'orderStatusChange', orderId, newStatus }
      }));
      
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      } catch (apiError) {
        // console.log('API not available, using localStorage only'); // Debug disabled
      }
      
      toast.success(`Order moved to ${newStatus.replace('-', ' ')}`);
      // console.log(`Order ${orderId} moved to ${newStatus}`); // Debug disabled
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      // Revert the optimistic update
      fetchOrders();
    }
  };





  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const { inQueue, preparing, ready } = useMemo(() => {
    const inQueue = orders.filter(order => order.status === 'in-queue');
    const preparing = orders.filter(order => order.status === 'preparing');
    const ready = orders.filter(order => order.status === 'ready');

          // Debug disabled for production
      // console.log('Order status breakdown:', {
      //   total: orders.length,
      //   inQueue: inQueue.length,
      //   preparing: preparing.length,
      //   ready: ready.length,
      //   orders: orders.map(o => ({ id: o.id, status: o.status }))
      // });

    return { inQueue, preparing, ready };
  }, [orders]);

  const StatusColumn = ({ title, icon: Icon, color, orders, status, nextStatus, canMove = true }) => (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`${color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={24} />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
            {orders.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon size={48} className="mx-auto mb-3 opacity-30" />
            <p>No orders in this stage</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={`${order.id}-${order.timestamp}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {order.type === 'table' ? (
                        <Hash className="text-gray-600" size={16} />
                      ) : (
                        <User className="text-gray-600" size={16} />
                      )}
                      <span className="font-semibold text-gray-900">
                        {order.type === 'table' ? order.customer : `Takeout - ${order.customer}`}
                      </span>
                    </div>
                    <OrderTimer order={order} />
                  </div>

                  {/* Customer Name (for non-table orders) */}
                  {order.type !== 'table' && (
                    <div className="text-sm text-gray-600 mb-2">
                      Customer: {order.customer}
                    </div>
                  )}

                  {/* Timer Display */}
                  <OrderTimer order={order} type="large" />

                  {/* Items */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-600 mb-1">Items:</div>
                    <div className="flex flex-wrap gap-1">
                      {order.items.map((item, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign size={14} />
                      {formatCurrency(order.total)}
                    </div>

                    {/* Estimated Time or Action Button */}
                    <div className="flex items-center gap-2">
                      {order.estimatedTime > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          <Timer size={12} />
                          {order.estimatedTime}m
                        </div>
                      )}
                      
                      {canMove && nextStatus && (
                        nextStatus === 'completed' ? (
                          <button
                            onClick={() => {
                              // Update order status to completed instead of removing it
                              const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                              const updatedAllOrders = allOrders.map(o => 
                                o.id === order.id 
                                  ? { ...o, status: 'completed', completedAt: new Date().toISOString() }
                                  : o
                              );
                              
                              // Save updated orders to localStorage
                              localStorage.setItem('orders', JSON.stringify(updatedAllOrders));
                              
                              // Update financial summaries
                              // Simplified - financial updates handled by event listeners
                              
                              // Remove from queue display (but keep in localStorage for sales tracking)
                              const updatedOrders = orders.filter(o => o.id !== order.id);
                              setOrders(updatedOrders);
                              
                              // Trigger events
                              window.dispatchEvent(new CustomEvent('orderUpdated', { 
                                detail: { orderId: order.id, newStatus: 'completed' } 
                              }));
                              window.dispatchEvent(new CustomEvent('financialUpdate', { 
                                detail: { type: 'orderCompleted', orderId: order.id }
                              }));
                              
                              toast.success('Order completed and recorded in sales');
                              // console.log('Order completed:', order.id, 'Total:', order.total); // Debug disabled
                            }}
                            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                          >
                            Complete
                            <ArrowRight size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className="flex items-center gap-1 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-primary-600 transition-colors"
                          >
                            Next
                            <ArrowRight size={12} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-50 min-h-screen"
        >
            {/* Header */}
      <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
            <div className="flex items-center gap-4">
                          <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Queue</h1>
                <p className="text-gray-600">Real-time order management and status tracking</p>
                <p className="text-sm text-gray-500">Last updated: {lastUpdate.toLocaleTimeString()}</p>
              </div>
        <div className="flex gap-2">
          <button
                  onClick={() => {
                    setLastUpdate(new Date());
                    fetchOrders();
                    toast.success('Orders refreshed');
                  }}
                  className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
          </button>
          <button
                  onClick={() => {
                    const orders = localStorage.getItem('orders');
                    // Debug disabled for production
                    // console.log('Raw localStorage orders:', orders);
                    // if (orders) {
                    //   console.log('Parsed orders:', JSON.parse(orders));
                    // }
                    toast(`Found ${orders ? JSON.parse(orders).length : 0} orders in localStorage`);
                  }}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Debug
          </button>
          <button
                  onClick={() => {
                    localStorage.removeItem('orders');
                    setOrders([]);
                    toast.success('All orders cleared');
                  }}
                  className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Clear All
          </button>
        </div>
              </div>
            </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{inQueue.length}</div>
              <div className="text-sm text-gray-500">In Queue</div>
              </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{preparing.length}</div>
              <div className="text-sm text-gray-500">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ready.length}</div>
              <div className="text-sm text-gray-500">Ready</div>
              </div>
            </div>
              </div>
            </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatusColumn
          title="In the Queue"
          icon={Clock}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
          orders={inQueue}
          status="in-queue"
          nextStatus="preparing"
        />
        
        <StatusColumn
          title="Now Preparing"
          icon={ChefHat}
          color="bg-gradient-to-r from-blue-500 to-indigo-500"
          orders={preparing}
          status="preparing"
          nextStatus="ready"
        />
        
        <StatusColumn
          title="Ready for Pickup"
          icon={Package}
          color="bg-gradient-to-r from-green-500 to-emerald-500"
          orders={ready}
          status="ready"
          nextStatus="completed"
          canMove={true}
        />
              </div>
          </motion.div>
  );
};

export default OrderQueue; 