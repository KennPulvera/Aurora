import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import OrderQueue from './pages/OrderQueue';
import TimeClock from './pages/TimeClock';
import Sales from './pages/Sales';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';
import Expenses from './pages/Expenses';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import EmployeeManagement from './pages/EmployeeManagement';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';

// Healthcare pages
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Treatments from './pages/Treatments';
import Prescriptions from './pages/Prescriptions';
import Billing from './pages/Billing';

// Retail pages
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setShowLanding(false);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLanding) {
      return <Landing onGetStarted={() => setShowLanding(false)} />;
    }
    return <Login setIsAuthenticated={setIsAuthenticated} onBackToLanding={() => setShowLanding(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Food & Beverage Routes */}
            <Route path="/pos" element={<POS />} />
            <Route path="/order-queue" element={<OrderQueue />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/recipes" element={<Recipes />} />
            
            {/* Retail Routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            
            {/* Healthcare Routes */}
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/treatments" element={<Treatments />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/billing" element={<Billing />} />
            
            {/* Common Routes */}
            <Route path="/time-clock" element={<TimeClock />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/reports" element={<Reports />} />
                              <Route path="/admin" element={<Admin />} />
                  <Route path="/super-admin" element={<SuperAdmin />} />
                  <Route path="/employee-management" element={<EmployeeManagement />} />
                  <Route path="/profile" element={<Profile />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App; 