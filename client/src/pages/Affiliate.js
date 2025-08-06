import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, TrendingUp, Award, Copy, Share2, 
  Target, Gift, BarChart3, CheckCircle, ArrowLeft,
  Calendar, User, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const Affiliate = () => {
  const navigate = useNavigate();
  const [affiliateCode] = useState('AVA-REF-12345');
  const [stats] = useState({
    totalReferrals: 23,
    activeReferrals: 18,
    totalEarnings: 15750,
    pendingEarnings: 2400,
    monthlyEarnings: 3200,
    conversionRate: 12.5
  });

  const [recentReferrals] = useState([
    { id: 1, name: 'Coffee Corner Cafe', date: '2024-01-15', status: 'Active', commission: 850 },
    { id: 2, name: 'Downtown Restaurant', date: '2024-01-12', status: 'Pending', commission: 650 },
    { id: 3, name: 'Beauty Spa Plus', date: '2024-01-10', status: 'Active', commission: 750 },
    { id: 4, name: 'Quick Mart Store', date: '2024-01-08', status: 'Active', commission: 550 },
  ]);

  const commissionTiers = [
    {
      tier: 'Bronze',
      referrals: '1-5',
      commission: '15%',
      bonus: 'None',
      color: 'orange'
    },
    {
      tier: 'Silver',
      referrals: '6-15',
      commission: '20%',
      bonus: '₱500 per referral',
      color: 'gray'
    },
    {
      tier: 'Gold',
      referrals: '16-30',
      commission: '25%',
      bonus: '₱750 per referral',
      color: 'yellow'
    },
    {
      tier: 'Platinum',
      referrals: '31+',
      commission: '30%',
      bonus: '₱1,000 per referral',
      color: 'purple'
    }
  ];

  const copyAffiliateCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    toast.success('Affiliate code copied to clipboard!');
  };

  const copyReferralLink = () => {
    const link = `https://avasolutions.com/signup?ref=${affiliateCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    const link = `https://avasolutions.com/signup?ref=${affiliateCode}`;
    const text = `Check out AvaSolutions - the best business management platform for restaurants, cafes, and retail stores! Sign up with my referral link: ${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join AvaSolutions',
        text: text,
        url: link
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Referral message copied to clipboard!');
    }
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
                onClick={() => navigate('/pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Program</h1>
          <p className="text-gray-600">
            Earn money by referring businesses to AvaSolutions. Get up to 30% commission on every successful referral.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</div>
            <div className="text-sm text-gray-600">Referrals</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.activeReferrals} active
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">₱{stats.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Earnings</div>
            <div className="text-xs text-orange-600 mt-1">
              ₱{stats.pendingEarnings.toLocaleString()} pending
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">₱{stats.monthlyEarnings.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Monthly Earnings</div>
            <div className="text-xs text-green-600 mt-1">
              +23% from last month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</div>
            <div className="text-sm text-gray-600">Conversion</div>
            <div className="text-xs text-green-600 mt-1">
              Above average
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Referral Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Link Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Tools</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affiliate Code
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={affiliateCode}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                    <button
                      onClick={copyAffiliateCode}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Link
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={`https://avasolutions.com/signup?ref=${affiliateCode}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                    />
                    <button
                      onClick={copyReferralLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                    <button
                      onClick={shareReferralLink}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Commission Tiers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Tiers</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commissionTiers.map((tier, index) => (
                  <div
                    key={tier.tier}
                    className={`p-4 rounded-lg border-2 ${
                      index === 1 ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Award className={`text-${tier.color}-600`} size={20} />
                      <h4 className="font-semibold text-gray-900">{tier.tier}</h4>
                      {index === 1 && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Referrals: {tier.referrals}</div>
                      <div>Commission: {tier.commission}</div>
                      <div>Bonus: {tier.bonus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Referrals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>
              
              <div className="space-y-3">
                {recentReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <User className="text-primary-600" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{referral.name}</div>
                        <div className="text-sm text-gray-500">{referral.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">₱{referral.commission}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        referral.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 className="text-blue-600" size={20} />
                  <span className="font-medium text-gray-900">View Analytics</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="font-medium text-gray-900">Request Payout</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Gift className="text-purple-600" size={20} />
                  <span className="font-medium text-gray-900">Marketing Materials</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Mail className="text-orange-600" size={20} />
                  <span className="font-medium text-gray-900">Contact Support</span>
                </button>
              </div>
            </motion.div>

            {/* Program Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white"
            >
              <h3 className="text-lg font-semibold mb-4">Program Benefits</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Up to 30% commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Monthly bonus payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Real-time tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Marketing support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span className="text-sm">Dedicated support</span>
                </div>
              </div>
            </motion.div>

            {/* Next Payout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Payout</h3>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  ₱{stats.pendingEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Available for withdrawal
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar size={16} />
                  <span>Next payout: Jan 31, 2024</span>
                </div>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Request Payout
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Affiliate;