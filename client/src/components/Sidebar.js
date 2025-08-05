import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  Clock,
  TrendingUp,
  Utensils,
  Package,
  BookOpen,
  DollarSign,
  Users,
  FileText,
  Shield,
  LogOut,
  Building,
  Stethoscope,
  ShoppingBag,
  Heart,
  Activity,
  Store,
  Pill,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

    const getMenuItems = () => {
    const industry = user?.industry || 'food-beverage';
    const userRole = user?.role || 'employee';
    const userType = user?.userType || 'employee';

    // Super Admin gets special menu
    if (userType === 'super-admin') {
      return [
        { path: '/super-admin', icon: Shield, label: 'Super Admin' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ];
    }

    // Base items available to all users
    let baseItems = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/time-clock', icon: Clock, label: 'Time Clock' },
    ];

    // Business Admin features
    if (userType === 'business-admin') {
      baseItems.push(
        { path: '/employee-management', icon: Users, label: 'Employees' },
      );
    }

    // Management features  
    if (userRole === 'admin' || userRole === 'manager' || userType === 'business-admin') {
      baseItems.push(
        { path: '/sales', icon: TrendingUp, label: 'Sales' },
        { path: '/expenses', icon: DollarSign, label: 'Expenses' },
        { path: '/payroll', icon: Users, label: 'Payroll' },
        { path: '/reports', icon: FileText, label: 'Reports' }
      );
    }

    // Admin/Business Admin features
    if (userRole === 'admin' || userType === 'business-admin') {
      baseItems.push(
        { path: '/admin', icon: Shield, label: 'Admin' }
      );
    }

    // Industry-specific items with role-based filtering
    const getIndustryItems = (industry) => {
      const allItems = {
        'food-beverage': [
          { path: '/pos', icon: ShoppingCart, label: 'POS System', roles: ['employee', 'manager', 'admin'] },
          { path: '/order-queue', icon: ChefHat, label: 'Order Queue', roles: ['employee', 'manager', 'admin'] },
          { path: '/menu', icon: Utensils, label: 'Menu', roles: ['manager', 'admin'] },
          { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'admin'] },
          { path: '/recipes', icon: BookOpen, label: 'Recipes & Costing', roles: ['manager', 'admin'] },
        ],
        'retail': [
          { path: '/pos', icon: ShoppingCart, label: 'POS System', roles: ['employee', 'manager', 'admin'] },
          { path: '/products', icon: Store, label: 'Products', roles: ['manager', 'admin'] },
          { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'admin'] },
          { path: '/orders', icon: ShoppingBag, label: 'Orders', roles: ['employee', 'manager', 'admin'] },
          { path: '/customers', icon: Users, label: 'Customers', roles: ['employee', 'manager', 'admin'] },
        ],
        'healthcare': [
          { path: '/appointments', icon: Activity, label: 'Appointments', roles: ['employee', 'manager', 'admin'] },
          { path: '/patients', icon: Heart, label: 'Patients', roles: ['employee', 'manager', 'admin'] },
          { path: '/treatments', icon: Stethoscope, label: 'Treatments', roles: ['employee', 'manager', 'admin'] },
          { path: '/prescriptions', icon: Pill, label: 'Prescriptions', roles: ['manager', 'admin'] },
          { path: '/billing', icon: DollarSign, label: 'Billing', roles: ['manager', 'admin'] },
        ],
        'manufacturing': [
          { path: '/products', icon: Store, label: 'Products', roles: ['manager', 'admin'] },
          { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'admin'] },
          { path: '/orders', icon: ShoppingBag, label: 'Orders', roles: ['employee', 'manager', 'admin'] },
          { path: '/customers', icon: Users, label: 'Customers', roles: ['employee', 'manager', 'admin'] },
        ],
        'services': [
          { path: '/appointments', icon: Activity, label: 'Appointments', roles: ['employee', 'manager', 'admin'] },
          { path: '/customers', icon: Users, label: 'Customers', roles: ['employee', 'manager', 'admin'] },
          { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'admin'] },
        ]
      };

      const items = allItems[industry] || [];
      
      // Business admins get access to all features for their industry
      if (userType === 'business-admin') {
        return items.map(item => ({
          path: item.path,
          icon: item.icon,
          label: item.label
        }));
      }
      
      // Regular employees/managers get role-based filtering
      return items.filter(item => item.roles.includes(userRole)).map(item => ({
        path: item.path,
        icon: item.icon,
        label: item.label
      }));
    };

    const industrySpecific = getIndustryItems(industry);

    // Insert industry-specific items after dashboard
    const menuItems = [...baseItems];
    menuItems.splice(1, 0, ...industrySpecific);

    return menuItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white border-r border-gray-200 flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Building className="text-white" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">
              {user?.businessName || 'Business Name'}
            </h1>
            <p className="text-xs text-gray-500 capitalize">
              {user?.industry?.replace('-', ' ') || 'Management System'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Management
          </h2>
        </div>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.logo ? (
              <img
                src={user.logo}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="text-gray-600" size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'Employee'}
            </p>
          </div>
        </div>
        
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link w-full justify-start mb-2 ${isActive ? 'active' : ''}`
          }
        >
          <Settings size={20} />
          <span>Profile & Settings</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="sidebar-link w-full justify-start"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar; 