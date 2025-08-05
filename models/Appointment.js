const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: 15,
    max: 180
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'],
    default: 'consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  notes: String,
  diagnosis: String,
  treatment: String,
  prescription: String,
  followUpDate: Date,
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate appointment ID
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.appointmentId = `APT-${Date.now()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema); 