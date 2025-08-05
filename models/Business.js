const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    enum: ['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services'],
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  // Contact Information
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Philippines' }
  },
  // Business Admin (Owner)
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Subscription Information
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        // 30-day trial by default
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    },
    monthlyFee: {
      type: Number,
      default: 0 // Trial is free
    }
  },
  // Business Settings
  settings: {
    timezone: {
      type: String,
      default: 'Asia/Manila'
    },
    currency: {
      type: String,
      default: 'PHP'
    },
    businessHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
    },
    features: {
      pos: { type: Boolean, default: true },
      inventory: { type: Boolean, default: true },
      employees: { type: Boolean, default: true },
      reports: { type: Boolean, default: true },
      appointments: { type: Boolean, default: function() { 
        return ['healthcare', 'services'].includes(this.industry); 
      }},
      orderQueue: { type: Boolean, default: function() { 
        return this.industry === 'food-beverage'; 
      }}
    }
  },
  // Employee limit based on subscription
  employeeLimit: {
    type: Number,
    default: 5 // Trial limit
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate business ID
businessSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.businessId = `BIZ-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);