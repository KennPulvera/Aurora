const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// Get all orders (with industry filter)
router.get('/', async (req, res) => {
  try {
    const { industry, status, date } = req.query;
    let query = {};

    if (industry) {
      query.industry = industry;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price sku')
      .populate('assignedTo', 'username')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price sku description')
      .populate('assignedTo', 'username');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', [
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('industry').isIn(['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services']).withMessage('Invalid industry')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customer,
      items,
      tax,
      discount,
      notes,
      industry,
      orderType,
      assignedTo
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.product} not found` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    const finalTax = tax || 0;
    const finalDiscount = discount || 0;
    const total = subtotal + finalTax - finalDiscount;

    const order = new Order({
      customer,
      items: orderItems,
      subtotal,
      tax: finalTax,
      discount: finalDiscount,
      total,
      notes,
      industry,
      orderType: orderType || 'walk-in',
      assignedTo
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price sku')
      .populate('assignedTo', 'username');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price sku')
      .populate('assignedTo', 'username');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status
router.patch('/:id/payment', [
  body('paymentMethod').isIn(['cash', 'card', 'online']).withMessage('Invalid payment method'),
  body('paymentStatus').isIn(['paid', 'failed']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentMethod = req.body.paymentMethod;
    order.paymentStatus = req.body.paymentStatus;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price sku')
      .populate('assignedTo', 'username');

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get orders by status (for order queue)
router.get('/queue/:industry', async (req, res) => {
  try {
    const { status } = req.query;
    let query = { industry: req.params.industry };

    if (status) {
      query.status = status;
    } else {
      // Default to active orders
      query.status = { $in: ['pending', 'confirmed', 'preparing'] };
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price sku')
      .populate('assignedTo', 'username')
      .sort({ createdAt: 1 });

    res.json(orders);
  } catch (error) {
    console.error('Get order queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats/:industry', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = { industry: req.params.industry };

    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalOrders = await Order.countDocuments(dateQuery);
    const totalRevenue = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const dailyRevenue = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      dailyRevenue
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 