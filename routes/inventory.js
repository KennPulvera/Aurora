const express = require('express');
const router = express.Router();

// @route   GET api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Mock inventory data
    const inventory = [
      {
        id: '1',
        name: 'Rice',
        quantity: 50,
        unit: 'kg',
        reorderLevel: 10,
        cost: 45.00
      }
    ];
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 