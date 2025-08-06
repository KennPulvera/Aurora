import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Clock, 
  ArrowLeft,
  Star,
  Zap,
  Bell,
  Award,
  Lightbulb,
  Smartphone,
  Mail,
  MessageSquare,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const UsageDashboard = () => {
  const [usageData] = useState({
    currentPlan: 'Pro',
    smsQuota: { used: 80, total: 100 },
    emailQuota: { used: 45, total: 200 },
    storageQuota: { used: 2.3, total: 10 }
  });
  const navigate = useNavigate();

  const whatsNewFeatures = [
    {
      id: 1,
      title: "AI-Powered Sales Forecasting",
      description: "Get intelligent predictions for your daily sales based on historical data and trends.",
      icon: TrendingUp,
      isNew: true,
      category: "Analytics",
      action: "Try Now",
      path: "/reports"
    },
    {
      id: 2,
      title: "Mobile App Notifications",
      description: "Real-time push notifications for new orders, low inventory, and staff check-ins.",
      icon: Smartphone,
      isNew: true,
      category: "Mobile",
      action: "Setup",
      path: "/admin"
    },
    {
      id: 3,
      title: "Advanced Inventory Alerts",
      description: "Smart reorder suggestions and expiration date tracking with automated alerts.",
      icon: Package,
      isNew: false,
      category: "Inventory",
      action: "Configure",
      path: "/inventory"
    }
  ];

  const quickTips = [
    {
      id: 1,
      title: "Speed up checkout",
      description: "Use keyboard shortcuts: F1 for cash payment, F2 for card payment",
      icon: Zap,
      action: "Learn shortcuts",
      path: "/pos"
    },
    {
      id: 2,
      title: "Track your best sellers",
      description: "Check your Sales report weekly to identify top-performing items",
      icon: Star,
      action: "View Sales",
      path: "/sales"
    },
    {
      id: 3,
      title: "Set up staff schedules",
      description: "Use the Time Clock feature to optimize your staff scheduling",
      icon: Clock,
      action: "Open Time Clock",
      path: "/time-clock"
    }
  ];

  const getUsagePercentage = (used, total) => (used / total) * 100;
  
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100 border-red-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-green-600 bg-green-100 border-green-200';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">Usage Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor your plan usage and discover new features</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan & Usage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <p className="text-blue-100">Your subscription details</p>
              </div>
              <Award size={32} className="text-blue-200" />
            </div>
            <div className="text-2xl font-bold mb-2">{usageData.currentPlan} Plan</div>
            <div className="flex items-center justify-between">
              <span className="text-blue-100">Renews monthly</span>
              <button className="text-white hover:text-blue-200 transition-colors">
                <ExternalLink size={16} />
              </button>
            </div>
          </motion.div>

          {/* SMS Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SMS Notifications</h3>
                <p className="text-gray-500">Monthly quota</p>
              </div>
              <MessageSquare size={24} className="text-blue-600" />
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{usageData.smsQuota.used} / {usageData.smsQuota.total} messages</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getUsageColor(getUsagePercentage(usageData.smsQuota.used, usageData.smsQuota.total))}`}>
                  {getUsagePercentage(usageData.smsQuota.used, usageData.smsQuota.total).toFixed(0)}% used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(getUsagePercentage(usageData.smsQuota.used, usageData.smsQuota.total))}`}
                  style={{ width: `${getUsagePercentage(usageData.smsQuota.used, usageData.smsQuota.total)}%` }}
                ></div>
              </div>
            </div>
            {getUsagePercentage(usageData.smsQuota.used, usageData.smsQuota.total) >= 80 && (
              <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                🔔 You're running low on SMS credits. Consider upgrading your plan.
              </div>
            )}
          </motion.div>

          {/* Email Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Marketing</h3>
                <p className="text-gray-500">Monthly quota</p>
              </div>
              <Mail size={24} className="text-green-600" />
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{usageData.emailQuota.used} / {usageData.emailQuota.total} emails</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getUsageColor(getUsagePercentage(usageData.emailQuota.used, usageData.emailQuota.total))}`}>
                  {getUsagePercentage(usageData.emailQuota.used, usageData.emailQuota.total).toFixed(0)}% used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(getUsagePercentage(usageData.emailQuota.used, usageData.emailQuota.total))}`}
                  style={{ width: `${getUsagePercentage(usageData.emailQuota.used, usageData.emailQuota.total)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* What's New Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">What's New</h2>
                  <p className="text-gray-500">Latest features and updates</p>
                </div>
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-blue-600" />
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    2 New
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {whatsNewFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                    onClick={() => navigate(feature.path)}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                        {feature.isNew && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600 font-medium">{feature.category}</span>
                        <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700">
                          <span className="text-xs font-medium">{feature.action}</span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Tips Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Tips</h2>
                  <p className="text-gray-500">Maximize your productivity</p>
                </div>
                <Lightbulb size={20} className="text-yellow-500" />
              </div>

              <div className="space-y-4">
                {quickTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                    onClick={() => navigate(tip.path)}
                  >
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <tip.icon className="text-yellow-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{tip.title}</h3>
                      <p className="text-xs text-gray-600 mb-2">{tip.description}</p>
                      <div className="flex items-center gap-1 text-yellow-600 group-hover:text-yellow-700">
                        <span className="text-xs font-medium">{tip.action}</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Ready to boost your business?</h3>
                <p className="text-indigo-100">
                  Explore advanced features and upgrade your plan for more capabilities.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/admin')}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  View Settings
                </button>
                <button className="border border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UsageDashboard;