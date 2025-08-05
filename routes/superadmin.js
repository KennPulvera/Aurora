const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Business = require('../models/Business');
const Employee = require('../models/Employee');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Middleware to verify Super Admin
const authenticateSuperAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    if (user.userType !== 'super-admin') {
      return res.status(403).json({ message: 'Super Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Get platform statistics
router.get('/stats', authenticateSuperAdmin, async (req, res) => {
  try {
    // Get counts
    const totalBusinesses = await Business.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const activeSubscriptions = await Business.countDocuments({ 
      isActive: true, 
      'subscription.status': 'active' 
    });

    // Get revenue (mock calculation - you'd implement real billing)
    const businesses = await Business.find({ isActive: true });
    const monthlyRevenue = businesses.reduce((sum, business) => {
      return sum + (business.subscription.monthlyFee || 0);
    }, 0);

    // Get businesses by industry
    const industriesStats = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get subscription stats
    const subscriptionStats = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent businesses (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBusinesses = await Business.countDocuments({
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalBusinesses,
      totalUsers,
      totalEmployees,
      activeSubscriptions,
      monthlyRevenue,
      recentBusinesses,
      industriesStats,
      subscriptionStats
    });

  } catch (error) {
    console.error('Super Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all businesses
router.get('/businesses', authenticateSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, industry, status } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (industry) {
      query.industry = industry;
    }
    
    if (status) {
      query['subscription.status'] = status;
    }

    const businesses = await Business.find(query)
      .populate('ownerId', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Business.countDocuments(query);

    // Add employee count for each business
    const businessesWithStats = await Promise.all(
      businesses.map(async (business) => {
        const employeeCount = await Employee.countDocuments({ 
          businessId: business._id, 
          isActive: true 
        });
        
        return {
          ...business.toObject(),
          employeeCount
        };
      })
    );

    res.json({
      businesses: businessesWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific business details
router.get('/businesses/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('ownerId', 'username email userType isActive');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Get business statistics
    const employeeCount = await Employee.countDocuments({ 
      businessId: business._id, 
      isActive: true 
    });
    
    const productCount = await Product.countDocuments({ 
      businessId: business._id, 
      isActive: true 
    });
    
    const orderCount = await Order.countDocuments({ 
      businessId: business._id 
    });

    let industrySpecificCount = 0;
    if (business.industry === 'healthcare') {
      industrySpecificCount = await Patient.countDocuments({ 
        businessId: business._id, 
        isActive: true 
      });
    }

    res.json({
      ...business.toObject(),
      stats: {
        employeeCount,
        productCount,
        orderCount,
        industrySpecificCount
      }
    });

  } catch (error) {
    console.error('Get business details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update business subscription
router.put('/businesses/:id/subscription', authenticateSuperAdmin, [
  body('plan').isIn(['trial', 'basic', 'premium', 'enterprise']).withMessage('Invalid plan'),
  body('status').isIn(['active', 'inactive', 'suspended', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, status, monthlyFee, endDate } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      {
        'subscription.plan': plan,
        'subscription.status': status,
        'subscription.monthlyFee': monthlyFee,
        'subscription.endDate': endDate ? new Date(endDate) : undefined,
        employeeLimit: getEmployeeLimit(plan)
      },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({
      message: 'Subscription updated successfully',
      business
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Suspend/Activate business
router.put('/businesses/:id/status', authenticateSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Also update the business owner's status
    await User.findByIdAndUpdate(business.ownerId, { isActive });

    res.json({
      message: `Business ${isActive ? 'activated' : 'suspended'} successfully`,
      business
    });

  } catch (error) {
    console.error('Update business status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users across all businesses
router.get('/users', authenticateSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, userType } = req.query;
    
    let query = { userType: { $ne: 'super-admin' } }; // Exclude super admins
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) {
      query.userType = userType;
    }

    const users = await User.find(query)
      .populate('businessId', 'businessName industry')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Platform activity logs (simplified)
router.get('/activity', authenticateSuperAdmin, async (req, res) => {
  try {
    // This would typically come from a dedicated activity log collection
    // For now, we'll return recent business creations and user registrations
    
    const recentBusinesses = await Business.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('businessName industry createdAt')
      .populate('ownerId', 'username');

    const recentUsers = await User.find({ userType: 'business-admin' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email userType createdAt')
      .populate('businessId', 'businessName');

    const activities = [];

    // Add business activities
    recentBusinesses.forEach(business => {
      activities.push({
        type: 'business_created',
        description: `New business "${business.businessName}" registered`,
        timestamp: business.createdAt,
        details: {
          businessName: business.businessName,
          industry: business.industry,
          owner: business.ownerId?.username
        }
      });
    });

    // Add user activities
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        description: `New business admin "${user.username}" registered`,
        timestamp: user.createdAt,
        details: {
          username: user.username,
          email: user.email,
          businessName: user.businessId?.businessName
        }
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, 20)); // Return latest 20 activities

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get employee limit based on plan
function getEmployeeLimit(plan) {
  const limits = {
    trial: 5,
    basic: 15,
    premium: 50,
    enterprise: 200
  };
  return limits[plan] || 5;
}

module.exports = router;