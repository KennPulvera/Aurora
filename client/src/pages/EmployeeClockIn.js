import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, User, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const EmployeeClockIn = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);

  // Get business ID from URL params (or could be passed as prop)
  const businessId = window.location.pathname.split('/')[2] || localStorage.getItem('businessId');

  useEffect(() => {
    if (businessId) {
      fetchEmployees();
    }
  }, [businessId]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`/api/employees/clock-in/${businessId}`);
      setEmployees(response.data);
      
      // You might also want to fetch business info for branding
      // const businessResponse = await axios.get(`/api/business/${businessId}`);
      // setBusinessInfo(businessResponse.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async (action) => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    setClockingIn(true);
    try {
      const response = await axios.post(`/api/employees/clock/${action}/${selectedEmployee.employeeId}`, {
        businessId
      });

      toast.success(response.data.message);
      
      // Refresh employees list to update status
      await fetchEmployees();
      
      // Clear selection after successful action
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Clock action error:', error);
      const errorMessage = error.response?.data?.message || `Failed to clock ${action}`;
      toast.error(errorMessage);
    } finally {
      setClockingIn(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Time Clock</h1>
          <p className="text-gray-600">Select your name and clock in or out</p>
          <div className="text-sm text-gray-500 mt-2">
            Current Time: {formatTime(new Date())}
          </div>
        </motion.div>

        {/* Employee Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Employee</h2>
          
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found for this business.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <motion.div
                  key={employee._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEmployee(employee)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEmployee?._id === employee._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {employee.avatar ? (
                          <img
                            src={employee.avatar}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="text-gray-400" size={24} />
                        )}
                      </div>
                      {/* Status indicator */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        employee.currentlyCheckedIn ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                      <p className="text-xs text-gray-400">ID: {employee.employeeId}</p>
                    </div>
                    
                    <div className="text-right">
                      {employee.currentlyCheckedIn ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <CheckCircle size={16} className="mr-1" />
                          Checked In
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 text-sm">
                          <XCircle size={16} className="mr-1" />
                          Checked Out
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        {selectedEmployee && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selected: {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h3>
              <p className="text-gray-600">{selectedEmployee.position}</p>
              <p className="text-sm text-gray-500">
                Status: {selectedEmployee.currentlyCheckedIn ? 'Currently Checked In' : 'Currently Checked Out'}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleClockAction('in')}
                disabled={clockingIn || selectedEmployee.currentlyCheckedIn}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition-colors min-w-[150px] justify-center"
              >
                <LogIn size={20} />
                {clockingIn ? 'Processing...' : 'Clock In'}
              </button>

              <button
                onClick={() => handleClockAction('out')}
                disabled={clockingIn || !selectedEmployee.currentlyCheckedIn}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition-colors min-w-[150px] justify-center"
              >
                <LogOut size={20} />
                {clockingIn ? 'Processing...' : 'Clock Out'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel Selection
              </button>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-gray-500 text-sm"
        >
          <p>Select your name from the list above, then click Clock In or Clock Out.</p>
          <p>Green dot indicates currently checked in, gray dot indicates checked out.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeClockIn;