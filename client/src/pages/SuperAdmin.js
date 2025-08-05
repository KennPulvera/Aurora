import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Eye, 
  Settings, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const SuperAdmin = () => {
  const [stats, setStats] = useState({});
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.userType === 'super-admin') {
      fetchDashboardData();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, businessesRes, usersRes, activitiesRes] = await Promise.all([
        axios.get('/api/superadmin/stats', { headers }),
        axios.get('/api/superadmin/businesses', { headers }),
        axios.get('/api/superadmin/users', { headers }),
        axios.get('/api/superadmin/activity', { headers })
      ]);

      setStats(statsRes.data);
      setBusinesses(businessesRes.data.businesses);
      setUsers(usersRes.data.users);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateSubscription = async (businessId, subscriptionData) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     await axios.put(`/api/superadmin/businesses/${businessId}/subscription`, subscriptionData, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     toast.success('Subscription updated successfully');
  //     fetchDashboardData();
  //   } catch (error) {
  //     console.error('Error updating subscription:', error);
  //     toast.error('Failed to update subscription');
  //   }
  // };

  const handleToggleBusinessStatus = async (businessId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/superadmin/businesses/${businessId}/status`, { isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Business ${isActive ? 'activated' : 'suspended'} successfully`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      suspended: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };
    
    const badge = badges[status] || badges.inactive;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const colors = {
      trial: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || colors.trial}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  if (user.userType !== 'super-admin') {
    return (
      <div className="p-6 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Super Admin Access Required</h2>
        <p className="text-gray-600">You don't have permission to access this area.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="text-red-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Platform Overview & Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'businesses', label: 'Businesses', icon: Building2 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'activity', label: 'Activity', icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBusinesses}</div>
              <div className="text-sm text-gray-600">Total Businesses</div>
              <div className="text-xs text-green-600 mt-1">+{stats.recentBusinesses} this month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="text-green-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xs text-gray-500 mt-1">{stats.totalEmployees} employees</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="text-purple-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.activeSubscriptions}</div>
              <div className="text-sm text-gray-600">Active Subscriptions</div>
              <div className="text-xs text-green-600 mt-1">{formatPeso(stats.monthlyRevenue)}/month</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{formatPeso(stats.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
            </motion.div>
          </div>

          {/* Industries & Subscriptions Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Businesses by Industry</h3>
              <div className="space-y-3">
                {stats.industriesStats?.map(industry => (
                  <div key={industry._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{industry._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(industry.count / stats.totalBusinesses) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{industry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plans</h3>
              <div className="space-y-3">
                {stats.subscriptionStats?.map(plan => (
                  <div key={plan._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{plan._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(plan.count / stats.totalBusinesses) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{plan.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Businesses Tab */}
      {activeTab === 'businesses' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4 bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Industries</option>
              <option value="food-beverage">Food & Beverage</option>
              <option value="healthcare">Healthcare</option>
              <option value="retail">Retail</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Businesses Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businesses.map(business => (
                    <tr key={business._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{business.businessName}</div>
                          <div className="text-sm text-gray-500 capitalize">{business.industry}</div>
                          <div className="text-xs text-gray-400">{business.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{business.ownerId?.username}</div>
                        <div className="text-xs text-gray-500">{business.ownerId?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(business.subscription.plan)}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatPeso(business.subscription.monthlyFee)}/month
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(business.subscription.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {business.employeeCount}/{business.employeeLimit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleBusinessStatus(business._id, !business.isActive)}
                            className={`text-xs px-3 py-1 rounded ${
                              business.isActive 
                                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {business.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <Settings size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.userType === 'business-admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.userType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.businessId?.businessName}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.businessId?.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-PH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'business_created' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {activity.type === 'business_created' ? <Building2 size={16} /> : <Users size={16} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString('en-PH')}
                  </p>
                  {activity.details && (
                    <div className="text-xs text-gray-600 mt-1">
                      {activity.type === 'business_created' && (
                        <span>Industry: {activity.details.industry} | Owner: {activity.details.owner}</span>
                      )}
                      {activity.type === 'user_registered' && (
                        <span>Business: {activity.details.businessName}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SuperAdmin;