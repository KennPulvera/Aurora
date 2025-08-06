import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Package, 
  ShoppingCart, 
  Heart, 
  Calendar, 
  Store, 
  Wrench, 
  Coffee,
  Activity,
  Stethoscope,
  Settings,
  BarChart3,
  Database
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const Admin = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('food-beverage');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const industries = [
    { 
      id: 'food-beverage', 
      name: 'Food & beverages', 
      icon: Coffee,
      color: 'bg-orange-500',
      features: ['Products', 'Orders', 'Order Queue', 'Menu Management']
    },
    { 
      id: 'healthcare', 
      name: 'Healthcare and wellness', 
      icon: Heart,
      color: 'bg-red-500',
      features: ['Patients', 'Appointments', 'Medical Records', 'Treatments']
    },
    { 
      id: 'retail', 
      name: 'Retail store', 
      icon: Store,
      color: 'bg-blue-500',
      features: ['Products', 'Inventory', 'Orders', 'Customers']
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      await fetchIndustryStats();
      if (showUserManagement) {
        await fetchUsers();
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndustry, showUserManagement]);

  const fetchIndustryStats = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      // Fetch different stats based on industry
      switch (selectedIndustry) {
        case 'food-beverage':
        case 'retail':
        case 'manufacturing':
          promises.push(
            axios.get(`/api/products?industry=${selectedIndustry}`),
            axios.get(`/api/orders?industry=${selectedIndustry}`)
          );
          break;
        case 'healthcare':
          promises.push(
            axios.get('/api/patients'),
            axios.get('/api/appointments')
          );
          break;
        case 'services':
          promises.push(
            axios.get('/api/appointments')
          );
          break;
        default:
          promises.push(
            axios.get(`/api/products?industry=${selectedIndustry}`),
            axios.get(`/api/orders?industry=${selectedIndustry}`)
          );
          break;
      }

      const responses = await Promise.all(promises);
      
      let newStats = {};
      
      if (selectedIndustry === 'healthcare') {
        const patients = responses[0]?.data || [];
        const appointments = responses[1]?.data || [];
        
        newStats = {
          totalPatients: patients.length,
          activePatients: patients.filter(p => p.isActive).length,
          totalAppointments: appointments.length,
          todayAppointments: appointments.filter(apt => {
            const today = new Date().toISOString().split('T')[0];
            const aptDate = new Date(apt.date).toISOString().split('T')[0];
            return aptDate === today;
          }).length
        };
      } else if (selectedIndustry === 'services') {
        const appointments = responses[0]?.data || [];
        
        newStats = {
          totalAppointments: appointments.length,
          pendingAppointments: appointments.filter(apt => apt.status === 'scheduled').length,
          completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
          todayAppointments: appointments.filter(apt => {
            const today = new Date().toISOString().split('T')[0];
            const aptDate = new Date(apt.date).toISOString().split('T')[0];
            return aptDate === today;
          }).length
        };
      } else {
        const products = responses[0]?.data || [];
        const orders = responses[1]?.data || [];
        
        newStats = {
          totalProducts: products.length,
          activeProducts: products.filter(p => p.isActive).length,
          lowStockProducts: products.filter(p => p.stockQuantity <= p.minStockLevel).length,
          totalOrders: orders.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
        };
      }
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch industry statistics');
    } finally {
      setLoading(false);
    }
  };

  const getIndustryStatsCards = () => {
    if (selectedIndustry === 'healthcare') {
      return [
        { title: 'Total Patients', value: stats.totalPatients || 0, icon: Users, color: 'text-blue-600' },
        { title: 'Active Patients', value: stats.activePatients || 0, icon: Heart, color: 'text-green-600' },
        { title: 'Total Appointments', value: stats.totalAppointments || 0, icon: Calendar, color: 'text-purple-600' },
        { title: "Today's Appointments", value: stats.todayAppointments || 0, icon: Activity, color: 'text-orange-600' }
      ];
    } else if (selectedIndustry === 'services') {
      return [
        { title: 'Total Appointments', value: stats.totalAppointments || 0, icon: Calendar, color: 'text-blue-600' },
        { title: 'Pending Appointments', value: stats.pendingAppointments || 0, icon: Activity, color: 'text-yellow-600' },
        { title: 'Completed Services', value: stats.completedAppointments || 0, icon: Settings, color: 'text-green-600' },
        { title: "Today's Schedule", value: stats.todayAppointments || 0, icon: Stethoscope, color: 'text-purple-600' }
      ];
    } else {
      return [
        { title: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'text-blue-600' },
        { title: 'Active Products', value: stats.activeProducts || 0, icon: Store, color: 'text-green-600' },
        { title: 'Low Stock Items', value: stats.lowStockProducts || 0, icon: Activity, color: 'text-red-600' },
        { title: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'text-purple-600' },
        { title: 'Pending Orders', value: stats.pendingOrders || 0, icon: Calendar, color: 'text-yellow-600' },
        { title: 'Total Revenue', value: formatPeso(stats.totalRevenue || 0), icon: BarChart3, color: 'text-green-600' }
      ];
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const promoteUser = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/auth/promote/${userId}`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User role updated successfully');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentIndustry = industries.find(ind => ind.id === selectedIndustry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Shield className="text-primary-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Multi-industry management system</p>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setShowUserManagement(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showUserManagement 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Industry Management
        </button>
        <button
          onClick={() => setShowUserManagement(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showUserManagement 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          User Management
        </button>
      </div>

      {/* User Management Section */}
      {showUserManagement ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Management</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userItem.username}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {userItem.industry?.replace('-', ' ')}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.businessName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {userItem._id !== user.id && (
                            <div className="flex gap-2">
                              {userItem.role !== 'admin' && (
                                <button
                                  onClick={() => promoteUser(userItem._id, 'admin')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Promote to Admin"
                                >
                                  Admin
                                </button>
                              )}
                              {userItem.role !== 'manager' && (
                                <button
                                  onClick={() => promoteUser(userItem._id, 'manager')}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Promote to Manager"
                                >
                                  Manager
                                </button>
                              )}
                              {userItem.role !== 'employee' && (
                                <button
                                  onClick={() => promoteUser(userItem._id, 'employee')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Demote to Employee"
                                >
                                  Employee
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Industry Selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Industry to Manage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {industries.map((industry) => {
            const IconComponent = industry.icon;
            return (
              <motion.div
                key={industry.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedIndustry === industry.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 ${industry.color} rounded-lg flex items-center justify-center mb-3`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                <p className="text-sm text-gray-600">{industry.features.length} features</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Industry Overview */}
      {currentIndustry && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 ${currentIndustry.color} rounded-lg flex items-center justify-center`}>
              <currentIndustry.icon className="text-white" size={16} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{currentIndustry.name} Management</h2>
          </div>

          {/* Industry Features */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Available Features</h3>
            <div className="flex flex-wrap gap-2">
              {currentIndustry.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Industry Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {getIndustryStatsCards().map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={stat.color} size={20} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {loading ? '...' : stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.title}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedIndustry === 'healthcare' && (
                <>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Users className="text-blue-600 mb-2" size={20} />
                    <div className="font-medium">Manage Patients</div>
                    <div className="text-sm text-gray-600">Add, edit, or view patient records</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Calendar className="text-green-600 mb-2" size={20} />
                    <div className="font-medium">Schedule Appointments</div>
                    <div className="text-sm text-gray-600">Book and manage appointments</div>
                  </button>
                </>
              )}
              
              {(selectedIndustry === 'food-beverage' || selectedIndustry === 'retail' || selectedIndustry === 'manufacturing') && (
                <>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Package className="text-blue-600 mb-2" size={20} />
                    <div className="font-medium">Manage Products</div>
                    <div className="text-sm text-gray-600">Add, edit, or view products</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <ShoppingCart className="text-green-600 mb-2" size={20} />
                    <div className="font-medium">View Orders</div>
                    <div className="text-sm text-gray-600">Monitor and manage orders</div>
                  </button>
                </>
              )}

              {selectedIndustry === 'services' && (
                <>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Calendar className="text-blue-600 mb-2" size={20} />
                    <div className="font-medium">Manage Appointments</div>
                    <div className="text-sm text-gray-600">Schedule and track services</div>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Users className="text-green-600 mb-2" size={20} />
                    <div className="font-medium">Customer Database</div>
                    <div className="text-sm text-gray-600">Manage customer information</div>
                  </button>
                </>
              )}

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <BarChart3 className="text-purple-600 mb-2" size={20} />
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-gray-600">Generate detailed reports</div>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Database className="text-orange-600 mb-2" size={20} />
                <div className="font-medium">System Settings</div>
                <div className="text-sm text-gray-600">Configure system preferences</div>
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Admin Info */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white p-6">
        <div className="flex items-center gap-3 mb-3">
          <Shield size={24} />
          <h3 className="text-lg font-semibold">Admin Access</h3>
        </div>
        <p className="mb-2">Logged in as: <strong>{user.username}</strong></p>
        <p className="mb-2">Current Business: <strong>{user.businessName}</strong></p>
        <p className="text-primary-100">You have full administrative access to manage all industry types and system settings.</p>
      </div>
    </motion.div>
  );
};

export default Admin; 