import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Clock, UserCheck, UserX, Settings } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hourlyRate: '',
    hireDate: new Date().toISOString().split('T')[0],
    permissions: {
      canUsePOS: true,
      canViewSales: false,
      canManageInventory: false,
      canViewReports: false,
      canManageOrders: true,
      canManageAppointments: true,
      canManagePatients: false
    }
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.userType === 'business-admin') {
      fetchEmployees();
      fetchBusinessInfo();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessInfo = async () => {
    try {
      // This would fetch business subscription info
      // For now, we'll simulate it
      setBusinessInfo({
        employeeLimit: 5,
        currentEmployees: employees.length
      });
    } catch (error) {
      console.error('Error fetching business info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingEmployee) {
        await axios.put(`/api/employees/${editingEmployee._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Employee updated successfully');
      } else {
        await axios.post('/api/employees', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Employee added successfully');
      }

      fetchEmployees();
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save employee';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department || '',
      hourlyRate: employee.hourlyRate.toString(),
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      permissions: employee.permissions
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Employee deactivated successfully');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to deactivate employee');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      hourlyRate: '',
      hireDate: new Date().toISOString().split('T')[0],
      permissions: {
        canUsePOS: true,
        canViewSales: false,
        canManageInventory: false,
        canViewReports: false,
        canManageOrders: true,
        canManageAppointments: true,
        canManagePatients: false
      }
    });
    setEditingEmployee(null);
    setShowModal(false);
  };

  const getClockInLink = () => {
    return `${window.location.origin}/employee-clock/${user.businessId}`;
  };

  const copyClockInLink = () => {
    navigator.clipboard.writeText(getClockInLink());
    toast.success('Clock-in link copied to clipboard!');
  };

  if (user.userType !== 'business-admin') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">Only business administrators can manage employees.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Users className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-600">Manage your team members</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          disabled={employees.length >= (businessInfo?.employeeLimit || 5)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Employee Limit Warning */}
      {employees.length >= (businessInfo?.employeeLimit || 5) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <UserX size={20} />
            <span className="font-medium">Employee Limit Reached</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            You've reached your plan's employee limit ({businessInfo?.employeeLimit || 5} employees). 
            Upgrade your plan to add more employees.
          </p>
        </div>
      )}

      {/* Clock-in Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Employee Clock-in Link</h3>
            <p className="text-blue-700 text-sm">Share this link with your employees for easy time tracking</p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block">{getClockInLink()}</code>
          </div>
          <button
            onClick={copyClockInLink}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{employees.length}</div>
          <div className="text-sm text-gray-600">Total Employees</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {employees.filter(emp => emp.currentlyCheckedIn).length}
          </div>
          <div className="text-sm text-gray-600">Currently Checked In</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-purple-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(employees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employees.length || 0)}
          </div>
          <div className="text-sm text-gray-600">Avg Hourly Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Settings className="text-orange-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {businessInfo?.employeeLimit || 5}
          </div>
          <div className="text-sm text-gray-600">Employee Limit</div>
        </motion.div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(employee => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={employee.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="text-gray-400" size={20} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        {employee.email && (
                          <div className="text-xs text-gray-400">{employee.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                    {employee.department && (
                      <div className="text-sm text-gray-500">{employee.department}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPeso(employee.hourlyRate)}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        employee.currentlyCheckedIn ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <span className={`text-sm ${
                        employee.currentlyCheckedIn ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {employee.currentlyCheckedIn ? 'Checked In' : 'Checked Out'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.hireDate).toLocaleDateString('en-PH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
            <p className="text-gray-500 mb-4">Add your first employee to get started!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(formData.permissions).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [key]: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingEmployee ? 'Update' : 'Add'} Employee
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeManagement;