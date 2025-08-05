import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  Globe,
  Heart,
  Activity,
  Package,
  Store
} from 'lucide-react';
import axios from 'axios';
import { formatPHP } from '../utils/currency';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    ordersToday: 0,
    activeOrders: 0,
    staffOnDuty: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const businessData = localStorage.getItem('business');
    if (businessData) {
      setBusiness(JSON.parse(businessData));
    }
  }, []);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const industry = business?.industry || 'food-beverage';
        const response = await axios.get(`/api/dashboard/stats?industry=${industry}`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (business) {
      fetchStats();
    }

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatCurrency = (amount) => {
    return formatPHP(amount);
  };

  const getIndustryMetrics = () => {
    const industry = business?.industry || 'food-beverage';
    
    const baseMetrics = [
      {
        title: "Today's Revenue",
        value: formatCurrency(stats.todayRevenue),
        growth: stats.revenueGrowth,
        icon: DollarSign,
        color: "bg-green-100 text-green-600"
      },
      {
        title: "Staff On Duty",
        value: stats.staffOnDuty,
        icon: Users,
        color: "bg-blue-100 text-blue-600"
      }
    ];

    const industrySpecific = {
      'food-beverage': [
        {
          title: "Orders Today",
          value: stats.ordersToday,
          growth: stats.ordersGrowth,
          icon: ShoppingCart,
          color: "bg-orange-100 text-orange-600"
        },
        {
          title: "Active Orders",
          value: stats.activeOrders,
          icon: Clock,
          color: "bg-purple-100 text-purple-600"
        }
      ],
      'retail': [
        {
          title: "Sales Today",
          value: stats.ordersToday,
          growth: stats.ordersGrowth,
          icon: Store,
          color: "bg-orange-100 text-orange-600"
        },
        {
          title: "Products in Stock",
          value: stats.activeOrders,
          icon: Package,
          color: "bg-purple-100 text-purple-600"
        }
      ],
      'healthcare': [
        {
          title: "Patients Today",
          value: stats.ordersToday,
          growth: stats.ordersGrowth,
          icon: Heart,
          color: "bg-red-100 text-red-600"
        },
        {
          title: "Appointments",
          value: stats.activeOrders,
          icon: Activity,
          color: "bg-purple-100 text-purple-600"
        }
      ]
    };

    return [...baseMetrics, ...(industrySpecific[industry] || [])];
  };

  const metricCards = getIndustryMetrics();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Business Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening at your business today.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="metric-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
                {card.growth && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-sm text-green-600">
                      +{card.growth}% vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Time and Location Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-600 rounded-xl p-8 text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <span className="font-medium">Philippines</span>
          </div>
          <div className="text-sm">
            UTC+8
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock size={32} />
            <span className="text-4xl font-bold">
              {format(currentTime, 'hh:mm:ss a')}
            </span>
          </div>
          <p className="text-lg opacity-90">
            {format(currentTime, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="text-sm">UTC Time</span>
          </div>
          <div className="text-sm">
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>
      </motion.div>

      {/* Industry-Specific Sections */}
      {business && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Popular Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {business.industry === 'food-beverage' && 'Popular Menu Items'}
              {business.industry === 'retail' && 'Top Selling Products'}
              {business.industry === 'healthcare' && 'Popular Services'}
            </h3>
            <div className="space-y-3">
              {stats.popularItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{item}</span>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Low Stock Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {business.industry === 'food-beverage' && 'Low Stock Items'}
              {business.industry === 'retail' && 'Low Stock Products'}
              {business.industry === 'healthcare' && 'Low Stock Supplies'}
            </h3>
            <div className="space-y-3">
              {stats.lowStockItems?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-700">{item}</span>
                  <span className="text-sm text-red-500">Low Stock</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Today's Special */}
      {business && stats.todaySpecial && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white"
        >
          <h3 className="text-lg font-semibold mb-2">Today's Special</h3>
          <p className="text-xl font-bold">{stats.todaySpecial}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard; 