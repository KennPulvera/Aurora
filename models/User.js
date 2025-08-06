const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // SaaS Structure Fields
  userType: {
    type: String,
    enum: ['super-admin', 'business-admin', 'employee'],
    required: true
  },
  // Business Information (null for super-admin)
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: function() { return this.userType !== 'super-admin'; }
  },
  // Employee specific fields
  employeeId: {
    type: String,
    sparse: true // Only for employees
  },
  // Legacy fields (will be moved to Business model)
  industry: {
    type: String,
    enum: ['food-beverage', 'healthcare', 'retail'],
    required: function() { return this.userType === 'business-admin'; }
  },
  businessName: {
    type: String,
    required: function() { return this.userType === 'business-admin'; }
  },
  logo: {
    type: String,
    default: null
  },
  // Employee permissions (set by business admin)
  permissions: {
    canUsePOS: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canManageEmployees: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 