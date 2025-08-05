const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Employee Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  // Business Association
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  // Contact Information
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Job Information
  position: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  hourlyRate: {
    type: Number,
    default: 0,
    min: 0
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  // Permissions (what they can access)
  permissions: {
    canUsePOS: { type: Boolean, default: true },
    canViewSales: { type: Boolean, default: false },
    canManageInventory: { type: Boolean, default: false },
    canViewReports: { type: Boolean, default: false },
    canManageOrders: { type: Boolean, default: true },
    canManageAppointments: { type: Boolean, default: true },
    canManagePatients: { type: Boolean, default: false }
  },
  // Work Schedule
  schedule: {
    monday: { start: String, end: String, isWorkday: { type: Boolean, default: true } },
    tuesday: { start: String, end: String, isWorkday: { type: Boolean, default: true } },
    wednesday: { start: String, end: String, isWorkday: { type: Boolean, default: true } },
    thursday: { start: String, end: String, isWorkday: { type: Boolean, default: true } },
    friday: { start: String, end: String, isWorkday: { type: Boolean, default: true } },
    saturday: { start: String, end: String, isWorkday: { type: Boolean, default: false } },
    sunday: { start: String, end: String, isWorkday: { type: Boolean, default: false } }
  },
  // Profile Picture
  avatar: {
    type: String,
    default: null
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Time Tracking
  currentlyCheckedIn: {
    type: Boolean,
    default: false
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  lastCheckOut: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate employee ID
employeeSchema.pre('save', async function(next) {
  if (this.isNew) {
    const business = await mongoose.model('Business').findById(this.businessId);
    const count = await this.constructor.countDocuments({ businessId: this.businessId });
    this.employeeId = `${business.businessName.substring(0, 3).toUpperCase()}-EMP-${count + 1}`;
  }
  next();
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
employeeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);