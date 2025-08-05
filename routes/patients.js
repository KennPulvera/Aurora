const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const { search, gender, isActive } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (gender) {
      query.gender = gender;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new patient
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      emergencyContact,
      allergies,
      insurance
    } = req.body;

    const patient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      emergencyContact,
      allergies: allergies || [],
      insurance
    });

    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
router.put('/:id', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedPatient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isActive = false;
    await patient.save();

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add medical history
router.post('/:id/medical-history', [
  body('condition').notEmpty().withMessage('Condition is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('treatment').notEmpty().withMessage('Treatment is required'),
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medicalHistory.push(req.body);
    await patient.save();

    res.json(patient);
  } catch (error) {
    console.error('Add medical history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add medication
router.post('/:id/medications', [
  body('name').notEmpty().withMessage('Medication name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('frequency').notEmpty().withMessage('Frequency is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.medications.push(req.body);
    await patient.save();

    res.json(patient);
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments({ isActive: true });
    const newPatientsThisMonth = await Patient.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const patientsByGender = await Patient.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const ageGroups = await Patient.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $lt: ['$age', 18] },
              then: 'Under 18',
              else: {
                $cond: {
                  if: { $lt: ['$age', 65] },
                  then: '18-64',
                  else: '65+'
                }
              }
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalPatients,
      newPatientsThisMonth,
      patientsByGender,
      ageGroups
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 