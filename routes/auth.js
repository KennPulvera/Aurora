const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Business = require('../models/Business');
const Employee = require('../models/Employee');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Register new business (Business Admin)
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('industry').isIn(['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services']).withMessage('Invalid industry'),
  body('businessName').notEmpty().withMessage('Business name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, industry, businessName, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Check if business name already exists
    const existingBusiness = await Business.findOne({ businessName });
    if (existingBusiness) {
      return res.status(400).json({
        message: 'Business name is already taken'
      });
    }

    // Check if this is the very first user (make them super-admin)
    const userCount = await User.countDocuments();
    const userType = userCount === 0 ? 'super-admin' : 'business-admin';

    // Create business first (only if not super-admin)
    let business = null;
    if (userType === 'business-admin') {
      business = new Business({
        businessName,
        industry,
        email,
        phone,
        address,
        ownerId: null // Will be set after user creation
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      userType,
      businessId: business ? business._id : null,
      industry: userType === 'business-admin' ? industry : undefined,
      businessName: userType === 'business-admin' ? businessName : undefined
    });

    await user.save();

    // Update business with owner ID and save
    if (business) {
      business.ownerId = user._id;
      await business.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        businessId: user.businessId,
        industry: user.industry 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      industry: user.industry,
      businessName: user.businessName,
      businessId: user.businessId
    };

    res.status(201).json({
      message: userType === 'super-admin' ? 'Super Admin account created successfully' : 'Business registered successfully',
      token,
      user: responseUser,
      business: business ? {
        id: business._id,
        name: business.businessName,
        industry: business.industry,
        subscription: business.subscription
      } : null
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        businessId: user.businessId,
        industry: user.industry, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        businessId: user.businessId,
        industry: user.industry,
        businessName: user.businessName,
        role: user.role,
        logo: user.logo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        businessId: user.businessId,
        industry: user.industry,
        businessName: user.businessName,
        role: user.role,
        logo: user.logo
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Promote user role (Admin only)
router.patch('/promote/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['employee', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        industry: user.industry,
        businessName: user.businessName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, upload.single('logo'), [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('industry').isIn(['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services']).withMessage('Invalid industry')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, businessName, industry } = req.body;
    const userId = req.user.userId;

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } },
        { $or: [{ email }, { username }] }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username or email is already taken by another user'
      });
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      businessName,
      industry,
      updatedAt: new Date()
    };

    // Handle logo upload
    if (req.file) {
      // Remove old logo file if it exists
      const user = await User.findById(userId);
      if (user.logo && user.logo.startsWith('/uploads/')) {
        const oldLogoPath = path.join(__dirname, '..', user.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 