const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB Connection - Use environment variable for production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kennispulvera:kennkenn@cluster0.3lyyy37.mongodb.net/ava-business?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  console.log('🌐 Database:', mongoose.connection.name);
  console.log('🚀 Environment:', process.env.NODE_ENV || 'development');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(helmet());

// CORS Configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://localhost:3000', // Local development with HTTPS
    process.env.FRONTEND_URL, // Production Netlify URL
    /^https:\/\/.*\.netlify\.app$/ // Any Netlify preview deploys
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/inventory', require('./routes/inventory'));

// Healthcare routes
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));

// Retail routes
app.use('/api/products', require('./routes/products'));

// Employee routes
app.use('/api/employees', require('./routes/employees'));

// Super Admin routes
app.use('/api/superadmin', require('./routes/superadmin'));

// Health check endpoint for deployment services
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AVA Business Management System is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'AVA Business Management System API',
    version: '1.0.0',
    description: 'Multi-industry SaaS business management platform',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      employees: '/api/employees',
      superadmin: '/api/superadmin',
      products: '/api/products',
      orders: '/api/orders',
      patients: '/api/patients',
      appointments: '/api/appointments',
      inventory: '/api/inventory',
      menu: '/api/menu',
      health: '/api/health'
    }
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 