import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, 
  Scan, Wifi, WifiOff, Smartphone, DollarSign,
  Calculator, Percent, Edit3, Check, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // New enhanced POS features
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [splitPayment, setSplitPayment] = useState({
    enabled: false,
    cash: 0,
    card: 0,
    ewallet: 0
  });
  const [discount, setDiscount] = useState({ type: 'none', value: 0 });
  const [editingPrice, setEditingPrice] = useState(null);
  const [manualPrice, setManualPrice] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProducts();
    
    // Load offline orders from localStorage
    const savedOfflineOrders = localStorage.getItem('offlineOrders');
    if (savedOfflineOrders) {
      setOfflineOrders(JSON.parse(savedOfflineOrders));
    }
    
    // Online/offline detection
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineOrders();
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products?industry=${user.industry}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  // Offline mode functions
  const syncOfflineOrders = async () => {
    if (offlineOrders.length === 0) return;
    
    try {
      for (const order of offlineOrders) {
        await axios.post('/api/orders', order);
      }
      setOfflineOrders([]);
      localStorage.removeItem('offlineOrders');
      toast.success(`Synced ${offlineOrders.length} offline orders`);
    } catch (error) {
      console.error('Error syncing offline orders:', error);
      toast.error('Failed to sync some offline orders');
    }
  };

  const saveOfflineOrder = (orderData) => {
    const newOfflineOrders = [...offlineOrders, { ...orderData, timestamp: new Date().toISOString() }];
    setOfflineOrders(newOfflineOrders);
    localStorage.setItem('offlineOrders', JSON.stringify(newOfflineOrders));
  };

  // Barcode scanner functions
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addToCart(product);
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.error('Product not found');
    }
    
    setBarcodeInput('');
    setShowBarcodeInput(false);
  };

  // Discount functions
  const calculateDiscount = (subtotal) => {
    if (discount.type === 'none') return 0;
    if (discount.type === 'percentage') return (subtotal * discount.value) / 100;
    if (discount.type === 'fixed') return discount.value;
    return 0;
  };

  // Manual price editing
  const handlePriceEdit = (itemId, newPrice) => {
    setCart(cart.map(item =>
      item._id === itemId
        ? { ...item, customPrice: parseFloat(newPrice) || item.price }
        : item
    ));
    setEditingPrice(null);
    setManualPrice('');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.customPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getDiscountAmount = () => {
    return calculateDiscount(getCartTotal());
  };

  const getTax = () => {
    const discountedSubtotal = getCartTotal() - getDiscountAmount();
    return discountedSubtotal * 0.12; // 12% VAT in Philippines
  };

  const getGrandTotal = () => {
    return getCartTotal() - getDiscountAmount() + getTax();
  };



  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate split payment
    if (splitPayment.enabled) {
      const paymentTotal = splitPayment.cash + splitPayment.card + splitPayment.ewallet;
      const grandTotal = getGrandTotal();
      if (Math.abs(paymentTotal - grandTotal) > 0.01) {
        toast.error('Payment amounts do not match total');
        return;
      }
    }

    const orderData = {
      customer: customerInfo,
      items: cart.map(item => ({
        product: item._id,
        quantity: item.quantity,
        customPrice: item.customPrice || item.price,
        originalPrice: item.price
      })),
      subtotal: getCartTotal(),
      discount: getDiscountAmount(),
      discountType: discount.type,
      discountValue: discount.value,
      tax: getTax(),
      total: getGrandTotal(),
      paymentMethod: splitPayment.enabled ? 'split' : paymentMethod,
      paymentDetails: splitPayment.enabled ? splitPayment : { [paymentMethod]: getGrandTotal() },
      industry: user.industry,
      orderType: 'walk-in',
      timestamp: new Date().toISOString()
    };

    try {
      if (isOffline) {
        // Save order offline
        saveOfflineOrder(orderData);
        toast.success('Order saved offline - will sync when online');
      } else {
        // Process order online
        await axios.post('/api/orders', orderData);
        toast.success('Order completed successfully!');
      }
      
      // Clear cart and reset state
      setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setPaymentMethod('cash');
      setSplitPayment({ enabled: false, cash: 0, card: 0, ewallet: 0 });
      setDiscount({ type: 'none', value: 0 });
      setShowCheckout(false);
      
    } catch (error) {
      console.error('Checkout error:', error);
      // Save offline as fallback
      saveOfflineOrder(orderData);
      toast.error('Failed to process online - saved offline');
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading POS system...</p>
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
            <ShoppingCart className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
            <p className="text-gray-600">Point of Sale</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Offline Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isOffline ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span className="text-sm font-medium">
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
            {offlineOrders.length > 0 && (
              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                {offlineOrders.length} pending
              </span>
            )}
          </div>
          
          {/* Barcode Scanner Button */}
          <button
            onClick={() => setShowBarcodeInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Scan size={16} />
            <span>Scan Item</span>
          </button>
        </div>
      </div>

      {/* Barcode Input Modal */}
      {showBarcodeInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl shadow-xl w-96"
          >
            <h3 className="text-lg font-semibold mb-4">Scan or Enter Barcode</h3>
            <form onSubmit={handleBarcodeSubmit}>
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Enter barcode..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBarcodeInput(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
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
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <motion.div
                key={product._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-300 transition-colors"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Package className="text-gray-400" size={24} />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1 text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  <p className="font-semibold text-primary-600">{formatPeso(product.price)}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stockQuantity}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={20} />
            Cart ({cart.length})
          </h3>

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      {editingPrice === item._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={manualPrice}
                            onChange={(e) => setManualPrice(e.target.value)}
                            className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded"
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={() => handlePriceEdit(item._id, manualPrice)}
                            className="w-4 h-4 text-green-600 hover:text-green-700"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPrice(null);
                              setManualPrice('');
                            }}
                            className="w-4 h-4 text-red-600 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-gray-500">
                            {formatPeso(item.customPrice || item.price)} each
                            {item.customPrice && item.customPrice !== item.price && (
                              <span className="line-through text-gray-400 ml-1">
                                {formatPeso(item.price)}
                              </span>
                            )}
                          </p>
                          <button
                            onClick={() => {
                              setEditingPrice(item._id);
                              setManualPrice((item.customPrice || item.price).toString());
                            }}
                            className="w-4 h-4 text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              {/* Discount Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Discount</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <select
                    value={discount.type}
                    onChange={(e) => setDiscount({ ...discount, type: e.target.value, value: 0 })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                  {discount.type !== 'none' && (
                    <input
                      type="number"
                      value={discount.value}
                      onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                      min="0"
                      step={discount.type === 'percentage' ? '1' : '0.01'}
                      max={discount.type === 'percentage' ? '100' : undefined}
                    />
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPeso(getCartTotal())}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPeso(getDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax (12%):</span>
                  <span>{formatPeso(getTax())}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatPeso(getGrandTotal())}</span>
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-4 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Checkout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Checkout</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => {
                      setPaymentMethod('cash');
                      setSplitPayment({ ...splitPayment, enabled: false });
                    }}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      paymentMethod === 'cash' && !splitPayment.enabled 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign size={16} />
                    <span className="text-sm">Cash</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('card');
                      setSplitPayment({ ...splitPayment, enabled: false });
                    }}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      paymentMethod === 'card' && !splitPayment.enabled 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard size={16} />
                    <span className="text-sm">Card</span>
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMethod('ewallet');
                      setSplitPayment({ ...splitPayment, enabled: false });
                    }}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      paymentMethod === 'ewallet' && !splitPayment.enabled 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone size={16} />
                    <span className="text-sm">E-Wallet</span>
                  </button>
                  <button
                    onClick={() => setSplitPayment({ ...splitPayment, enabled: !splitPayment.enabled })}
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      splitPayment.enabled 
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Calculator size={16} />
                    <span className="text-sm">Split Pay</span>
                  </button>
                </div>

                {/* Split Payment Details */}
                {splitPayment.enabled && (
                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">Split Payment</span>
                      <span className="text-xs text-gray-500">Total: {formatPeso(getGrandTotal())}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Cash</label>
                        <input
                          type="number"
                          value={splitPayment.cash}
                          onChange={(e) => setSplitPayment({ ...splitPayment, cash: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Card</label>
                        <input
                          type="number"
                          value={splitPayment.card}
                          onChange={(e) => setSplitPayment({ ...splitPayment, card: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">E-Wallet</label>
                        <input
                          type="number"
                          value={splitPayment.ewallet}
                          onChange={(e) => setSplitPayment({ ...splitPayment, ewallet: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-center mt-2">
                      Payment Total: {formatPeso(splitPayment.cash + splitPayment.card + splitPayment.ewallet)}
                      {Math.abs((splitPayment.cash + splitPayment.card + splitPayment.ewallet) - getGrandTotal()) > 0.01 && (
                        <span className="text-red-600 ml-2">
                          (Difference: {formatPeso(Math.abs((splitPayment.cash + splitPayment.card + splitPayment.ewallet) - getGrandTotal()))})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-lg font-semibold text-center">
                Total: {formatPeso(getGrandTotal())}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Complete Sale
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default POS;