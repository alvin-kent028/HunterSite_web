// backend/server.js
// Main Server File - Entry Point for the Backend
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API Routes
app.use('/api/jobs', require('./routes/jobs'));

// Test route
app.get('/', (req, res) => {
  res.json({
    message: '✅ HunterSite API is running!',
    version: '1.0.0',
    endpoints: {
      getAllJobs: 'GET /api/jobs',
      getJobById: 'GET /api/jobs/:id',
      createJob: 'POST /api/jobs',
      updateJob: 'PUT /api/jobs/:id',
      deleteJob: 'DELETE /api/jobs/:id',
      getByCategory: 'GET /api/jobs/category/:category'
    },
    examples: {
      searchJobs: 'GET /api/jobs?search=developer&category=it-software',
      filterByLocation: 'GET /api/jobs?location=remote',
      filterByType: 'GET /api/jobs?type=Full-time'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 HunterSite Backend Server`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📊 API Endpoint: http://localhost:${PORT}/api/jobs`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});
