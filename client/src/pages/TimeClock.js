import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Square, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const TimeClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [timeEntries, setTimeEntries] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load saved time entries from localStorage
    const savedEntries = localStorage.getItem(`timeEntries_${user.id}`);
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    }

    // Check if user is currently clocked in
    const savedClockIn = localStorage.getItem(`clockedIn_${user.id}`);
    if (savedClockIn) {
      setClockedIn(true);
      setClockInTime(new Date(savedClockIn));
    }

    return () => clearInterval(timer);
  }, [user.id]);

  useEffect(() => {
    if (clockedIn && clockInTime) {
      const diff = (currentTime - clockInTime) / (1000 * 60 * 60); // hours
      setTotalHours(diff);
    }
  }, [currentTime, clockedIn, clockInTime]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHours = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const handleClockIn = () => {
    const now = new Date();
    setClockedIn(true);
    setClockInTime(now);
    localStorage.setItem(`clockedIn_${user.id}`, now.toISOString());
    toast.success('Clocked in successfully!');
  };

  const handleClockOut = () => {
    if (!clockInTime) return;

    const now = new Date();
    const duration = (now - clockInTime) / (1000 * 60 * 60); // hours

    const newEntry = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      clockIn: clockInTime.toISOString(),
      clockOut: now.toISOString(),
      duration: duration,
      user: user.username
    };

    const updatedEntries = [newEntry, ...timeEntries];
    setTimeEntries(updatedEntries);
    localStorage.setItem(`timeEntries_${user.id}`, JSON.stringify(updatedEntries));

    setClockedIn(false);
    setClockInTime(null);
    setTotalHours(0);
    localStorage.removeItem(`clockedIn_${user.id}`);
    toast.success(`Clocked out! Worked ${formatHours(duration)}`);
  };

  const todayEntries = timeEntries.filter(entry => 
    entry.date === new Date().toISOString().split('T')[0]
  );

  const todayTotal = todayEntries.reduce((sum, entry) => sum + entry.duration, 0) + (clockedIn ? totalHours : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Clock className="text-primary-600" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Clock</h1>
          <p className="text-gray-600">Track your work hours</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clock In/Out */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-gray-600">{formatDate(currentTime)}</div>
          </div>

          <div className="flex justify-center mb-6">
            {clockedIn ? (
              <button
                onClick={handleClockOut}
                className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                <Square size={20} />
                Clock Out
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                <Play size={20} />
                Clock In
              </button>
            )}
          </div>

          {clockedIn && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-700 mb-1">Currently Working</div>
              <div className="text-lg font-semibold text-green-800">
                Started at {formatTime(clockInTime)}
              </div>
              <div className="text-sm text-green-600">
                Duration: {formatHours(totalHours)}
              </div>
            </div>
          )}
        </div>

        {/* Today's Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Hours</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-blue-600" size={20} />
              <div>
                <div className="text-sm text-gray-600">Employee</div>
                <div className="font-medium">{user.username}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={20} />
              <div>
                <div className="text-sm text-gray-600">Total Today</div>
                <div className="font-medium text-green-700">{formatHours(todayTotal)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-purple-600" size={20} />
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className={`font-medium ${clockedIn ? 'text-green-700' : 'text-gray-700'}`}>
                  {clockedIn ? 'Clocked In' : 'Clocked Out'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Time Entries */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Time Entries</h3>
        
        {timeEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No time entries yet. Clock in to start tracking your hours!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(entry.clockIn).toLocaleDateString('en-PH')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTime(new Date(entry.clockIn))}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatTime(new Date(entry.clockOut))}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-700">
                      {formatHours(entry.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TimeClock;