import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Star, Crown,
  Utensils, Heart, Store, 
  Package, Users, Calculator, TrendingUp, Clock
} from 'lucide-react';

const PublicFeatures = () => {
  const navigate = useNavigate();

  const baseFeatures = [
    { name: 'Smart POS System', icon: Calculator },
    { name: 'Real-time Dashboard', icon: TrendingUp },
    { name: 'Inventory Management', icon: Package },
    { name: 'Staff Management', icon: Users },
    { name: 'Financial Reports', icon: TrendingUp },
    { name: 'Order Management', icon: Clock }
  ];

  const industries = [
    {
      id: 'food-beverage',
      name: 'Food & Beverage',
      icon: Utensils,
      color: 'bg-orange-500',
      features: [
        { name: 'Menu Engineering', tier: 'Pro' },
        { name: 'Kitchen Display System', tier: 'Pro' },
        { name: 'Recipe Costing', tier: 'Pro+' },
        { name: 'Delivery Integration', tier: 'Pro+' }
      ]
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Wellness',
      icon: Heart,
      color: 'bg-pink-500',
      features: [
        { name: 'Patient Records', tier: 'Pro' },
        { name: 'Appointment Scheduling', tier: 'Pro' },
        { name: 'Insurance Integration', tier: 'Pro+' },
        { name: 'Telemedicine', tier: 'Pro+' }
      ]
    },
    {
      id: 'retail',
      name: 'Retail Store',
      icon: Store,
      color: 'bg-blue-500',
      features: [
        { name: 'Product Variants', tier: 'Pro' },
        { name: 'Customer Profiles', tier: 'Pro' },
        { name: 'Loyalty Programs', tier: 'Pro+' },
        { name: 'E-commerce Sync', tier: 'Pro+' }
      ]
    }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Pro': return 'bg-blue-100 text-blue-700';
      case 'Pro+': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Pro': return Star;
      case 'Pro+': return Crown;
      default: return Check;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Features Built for Your Business
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to run your business efficiently, tailored to your industry.
          </p>
        </div>

        {/* Base Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            ✅ Included in All Plans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Industry Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Industry-Specific Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${industry.color} rounded-lg flex items-center justify-center`}>
                    <industry.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{industry.name}</h3>
                </div>
                
                <div className="space-y-3">
                  {industry.features.map((feature, idx) => {
                    const TierIcon = getTierIcon(feature.tier);
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">{feature.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(feature.tier)}`}>
                          <TierIcon size={10} className="inline mr-1" />
                          {feature.tier}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-lg opacity-90 mb-6">
            Join thousands of businesses using AvaSolutions to grow their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFeatures;