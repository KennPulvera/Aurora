import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Crown, Check, ChevronDown, ChevronUp,
  Utensils, Package, Clock, Calculator, Users, TrendingUp,
  Heart, Store
} from 'lucide-react';

const Features = () => {
  const [user, setUser] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('food-beverage');
  const [selectedSubCategory, setSelectedSubCategory] = useState('cafe');
  const [showBaseFeatures, setShowBaseFeatures] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.industry) {
        setSelectedIndustry(parsedUser.industry);
      }
    }
  }, []);

  const industries = [
    {
      id: 'food-beverage',
      name: 'Food & Beverage',
      subCategories: [
        { id: 'cafe', name: 'Cafe' },
        { id: 'restaurant', name: 'Restaurant' },
        { id: 'bakery', name: 'Bakery' },
        { id: 'bar', name: 'Bar/Pub' }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Wellness',
      subCategories: [
        { id: 'spa', name: 'Spa & Aesthetics' },
        { id: 'clinic', name: 'Medical Clinic' },
        { id: 'dental', name: 'Dental Practice' },
        { id: 'therapy', name: 'Therapy Center' }
      ]
    },
    {
      id: 'retail',
      name: 'Retail Store',
      subCategories: [
        { id: 'clothing', name: 'Clothing Store' },
        { id: 'electronics', name: 'Electronics' },
        { id: 'grocery', name: 'Grocery Store' },
        { id: 'pharmacy', name: 'Pharmacy' }
      ]
    }
  ];

  const baseFeatures = [
    {
      name: 'Dashboard',
      description: 'Real-time overview of your business performance with key metrics and insights.',
      icon: TrendingUp,
      tier: 'Base'
    },
    {
      name: 'POS System',
      description: 'Complete point-of-sale system with payment processing and receipt generation.',
      icon: Calculator,
      tier: 'Base'
    },
    {
      name: 'Order Queue',
      description: 'Manage and track orders from placement to completion with status updates.',
      icon: Clock,
      tier: 'Base'
    },
    {
      name: 'Menu Management',
      description: 'Create and manage your product catalog with categories and pricing.',
      icon: Utensils,
      tier: 'Base'
    },
    {
      name: 'Inventory',
      description: 'Track stock levels, manage suppliers, and automate reorder alerts.',
      icon: Package,
      tier: 'Base'
    },
    {
      name: 'Recipes & Costing',
      description: 'Calculate recipe costs and sync with menu pricing for profit optimization.',
      icon: Calculator,
      tier: 'Base'
    },
    {
      name: 'Time Clock',
      description: 'Employee time tracking with clock-in/out functionality and timesheet management.',
      icon: Clock,
      tier: 'Base'
    },
    {
      name: 'Employees',
      description: 'Manage staff information, roles, and permissions across your business.',
      icon: Users,
      tier: 'Base'
    },
    {
      name: 'Sales Reports',
      description: 'Detailed sales analytics with trends, performance metrics, and insights.',
      icon: TrendingUp,
      tier: 'Base'
    },
    {
      name: 'Expenses',
      description: 'Track business expenses, categorize costs, and monitor spending patterns.',
      icon: Calculator,
      tier: 'Base'
    },
    {
      name: 'Payroll',
      description: 'Process employee payments, calculate wages, and manage payroll records.',
      icon: Users,
      tier: 'Base'
    },
    {
      name: 'Reports',
      description: 'Generate comprehensive business reports for accounting and analysis.',
      icon: TrendingUp,
      tier: 'Base'
    }
  ];

  const subCategoryFeatures = {
    // Food & Beverage
    'cafe': [
      {
        name: 'Daily Sales & Inventory Summary',
        description: 'Get automatic end-of-day reports on product sales, inventory used, and what\'s low.',
        icon: TrendingUp,
        tier: 'Pro'
      },
      {
        name: 'Staff Training Tracker',
        description: 'Monitor barista skill progress, training sessions, and performance scores.',
        icon: Users,
        tier: 'Pro'
      },
      {
        name: 'Smart Coffee Forecasting',
        description: 'AI-based forecast of best-selling drinks based on time, weather, and trends.',
        icon: TrendingUp,
        tier: 'Pro+'
      },
      {
        name: 'Equipment Maintenance Alerts',
        description: 'Auto reminders and status checks for espresso machines and grinders.',
        icon: Clock,
        tier: 'Pro+'
      },
      {
        name: 'Loyalty + Marketing Campaigns',
        description: 'Launch SMS or email promos to loyal customers with one click.',
        icon: Star,
        tier: 'Pro+'
      }
    ],
    'restaurant': [
      {
        name: 'Reservation & Table Turnover Tracker',
        description: 'Visualize table use and get alerts when guests wait too long.',
        icon: Users,
        tier: 'Pro'
      },
      {
        name: 'Menu Profitability Dashboard',
        description: 'Identify low-performing dishes and high-margin items instantly.',
        icon: TrendingUp,
        tier: 'Pro'
      },
      {
        name: 'Smart Staff Scheduler',
        description: 'Auto-generate optimized shifts based on traffic trends and labor cost.',
        icon: Users,
        tier: 'Pro+'
      },
      {
        name: 'Delivery Channel Manager',
        description: 'Sync and monitor all Grab/Foodpanda orders in one place.',
        icon: Package,
        tier: 'Pro+'
      },
      {
        name: 'Auto Cost & Waste Analysis',
        description: 'Get alerts on food waste trends and cost spikes.',
        icon: TrendingUp,
        tier: 'Pro+'
      }
    ],
    'bakery': [
      {
        name: 'Daily Pre-Order Summary',
        description: 'Track all incoming cake/bread pre-orders in a clean dashboard.',
        icon: Package,
        tier: 'Pro'
      },
      {
        name: 'Stock Refill Alerts',
        description: 'Automatically detect when ingredients run low and need reordering.',
        icon: Package,
        tier: 'Pro'
      },
      {
        name: 'Smart Baking Planner',
        description: 'Suggest what and how much to bake daily based on past sales.',
        icon: Calculator,
        tier: 'Pro+'
      },
      {
        name: 'Custom Order Designer',
        description: 'Let customers design custom cakes online and send details to your kitchen.',
        icon: Star,
        tier: 'Pro+'
      },
      {
        name: 'Batch Cost Calculator',
        description: 'Calculate exact cost per batch and see profitability per item.',
        icon: Calculator,
        tier: 'Pro+'
      }
    ],
    'bar': [
      {
        name: 'Liquor Cost & Profit Tracker',
        description: 'Track pour cost per drink and maximize profit per bottle.',
        icon: TrendingUp,
        tier: 'Pro'
      },
      {
        name: 'Tip & Bonus Management',
        description: 'Monitor tips and bonuses per bartender or shift.',
        icon: Users,
        tier: 'Pro'
      },
      {
        name: 'Event Night Planner',
        description: 'Plan and schedule band nights or events with automatic promos.',
        icon: Star,
        tier: 'Pro+'
      },
      {
        name: 'Digital ID & Age Verification',
        description: 'Scan IDs to verify age before entry.',
        icon: Check,
        tier: 'Pro+'
      },
      {
        name: 'Theft & Overpour Alert System',
        description: 'Detect inconsistencies between liquor inventory and actual sales.',
        icon: TrendingUp,
        tier: 'Pro+'
      }
    ],
    // Healthcare
    'spa': [
      {
        name: 'Treatment Package Builder',
        description: 'Create custom spa packages and track treatment combinations.',
        icon: Heart,
        tier: 'Pro'
      },
      {
        name: 'Client Health History',
        description: 'Maintain detailed client health records and treatment preferences.',
        icon: Heart,
        tier: 'Pro'
      },
      {
        name: 'Automated Appointment Reminders',
        description: 'Send SMS and email reminders to reduce no-shows.',
        icon: Clock,
        tier: 'Pro+'
      },
      {
        name: 'Therapist Performance Analytics',
        description: 'Track therapist utilization and client satisfaction scores.',
        icon: TrendingUp,
        tier: 'Pro+'
      }
    ],
    // Retail
    'clothing': [
      {
        name: 'Size & Color Inventory Matrix',
        description: 'Track inventory by size, color, and style combinations.',
        icon: Store,
        tier: 'Pro'
      },
      {
        name: 'Seasonal Trend Analysis',
        description: 'Analyze sales patterns by season and plan inventory accordingly.',
        icon: TrendingUp,
        tier: 'Pro'
      },
      {
        name: 'Customer Style Preferences',
        description: 'Track customer purchase history and style preferences.',
        icon: Users,
        tier: 'Pro+'
      },
      {
        name: 'Automated Restock Alerts',
        description: 'Get alerts when popular items are running low.',
        icon: Package,
        tier: 'Pro+'
      }
    ]
  };

  const currentIndustry = industries.find(ind => ind.id === selectedIndustry);
  const currentFeatures = subCategoryFeatures[selectedSubCategory] || [];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Base': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pro': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pro+': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Pro': return Star;
      case 'Pro+': return Crown;
      default: return Check;
    }
  };

  const organizedFeatures = [
    {
      category: 'Base System (Included in All)',
      features: baseFeatures
    },
    {
      category: `${selectedSubCategory.charAt(0).toUpperCase() + selectedSubCategory.slice(1)} Features`,
      features: currentFeatures
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gray-50 min-h-screen"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Features for Your Business
          </h1>
          <p className="text-gray-600">
            Explore all features available for your industry and subscription plan.
          </p>
        </div>

        {/* Industry & Sub-category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                const newIndustry = industries.find(ind => ind.id === e.target.value);
                if (newIndustry && newIndustry.subCategories.length > 0) {
                  setSelectedSubCategory(newIndustry.subCategories[0].id);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {industries.map(industry => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {currentIndustry?.subCategories.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Features Display */}
        <div className="space-y-8">
          {organizedFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {category.category === 'Base System (Included in All)' ? (
                <div>
                  <button
                    onClick={() => setShowBaseFeatures(!showBaseFeatures)}
                    className="w-full flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-green-800">
                        {showBaseFeatures ? 'Hide' : 'Show'} Base Features ({category.features.length} included)
                      </span>
                      <span className="text-sm px-3 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
                        ✅ All Included
                      </span>
                    </div>
                    {showBaseFeatures ? (
                      <ChevronUp className="text-green-600" size={20} />
                    ) : (
                      <ChevronDown className="text-green-600" size={20} />
                    )}
                  </button>
                  
                  {showBaseFeatures && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                    >
                      {category.features.map((feature, featureIndex) => {
                        const TierIcon = getTierIcon(feature.tier);
                        return (
                          <div key={featureIndex} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <feature.icon className="text-gray-600" size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTierColor(feature.tier)}`}>
                                    <TierIcon size={12} className="inline mr-1" />
                                    {feature.tier}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.features.map((feature, featureIndex) => {
                      const TierIcon = getTierIcon(feature.tier);
                      return (
                        <div key={featureIndex} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <feature.icon className="text-primary-600" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTierColor(feature.tier)}`}>
                                  <TierIcon size={12} className="inline mr-1" />
                                  {feature.tier}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Plan Info */}
        {user && (
          <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Plan</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">You are currently on the</div>
                <div className="text-xl font-bold text-primary-600">Pro Plan</div>
                <div className="text-sm text-gray-600">All Pro features are available to you</div>
              </div>
              <div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Upgrade to Pro+
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Features;