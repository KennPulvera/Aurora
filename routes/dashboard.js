const express = require('express');
const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics based on industry
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const industry = req.query.industry || 'food-beverage';
    
    // Industry-specific mock data
    const industryData = {
      'food-beverage': {
        todayRevenue: 12500.00,
        ordersToday: 45,
        activeOrders: 11,
        staffOnDuty: 8,
        revenueGrowth: 12.5,
        ordersGrowth: 8.2,
        popularItems: ['Sinangag Special', 'Coffee', 'Pancakes'],
        lowStockItems: ['Rice', 'Eggs', 'Garlic'],
        todaySpecial: 'Tapsilog Combo'
      },
      'retail': {
        todayRevenue: 8500.00,
        ordersToday: 32,
        activeOrders: 5,
        staffOnDuty: 6,
        revenueGrowth: 15.2,
        ordersGrowth: 12.8,
        popularItems: ['T-Shirts', 'Jeans', 'Shoes'],
        lowStockItems: ['Socks', 'Belts', 'Hats'],
        todaySpecial: 'Buy 2 Get 1 Free on Accessories'
      },
      'healthcare': {
        todayRevenue: 22000.00,
        ordersToday: 28,
        activeOrders: 15,
        staffOnDuty: 12,
        revenueGrowth: 8.7,
        ordersGrowth: 5.3,
        popularItems: ['Consultation', 'Vaccination', 'Check-up'],
        lowStockItems: ['Bandages', 'Antibiotics', 'Vitamins'],
        todaySpecial: 'Free Health Screening'
      }
    };
    
    const stats = industryData[industry] || industryData['food-beverage'];
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/analytics
// @desc    Get industry-specific analytics
// @access  Private
router.get('/analytics', async (req, res) => {
  try {
    const industry = req.query.industry || 'food-beverage';
    
    const analytics = {
      'food-beverage': {
        salesByHour: [1200, 1800, 2200, 2800, 3200, 3800, 4200, 4800, 5200, 5800, 6200, 6800],
        topSellingItems: [
          { name: 'Sinangag Special', sales: 45, revenue: 5400 },
          { name: 'Coffee', sales: 38, revenue: 1900 },
          { name: 'Pancakes', sales: 32, revenue: 2560 }
        ],
        customerSatisfaction: 4.8,
        averageOrderValue: 278.50
      },
      'retail': {
        salesByHour: [800, 1200, 1600, 2000, 2400, 2800, 3200, 3600, 4000, 4400, 4800, 5200],
        topSellingItems: [
          { name: 'T-Shirts', sales: 28, revenue: 1400 },
          { name: 'Jeans', sales: 22, revenue: 2200 },
          { name: 'Shoes', sales: 18, revenue: 2700 }
        ],
        customerSatisfaction: 4.6,
        averageOrderValue: 265.75
      },
      'healthcare': {
        salesByHour: [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
        topSellingItems: [
          { name: 'Consultation', sales: 25, revenue: 5000 },
          { name: 'Vaccination', sales: 20, revenue: 4000 },
          { name: 'Check-up', sales: 15, revenue: 3000 }
        ],
        customerSatisfaction: 4.9,
        averageOrderValue: 785.50
      }
    };
    
    res.json(analytics[industry] || analytics['food-beverage']);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 