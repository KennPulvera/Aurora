const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const { date, status, doctor, patient, type } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (patient) {
      query.patient = patient;
    }

    if (type) {
      query.type = type;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('doctor', 'username')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName patientId phone email')
      .populate('doctor', 'username');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('type').isIn(['consultation', 'follow-up', 'emergency', 'routine', 'specialist']).withMessage('Valid appointment type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      patient,
      doctor,
      date,
      time,
      duration,
      type,
      reason,
      notes,
      isUrgent
    } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(400).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctorExists = await User.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({ message: 'Doctor not found' });
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(date);
    const existingAppointment = await Appointment.findOne({
      doctor,
      date: appointmentDate,
      time,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      date: appointmentDate,
      time,
      duration: duration || 30,
      type,
      reason,
      notes,
      isUrgent: isUrgent || false
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('doctor', 'username');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment
router.put('/:id', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('patient', 'firstName lastName patientId phone')
    .populate('doctor', 'username');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', [
  body('status').isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = req.body.status;
    
    // Add diagnosis and treatment if completing appointment
    if (req.body.status === 'completed') {
      if (req.body.diagnosis) appointment.diagnosis = req.body.diagnosis;
      if (req.body.treatment) appointment.treatment = req.body.treatment;
      if (req.body.prescription) appointment.prescription = req.body.prescription;
      if (req.body.followUpDate) appointment.followUpDate = req.body.followUpDate;
    }

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('doctor', 'username');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments by date range
router.get('/schedule/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const { doctor } = req.query;

    let query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (doctor) {
      query.doctor = doctor;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('doctor', 'username')
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalAppointments = await Appointment.countDocuments(dateQuery);
    const completedAppointments = await Appointment.countDocuments({
      ...dateQuery,
      status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({
      ...dateQuery,
      status: 'cancelled'
    });

    const appointmentsByStatus = await Appointment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const appointmentsByType = await Appointment.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const dailyAppointments = await Appointment.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0,
      appointmentsByStatus,
      appointmentsByType,
      dailyAppointments
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 