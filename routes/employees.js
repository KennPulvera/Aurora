const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Employee = require('../models/Employee');
const Business = require('../models/Business');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all employees for a business (Business Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-admin') {
      return res.status(403).json({ message: 'Access denied. Business admin required.' });
    }

    const employees = await Employee.find({ 
      businessId: req.user.businessId,
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new employee (Business Admin only)
router.post('/', authenticateToken, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('hourlyRate').isNumeric().withMessage('Hourly rate must be a number')
], async (req, res) => {
  try {
    if (req.user.userType !== 'business-admin') {
      return res.status(403).json({ message: 'Access denied. Business admin required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      department,
      hourlyRate,
      hireDate,
      permissions,
      schedule
    } = req.body;

    // Check employee limit
    const business = await Business.findById(req.user.businessId);
    const currentEmployeeCount = await Employee.countDocuments({ 
      businessId: req.user.businessId,
      isActive: true 
    });

    if (currentEmployeeCount >= business.employeeLimit) {
      return res.status(400).json({ 
        message: `Employee limit reached. Current plan allows ${business.employeeLimit} employees.` 
      });
    }

    const employee = new Employee({
      firstName,
      lastName,
      businessId: req.user.businessId,
      email,
      phone,
      position,
      department,
      hourlyRate: hourlyRate || 0,
      hireDate: hireDate || new Date(),
      permissions: permissions || {},
      schedule: schedule || {}
    });

    await employee.save();

    res.status(201).json({
      message: 'Employee added successfully',
      employee
    });

  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee (Business Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-admin') {
      return res.status(403).json({ message: 'Access denied. Business admin required.' });
    }

    const employee = await Employee.findOneAndUpdate(
      { 
        _id: req.params.id,
        businessId: req.user.businessId 
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete/Deactivate employee (Business Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-admin') {
      return res.status(403).json({ message: 'Access denied. Business admin required.' });
    }

    const employee = await Employee.findOneAndUpdate(
      { 
        _id: req.params.id,
        businessId: req.user.businessId 
      },
      { isActive: false },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deactivated successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employees for clock-in (Public route for specific business)
router.get('/clock-in/:businessId', async (req, res) => {
  try {
    const employees = await Employee.find({ 
      businessId: req.params.businessId,
      isActive: true 
    }).select('firstName lastName employeeId position currentlyCheckedIn avatar');

    res.json(employees);
  } catch (error) {
    console.error('Get clock-in employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Employee clock in/out (Public route)
router.post('/clock/:action/:employeeId', [
  body('businessId').isMongoId().withMessage('Valid business ID required')
], async (req, res) => {
  try {
    const { action, employeeId } = req.params;
    const { businessId } = req.body;

    if (!['in', 'out'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "in" or "out"' });
    }

    const employee = await Employee.findOne({ 
      employeeId,
      businessId,
      isActive: true 
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const now = new Date();

    if (action === 'in') {
      if (employee.currentlyCheckedIn) {
        return res.status(400).json({ message: 'Employee is already checked in' });
      }

      employee.currentlyCheckedIn = true;
      employee.lastCheckIn = now;
    } else {
      if (!employee.currentlyCheckedIn) {
        return res.status(400).json({ message: 'Employee is not checked in' });
      }

      employee.currentlyCheckedIn = false;
      employee.lastCheckOut = now;
    }

    await employee.save();

    res.json({
      message: `Successfully clocked ${action}`,
      employee: {
        name: employee.fullName,
        employeeId: employee.employeeId,
        action,
        timestamp: now,
        currentlyCheckedIn: employee.currentlyCheckedIn
      }
    });

  } catch (error) {
    console.error('Clock in/out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employee time records (Business Admin only)
router.get('/time-records', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'business-admin') {
      return res.status(403).json({ message: 'Access denied. Business admin required.' });
    }

    const { startDate, endDate, employeeId } = req.query;
    
    let query = { businessId: req.user.businessId };
    if (employeeId) query.employeeId = employeeId;

    const employees = await Employee.find(query).select('firstName lastName employeeId lastCheckIn lastCheckOut currentlyCheckedIn');

    res.json(employees);
  } catch (error) {
    console.error('Get time records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;