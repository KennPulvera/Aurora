import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Star, Crown, ArrowRight, Info, ArrowLeft,
  MessageSquare, BarChart3, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Pro',
      icon: Star,
      price: {
        monthly: 299,
        annual: 2390
      },
      description: 'Perfect for growing businesses',
      popular: true,
      features: [
        'Complete POS System',
        'Inventory Management',
        'Staff Management & Time Clock',
        'Sales & Financial Reports',
        'Customer Management',
        'Basic Analytics',
        'Email Support',
        '50 SMS/month',
        '200 Emails/month',
        '5GB Storage'
      ],
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Pro+',
      icon: Crown,
      price: {
        monthly: 499,
        annual: 3990
      },
      description: 'For businesses that demand excellence',
      popular: false,
      features: [
        'Everything in Pro',
        'Advanced AI Analytics',
        'Multi-location Support',
        'Custom Branding',
        'Priority Phone Support',
        'Advanced Integrations',
        'Unlimited SMS',
        'Unlimited Emails',
        'Unlimited Storage',
        'Custom Reports',
        'API Access',
        'White-label Options'
      ],
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const handleUpgrade = (planName) => {
    toast.success(`Redirecting to ${planName} upgrade...`);
    // In a real app, this would redirect to payment processor
    setTimeout(() => {
      toast('Payment integration coming soon!');
    }, 1500);
  };

  const handleViewFeatures = () => {
    navigate('/features');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 min-h-screen"
    >
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
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
                onClick={() => navigate('/features')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock the full potential of your business with our comprehensive management system
            </p>
          </motion.div>

          {/* Annual/Monthly Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`mx-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save 20%
              </span>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center mr-4`}>
                    <plan.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ₱{isAnnual ? Math.round(plan.price.annual / 12) : plan.price.monthly}
                    </span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually at ₱{plan.price.annual}
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={16} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full bg-gradient-to-r ${plan.gradient} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                >
                  Upgrade to {plan.name}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Info className="text-primary-600 mr-2" size={24} />
            <h3 className="text-xl font-semibold text-gray-900">Want to see all features?</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Compare all features across plans and see what's included in your current subscription
          </p>
          <button
            onClick={handleViewFeatures}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto"
          >
            View Detailed Features
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">SMS Marketing</h4>
            <p className="text-sm text-gray-600">Send targeted SMS campaigns to your customers</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
            <p className="text-sm text-gray-600">Get insights with AI-powered analytics</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={24} />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Multi-location</h4>
            <p className="text-sm text-gray-600">Manage multiple business locations</p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">We offer a 14-day free trial for all new users to explore our platform before committing to a plan.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer discounts for annual billing?</h4>
              <p className="text-gray-600 text-sm">Yes! Save 20% when you choose annual billing instead of monthly payments.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Pricing;