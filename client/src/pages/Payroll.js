import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Calendar, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [payrollData, setPayrollData] = useState({
    period: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    hourlyRate: '',
    overtime: '',
    deductions: '',
    bonus: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load employees (simplified - using localStorage)
    const savedEmployees = localStorage.getItem(`employees_${user.id}`);
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // Default employees
      const defaultEmployees = [
        { id: 1, name: 'John Doe', position: 'Manager', hourlyRate: 500 },
        { id: 2, name: 'Jane Smith', position: 'Cashier', hourlyRate: 300 },
        { id: 3, name: 'Mike Johnson', position: 'Cook', hourlyRate: 350 }
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem(`employees_${user.id}`, JSON.stringify(defaultEmployees));
    }

    // Load payroll records
    const savedPayroll = localStorage.getItem(`payroll_${user.id}`);
    if (savedPayroll) {
      setPayrollRecords(JSON.parse(savedPayroll));
    }
  };

  const calculatePay = () => {
    const hours = parseFloat(payrollData.hoursWorked) || 0;
    const rate = parseFloat(payrollData.hourlyRate) || 0;
    const overtime = parseFloat(payrollData.overtime) || 0;
    const bonus = parseFloat(payrollData.bonus) || 0;
    const deductions = parseFloat(payrollData.deductions) || 0;

    const regularPay = hours * rate;
    const overtimePay = overtime * rate * 1.5; // 1.5x for overtime
    const grossPay = regularPay + overtimePay + bonus;
    const netPay = grossPay - deductions;

    return { regularPay, overtimePay, grossPay, netPay };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !payrollData.hoursWorked || !payrollData.hourlyRate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employee = employees.find(emp => emp.id.toString() === selectedEmployee);
    const payCalculation = calculatePay();

    const newRecord = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      period: payrollData.period,
      hoursWorked: parseFloat(payrollData.hoursWorked),
      hourlyRate: parseFloat(payrollData.hourlyRate),
      overtime: parseFloat(payrollData.overtime) || 0,
      bonus: parseFloat(payrollData.bonus) || 0,
      deductions: parseFloat(payrollData.deductions) || 0,
      ...payCalculation,
      createdAt: new Date().toISOString()
    };

    const newRecords = [newRecord, ...payrollRecords];
    setPayrollRecords(newRecords);
    localStorage.setItem(`payroll_${user.id}`, JSON.stringify(newRecords));

    toast.success('Payroll record created successfully');
    resetForm();
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setPayrollData({
      period: new Date().toISOString().split('T')[0],
      hoursWorked: '',
      hourlyRate: '',
      overtime: '',
      deductions: '',
      bonus: ''
    });
    setShowModal(false);
  };

  const getTotalPayroll = () => {
    return payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
  };

  const getMonthlyPayroll = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return payrollRecords.filter(record => {
      const recordDate = new Date(record.period);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).reduce((sum, record) => sum + record.netPay, 0);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
            <p className="text-gray-600">Manage employee payroll</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Process Payroll
        </button>
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
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(getMonthlyPayroll())}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatPeso(getTotalPayroll())}
          </div>
          <div className="text-sm text-gray-600">Total Paid</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{payrollRecords.length}</div>
          <div className="text-sm text-gray-600">Pay Records</div>
        </motion.div>
      </div>

      {/* Payroll Records */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Payroll Records</h3>
        
        {payrollRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No payroll records yet. Process your first payroll to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrollRecords.slice(0, 10).map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(record.period).toLocaleDateString('en-PH')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.hoursWorked}h</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatPeso(record.hourlyRate)}/hr</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatPeso(record.grossPay)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatPeso(record.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{formatPeso(record.netPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">Process Payroll</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => {
                    setSelectedEmployee(e.target.value);
                    const emp = employees.find(emp => emp.id.toString() === e.target.value);
                    if (emp) {
                      setPayrollData({...payrollData, hourlyRate: emp.hourlyRate.toString()});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pay Period *
                </label>
                <input
                  type="date"
                  value={payrollData.period}
                  onChange={(e) => setPayrollData({...payrollData, period: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours Worked *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={payrollData.hoursWorked}
                    onChange={(e) => setPayrollData({...payrollData, hoursWorked: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₱) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollData.hourlyRate}
                    onChange={(e) => setPayrollData({...payrollData, hourlyRate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={payrollData.overtime}
                    onChange={(e) => setPayrollData({...payrollData, overtime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollData.bonus}
                    onChange={(e) => setPayrollData({...payrollData, bonus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payrollData.deductions}
                  onChange={(e) => setPayrollData({...payrollData, deductions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
              </div>

              {/* Pay Calculation Preview */}
              {payrollData.hoursWorked && payrollData.hourlyRate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Pay Calculation</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Regular Pay:</span>
                      <span>{formatPeso(calculatePay().regularPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime Pay:</span>
                      <span>{formatPeso(calculatePay().overtimePay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus:</span>
                      <span>{formatPeso(parseFloat(payrollData.bonus) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deductions:</span>
                      <span className="text-red-600">-{formatPeso(parseFloat(payrollData.deductions) || 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Net Pay:</span>
                      <span className="text-green-600">{formatPeso(calculatePay().netPay)}</span>
                    </div>
                  </div>
                </div>
              )}

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
                  Process Payroll
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Payroll;