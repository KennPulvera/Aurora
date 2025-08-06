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

  Layers,
  Heart,
  Activity,
  Store,
  Pill,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

    const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getMenuSections = () => {
    const industry = user?.industry || 'food-beverage';
    const userRole = user?.role || 'employee';
    const userType = user?.userType || 'employee';

    // Super Admin gets special menu
    if (userType === 'super-admin') {
      return [
        {
          id: 'super-admin',
          type: 'single',
          path: '/super-admin',
          icon: Shield,
          label: 'Super Admin'
        },
        {
          id: 'dashboard',
          type: 'single',
          path: '/dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard'
        }
      ];
    }

    const sections = [
      // Dashboard (always visible)
      {
        id: 'dashboard',
        type: 'group',
        icon: BarChart3,
        label: 'Dashboard',
        items: [
          { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
          { path: '/features', icon: Layers, label: 'Features' }
        ]
      }
    ];

    // POS System section
    const posItems = [];
    if (industry === 'food-beverage') {
      posItems.push(
        { path: '/pos', icon: ShoppingCart, label: 'POS System', roles: ['employee', 'manager', 'admin'] },
        { path: '/order-queue', icon: ChefHat, label: 'Order Queue', roles: ['employee', 'manager', 'admin'] },
        { path: '/menu', icon: Utensils, label: 'Menu', roles: ['manager', 'admin'] },
        { path: '/recipes', icon: BookOpen, label: 'Recipes & Costing', roles: ['manager', 'admin'] }
      );
    } else if (industry === 'retail') {
      posItems.push(
        { path: '/pos', icon: ShoppingCart, label: 'POS System', roles: ['employee', 'manager', 'admin'] },
        { path: '/orders', icon: ShoppingBag, label: 'Orders', roles: ['employee', 'manager', 'admin'] },
        { path: '/customers', icon: Users, label: 'Customers', roles: ['employee', 'manager', 'admin'] }
      );
    } else if (industry === 'healthcare') {
      posItems.push(
        { path: '/appointments', icon: Activity, label: 'Appointments', roles: ['employee', 'manager', 'admin'] },
        { path: '/patients', icon: Heart, label: 'Patients', roles: ['employee', 'manager', 'admin'] },
        { path: '/treatments', icon: Stethoscope, label: 'Treatments', roles: ['employee', 'manager', 'admin'] },
        { path: '/prescriptions', icon: Pill, label: 'Prescriptions', roles: ['manager', 'admin'] },
        { path: '/billing', icon: DollarSign, label: 'Billing', roles: ['manager', 'admin'] }
      );
    }

    // Filter POS items by role
    const filteredPosItems = posItems.filter(item => 
      !item.roles || item.roles.includes(userRole) || userType === 'business-admin'
    );

    if (filteredPosItems.length > 0) {
      sections.push({
        id: 'pos',
        type: 'group',
        icon: ShoppingCart,
        label: industry === 'healthcare' ? 'Patient Management' : 'POS System',
        items: filteredPosItems
      });
    }

    // Inventory Management section
    const inventoryItems = [];
    if (industry === 'food-beverage' || industry === 'retail') {
      inventoryItems.push(
        { path: '/inventory', icon: Package, label: 'Inventory', roles: ['manager', 'admin'] }
      );
      if (industry === 'retail') {
        inventoryItems.push(
          { path: '/products', icon: Store, label: 'Products', roles: ['manager', 'admin'] }
        );
      }
    }

    const filteredInventoryItems = inventoryItems.filter(item => 
      !item.roles || item.roles.includes(userRole) || userType === 'business-admin'
    );

    if (filteredInventoryItems.length > 0) {
      sections.push({
        id: 'inventory',
        type: 'group',
        icon: Package,
        label: 'Inventory Management',
        items: filteredInventoryItems
      });
    }

    // Staff Management section
    const staffItems = [
      { path: '/time-clock', icon: Clock, label: 'Time Clock' }
    ];

    if (userType === 'business-admin') {
      staffItems.push(
        { path: '/employee-management', icon: Users, label: 'Employees' }
      );
    }

    if (userRole === 'admin' || userRole === 'manager' || userType === 'business-admin') {
      staffItems.push(
        { path: '/payroll', icon: DollarSign, label: 'Payroll' }
      );
    }

    sections.push({
      id: 'staff',
      type: 'group',
      icon: Users,
      label: 'Staff Management',
      items: staffItems
    });

    // Financials section
    if (userRole === 'admin' || userRole === 'manager' || userType === 'business-admin') {
      sections.push({
        id: 'financials',
        type: 'group',
        icon: TrendingUp,
        label: 'Financials',
        items: [
          { path: '/sales', icon: TrendingUp, label: 'Sales' },
          { path: '/expenses', icon: DollarSign, label: 'Expenses' },
          { path: '/reports', icon: FileText, label: 'Reports' }
        ]
      });
    }

    // Features section (for admin and managers)
    if (userRole === 'admin' || userRole === 'manager' || userType === 'business-admin') {
      sections.push({
        id: 'features',
        type: 'single',
        path: '/dashboard-features',
        icon: Layers,
        label: 'Features'
      });
    }



    // Admin section
    if (userRole === 'admin' || userType === 'business-admin') {
      sections.push({
        id: 'admin',
        type: 'single',
        path: '/admin',
        icon: Shield,
        label: 'Admin'
      });
    }

    return sections;
  };

  const menuSections = getMenuSections();

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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.id} className="mb-2">
            {section.type === 'single' ? (
              // Single navigation item
              <NavLink
                to={section.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <section.icon size={20} />
                <span>{section.label}</span>
              </NavLink>
            ) : (
              // Grouped section with sub-items
              <div>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 mb-1"
                >
                  <div className="flex items-center gap-3">
                    <section.icon size={18} />
                    <span className="font-medium text-sm">{section.label}</span>
                  </div>
                  {collapsedSections[section.id] ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
                
                {!collapsedSections[section.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-6 space-y-1"
                  >
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-sm ${
                            isActive ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
                          }`
                        }
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
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