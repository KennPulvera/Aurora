import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Building, User, Upload } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { axiosConfig } from '../config/api';

// Configure axios defaults
axios.defaults.baseURL = axiosConfig.baseURL;
axios.defaults.timeout = axiosConfig.timeout;

const Login = ({ setIsAuthenticated }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    businessName: '',
    industry: '',
    logo: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const industries = [
    { id: 'food-beverage', name: 'Food & Beverage Industry' },
    { id: 'healthcare', name: 'Healthcare & Wellness' },
    { id: 'retail', name: 'Retail Stores' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'services', name: 'Professional Services' }
  ];

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({
        ...formData,
        logo: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(endpoint, formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      toast.success(isSignUp ? 'Account created successfully!' : 'Login successful!');
    } catch (error) {
      console.error('Auth error:', error);
      const errorMessage = error.response?.data?.message || 
        (isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Business Management
          </h1>
          <p className="text-gray-600">Sign in to your business dashboard</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-soft p-8">
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  !isSignUp
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  isSignUp
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            {isSignUp ? 'Create your business account' : 'Sign in to your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field (Signup only) */}
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Signup Fields */}
            {isSignUp && (
              <>
                {/* Business Name Field */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                {/* Industry Selection */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo Upload */}
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Logo (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Upload size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      onChange={handleChange}
                      accept="image/*"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing in...'}
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-500">Email: admin@business.com</p>
              <p className="text-xs text-gray-500">Password: password123</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 