const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { google } = require('google-auth-library');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user database (replace with real database in production)
const users = [];

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      userType: user.userType,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Helper function to verify JWT
function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Google OAuth configuration
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Replace with your actual client ID
const client = new google.auth.OAuth2(CLIENT_ID);

// Routes

// Register/Email Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, userType = 'jobseeker' } = req.body;
    
    // Validate Gmail address
    if (!email || !email.endsWith('@gmail.com') && !email.endsWith('@googlemail.com')) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed' });
    }
    
    // Check if user exists
    let user = users.find(u => u.email === email);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        email,
        userType,
        name: email.split('@')[0],
        authSource: 'email',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        authSource: user.authSource
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Validate Gmail
    if (!payload.email.endsWith('@gmail.com') && !payload.email.endsWith('@googlemail.com')) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }
    
    // Check if user exists
    let user = users.find(u => u.email === payload.email);
    
    if (!user) {
      // Create new user
      user = {
        id: Date.now().toString(),
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        userType: 'jobseeker', // Default, can be updated later
        authSource: 'google',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        userType: user.userType,
        authSource: user.authSource
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      userType: req.user.userType
    }
  });
});

// Logout (client-side handles token removal)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Update user type
app.put('/api/auth/user-type', verifyToken, (req, res) => {
  try {
    const { userType } = req.body;
    
    if (!['jobseeker', 'employer', 'admin'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }
    
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.userType = userType;
      res.json({ message: 'User type updated', userType });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Update user type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/auth/login - Email login');
  console.log('  POST /api/auth/google - Google OAuth login');
  console.log('  GET  /api/auth/me - Get current user');
  console.log('  POST /api/auth/logout - Logout');
  console.log('  PUT  /api/auth/user-type - Update user type');
});
