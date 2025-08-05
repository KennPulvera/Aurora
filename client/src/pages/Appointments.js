import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Users, Activity } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    reason: '',
    notes: '',
    isUrgent: false
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchAppointments();
      await fetchPatients();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`/api/appointments?date=${selectedDate}`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...formData,
        date: new Date(formData.date),
        duration: parseInt(formData.duration)
      };

      if (editingAppointment) {
        await axios.put(`/api/appointments/${editingAppointment._id}`, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        await axios.post('/api/appointments', appointmentData);
        toast.success('Appointment created successfully');
      }

      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to save appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      date: appointment.date.split('T')[0],
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes || '',
      isUrgent: appointment.isUrgent || false
    });
    setShowModal(true);
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointments/${appointmentId}`);
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Failed to delete appointment');
      }
    }
  };

  // const updateAppointmentStatus = async (appointmentId, newStatus) => {
  //   try {
  //     await axios.patch(`/api/appointments/${appointmentId}/status`, { status: newStatus });
  //     toast.success(`Appointment ${newStatus}`);
  //     fetchAppointments();
  //   } catch (error) {
  //     console.error('Error updating appointment status:', error);
  //     toast.error('Failed to update appointment status');
  //   }
  // };

  const resetForm = () => {
    setFormData({
      patient: '',
      doctor: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      reason: '',
      notes: '',
      isUrgent: false
    });
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'consultation':
        return 'bg-purple-100 text-purple-800';
      case 'follow-up':
        return 'bg-blue-100 text-blue-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'routine':
        return 'bg-green-100 text-green-800';
      case 'specialist':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayAppointments = appointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled');
  const completedToday = appointments.filter(apt => apt.status === 'completed');
  const pendingAppointments = appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and scheduling</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
            <Calendar className="text-primary-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</p>
            </div>
            <Clock className="text-yellow-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{completedToday.length}</p>
            </div>
            <Activity className="text-green-600" size={24} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </motion.div>
      </div>

      {/* Date Selector and Search */}
      <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{appointment.patient.patientId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{appointment.time}</div>
                    <div className="text-sm text-gray-500">{appointment.duration} min</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(appointment.type)}`}>
                      {appointment.type}
                    </span>
                    {appointment.isUrgent && (
                      <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Urgent
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{appointment.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
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
      </div>

      {/* Add/Edit Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient *
                  </label>
                  <select
                    name="patient"
                    value={formData.patient}
                    onChange={(e) => setFormData({...formData, patient: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    min="15"
                    max="180"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgent
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Mark as urgent</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Appointment reason"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingAppointment ? 'Update Appointment' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Appointments;