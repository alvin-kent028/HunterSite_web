const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Google Auth Library - only import if configured
let { google } = require('google-auth-library');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https:", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:5000", "https://accounts.google.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' },
  skipSuccessfulRequests: true,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      // Add your production domain here
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit request body size

// Serve static files
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

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
let client = null;

// Only initialize Google OAuth if CLIENT_ID is configured
if (CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
  try {
    client = new google.auth.OAuth2(CLIENT_ID);
  } catch (error) {
    console.warn('Google OAuth initialization failed:', error.message);
  }
}

// Routes

// Register/Email Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, userType = 'jobseeker' } = req.body;
    
    // Input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    
    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();
    
    // Validate Gmail address with regex
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
    if (!gmailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed' });
    }
    
    // Check if user exists
    let user = users.find(u => u.email === sanitizedEmail);
    
    if (!user) {
      // Create new user
      user = {
        id: require('crypto').randomUUID(),
        email: sanitizedEmail,
        userType: userType,
        name: sanitizedEmail.split('@')[0],
        authSource: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1
      };
      users.push(user);
    } else {
      // Update login tracking
      user.lastLogin = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;
    }
    
    // Generate token with shorter expiry for security
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: user.userType,
        name: user.name,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '4h' } // Shorter token lifetime
    );
    
    // Log security event (in production, use proper logging)
    console.log(`[SECURITY] Login successful: ${sanitizedEmail} from ${req.ip}`);
    
    res.json({
      message: 'Login successful',
      token,
      expiresIn: '4h',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        authSource: user.authSource,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('[SECURITY] Login error:', error);
    res.status(500).json({ error: 'Authentication service temporarily unavailable' });
  }
});

// Google OAuth Login
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Valid Google credential required' });
    }
    
    // Check if Google OAuth is configured
    if (!client) {
      return res.status(503).json({ error: 'Google OAuth service temporarily unavailable' });
    }
    
    // Verify Google token with additional security checks
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Validate Gmail with regex
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
    if (!gmailRegex.test(payload.email)) {
      console.log(`[SECURITY] Non-Gmail attempt blocked: ${payload.email} from ${req.ip}`);
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }
    
    // Additional security checks
    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Email not verified by Google' });
    }
    
    // Check if user exists
    let user = users.find(u => u.email === payload.email);
    
    if (!user) {
      // Create new user with enhanced security
      user = {
        id: require('crypto').randomUUID(),
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        userType: 'jobseeker', // Default, can be updated later
        authSource: 'google',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        googleId: payload.sub // Store Google's unique user ID
      };
      users.push(user);
    } else {
      // Update login tracking
      user.lastLogin = new Date().toISOString();
      user.loginCount = (user.loginCount || 0) + 1;
      if (payload.picture) user.picture = payload.picture;
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: user.userType,
        name: user.name,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '4h' }
    );
    
    // Log security event
    console.log(`[SECURITY] Google login successful: ${payload.email} from ${req.ip}`);
    
    res.json({
      message: 'Google login successful',
      token,
      expiresIn: '4h',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        userType: user.userType,
        authSource: user.authSource,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('[SECURITY] Google auth error:', error);
    res.status(500).json({ error: 'Google authentication service temporarily unavailable' });
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
