import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, Trash2, DollarSign, 
  User, Hash, Coffee, Utensils, Package, Search, CreditCard, Banknote
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
// Removed complex financial utils - using direct localStorage now

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderType, setOrderType] = useState('takeout'); // takeout or table
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products?industry=${user.industry}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use demo products for cafe
      setProducts(getDemoProducts());
    } finally {
      setLoading(false);
    }
  };

  const getDemoProducts = () => {
    return [
      { id: 1, name: 'Americano', price: 125, category: 'Coffee', stock: 50 },
      { id: 2, name: 'Cappuccino', price: 150, category: 'Coffee', stock: 45 },
      { id: 3, name: 'Latte', price: 160, category: 'Coffee', stock: 40 },
      { id: 4, name: 'Espresso', price: 100, category: 'Coffee', stock: 60 },
      { id: 5, name: 'Mocha', price: 175, category: 'Coffee', stock: 30 },
      { id: 6, name: 'Frappuccino', price: 200, category: 'Cold Drinks', stock: 25 },
      { id: 7, name: 'Iced Tea', price: 90, category: 'Cold Drinks', stock: 35 },
      { id: 8, name: 'Croissant', price: 75, category: 'Pastry', stock: 20 },
      { id: 9, name: 'Muffin', price: 60, category: 'Pastry', stock: 25 },
      { id: 10, name: 'Sandwich', price: 125, category: 'Food', stock: 15 },
      { id: 11, name: 'Pancakes', price: 175, category: 'Food', stock: 10 },
      { id: 12, name: 'Caesar Salad', price: 225, category: 'Food', stock: 12 }
    ];
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        productId: product.id,
        id: `cart-${product.id}-${Date.now()}`, // Unique cart item ID
        quantity: 1 
      }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(cart.map(item =>
        item.id === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const generateOrderId = () => {
    return Math.random().toString(36).substr(2, 4).toLowerCase();
  };

  const createOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (orderType === 'takeout' && !customerName.trim()) {
      toast.error('Customer name is required for takeout orders');
      return;
    }

    if (orderType === 'table' && !tableNumber.trim()) {
      toast.error('Table number/name is required for dine-in orders');
      return;
    }

    const orderId = generateOrderId();
    const orderData = {
      id: orderId,
      type: orderType,
      customer: orderType === 'takeout' ? customerName : tableNumber,
      items: cart.map(item => item.name),
      itemDetails: cart,
      total: calculateTotal(),
      status: 'in-queue',
      timestamp: new Date(),
      paymentMethod: paymentMethod,
      estimatedTime: cart.length * 3 // 3 minutes per item estimate
    };

    try {
      // Save order directly to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      // console.log('Order saved:', orderData); // Debug disabled for production

      // Trigger custom event to notify Order Queue
      window.dispatchEvent(new CustomEvent('orderCreated', { 
        detail: orderData 
      }));

      // Trigger financial update event
      window.dispatchEvent(new CustomEvent('financialUpdate', { 
        detail: { type: 'sale', amount: orderData.total, orderId: orderData.id }
      }));

      toast.success(`Order #${orderId} created successfully!`);
      
      // Clear the form
      setCart([]);
      setCustomerName('');
      setTableNumber('');
      
      // Print order details
      // console.log('Order created:', orderData); // Debug disabled for production
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">POS System</h1>
              <p className="text-gray-600">Point of Sale for {user.businessName || 'Your Business'}</p>
            </div>
            <button
              onClick={() => {
                // Create a test order
                const testOrder = {
                  id: 'test-' + Date.now(),
                  type: 'takeout',
                  customer: 'Test Customer',
                  items: ['Americano', 'Croissant'],
                  total: 200,
                  status: 'in-queue',
                  timestamp: new Date(),
                  paymentMethod: 'cash',
                  estimatedTime: 6
                };
                
                // Save directly to localStorage
                const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                existingOrders.push(testOrder);
                localStorage.setItem('orders', JSON.stringify(existingOrders));
                
                // Trigger custom event to notify Order Queue
                window.dispatchEvent(new CustomEvent('orderCreated', { 
                  detail: testOrder 
                }));
                
                // Trigger financial update event
                window.dispatchEvent(new CustomEvent('financialUpdate', { 
                  detail: { type: 'sale', amount: testOrder.total, orderId: testOrder.id }
                }));
                
                // console.log('Test order created:', testOrder); // Debug disabled for production
                toast.success('Test order created!');
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Create Test Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-3 mx-auto">
                    {product.category === 'Coffee' ? <Coffee className="text-primary-600" size={24} /> :
                     product.category === 'Food' ? <Utensils className="text-primary-600" size={24} /> :
                     <Package className="text-primary-600" size={24} />}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 text-center mb-1 text-sm">{product.name}</h3>
                  <p className="text-primary-600 font-bold text-center text-sm">{formatCurrency(product.price)}</p>
                  
                  {product.stock <= 5 && (
                    <p className="text-red-500 text-xs text-center mt-1">Low stock: {product.stock}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
              {/* Cart Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-primary-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-900">Current Order</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">{cart.length} items</p>
              </div>

              {/* Order Type Selection */}
              <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('takeout')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      orderType === 'takeout'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} />
                    Takeout
                  </button>
                  <button
                    onClick={() => setOrderType('table')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      orderType === 'table'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Hash size={16} />
                    Dine-in
                  </button>
                </div>
              </div>

              {/* Customer/Table Info */}
              <div className="p-4 border-b border-gray-200">
                {orderType === 'takeout' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Table Number/Name</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Table 1, VIP Room, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="p-4 max-h-64 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                          <p className="text-primary-600 text-sm">{formatCurrency(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 text-primary-600"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 text-red-600 ml-2"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        paymentMethod === 'cash'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Banknote size={16} />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        paymentMethod === 'card'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <CreditCard size={16} />
                      Card
                    </button>
                  </div>
                </div>
              )}

              {/* Total and Checkout */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  
                  <button
                    onClick={createOrder}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DollarSign size={20} />
                    Complete Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default POS;