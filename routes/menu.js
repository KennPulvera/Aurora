const express = require('express');
const router = express.Router();

// @route   GET api/menu
// @desc    Get all menu items based on industry
// @access  Private
router.get('/', async (req, res) => {
  try {
    const industry = req.query.industry || 'food-beverage';
    
    const industryMenus = {
      'food-beverage': [
        {
          id: '1',
          name: 'Sinangag Special',
          description: 'Garlic fried rice with egg and meat',
          price: 120.00,
          category: 'Breakfast',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Sinangag',
          ingredients: ['Rice', 'Garlic', 'Egg', 'Meat'],
          preparationTime: '15 minutes'
        },
        {
          id: '2',
          name: 'Tapsilog',
          description: 'Tapa, sinangag, and itlog',
          price: 150.00,
          category: 'Breakfast',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Tapsilog',
          ingredients: ['Tapa', 'Rice', 'Egg'],
          preparationTime: '20 minutes'
        },
        {
          id: '3',
          name: 'Coffee',
          description: 'Hot brewed coffee',
          price: 50.00,
          category: 'Beverages',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Coffee',
          ingredients: ['Coffee beans', 'Water'],
          preparationTime: '5 minutes'
        }
      ],
      'retail': [
        {
          id: '1',
          name: 'Classic T-Shirt',
          description: 'Cotton comfortable t-shirt',
          price: 25.00,
          category: 'Clothing',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=T-Shirt',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['White', 'Black', 'Blue'],
          stock: 50
        },
        {
          id: '2',
          name: 'Denim Jeans',
          description: 'Classic blue denim jeans',
          price: 89.00,
          category: 'Clothing',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Jeans',
          sizes: ['30', '32', '34', '36'],
          colors: ['Blue', 'Black'],
          stock: 30
        },
        {
          id: '3',
          name: 'Running Shoes',
          description: 'Comfortable running shoes',
          price: 120.00,
          category: 'Footwear',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Shoes',
          sizes: ['7', '8', '9', '10'],
          colors: ['White', 'Black', 'Red'],
          stock: 25
        }
      ],
      'healthcare': [
        {
          id: '1',
          name: 'General Consultation',
          description: 'Comprehensive health check-up',
          price: 500.00,
          category: 'Services',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Consultation',
          duration: '30 minutes',
          doctor: 'Dr. Smith'
        },
        {
          id: '2',
          name: 'Vaccination',
          description: 'Flu shot and other vaccinations',
          price: 300.00,
          category: 'Services',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Vaccination',
          duration: '15 minutes',
          doctor: 'Dr. Johnson'
        },
        {
          id: '3',
          name: 'Dental Cleaning',
          description: 'Professional dental cleaning',
          price: 800.00,
          category: 'Services',
          available: true,
          image: 'https://via.placeholder.com/150x150?text=Dental',
          duration: '45 minutes',
          doctor: 'Dr. Williams'
        }
      ]
    };
    
    const menu = industryMenus[industry] || industryMenus['food-beverage'];
    res.json(menu);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/menu/categories
// @desc    Get menu categories based on industry
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    const industry = req.query.industry || 'food-beverage';
    
    const categories = {
      'food-beverage': ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Desserts'],
      'retail': ['Clothing', 'Footwear', 'Accessories', 'Electronics', 'Home & Garden'],
      'healthcare': ['Services', 'Medications', 'Equipment', 'Supplements', 'Emergency']
    };
    
    res.json(categories[industry] || categories['food-beverage']);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 