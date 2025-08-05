const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
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
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    date: Date
  }],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate patient ID
patientSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.patientId = `PAT-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema); 