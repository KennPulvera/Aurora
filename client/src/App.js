import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
// Removed complex financial utils - using direct localStorage now
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import OrderQueue from './pages/OrderQueue';
import TimeClock from './pages/TimeClock';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Recipes from './pages/Recipes';

import Payroll from './pages/Payroll';
import Admin from './pages/Admin';
import SuperAdmin from './pages/SuperAdmin';
import EmployeeManagement from './pages/EmployeeManagement';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';

import PublicFeatures from './pages/PublicFeatures';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Affiliate from './pages/Affiliate';

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

// New Analytics Pages
import SalesAnalytics from './pages/SalesAnalytics';
import ExpenseTracker from './pages/ExpenseTracker';
import BusinessReports from './pages/BusinessReports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    
    // Initialize financial system
    // Financial initialization removed - using direct localStorage in components
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/features', '/pricing', '/affiliate', '/login'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<PublicFeatures />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    );
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
            <Route path="/dashboard-features" element={<Features />} />
            <Route path="/time-clock" element={<TimeClock />} />
                  <Route path="/sales-analytics" element={<SalesAnalytics />} />
                  <Route path="/expense-tracker" element={<ExpenseTracker />} />
                  <Route path="/business-reports" element={<BusinessReports />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/payroll" element={<Payroll />} />
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