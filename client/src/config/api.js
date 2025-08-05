// API Configuration for different environments

const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'https://ava-atpq.onrender.com',
  }
};

const environment = process.env.NODE_ENV || 'development';

export const API_CONFIG = config[environment];

// Axios base configuration
export const axiosConfig = {
  baseURL: API_CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;