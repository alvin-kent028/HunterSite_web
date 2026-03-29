const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoose = require('mongoose');

// MongoDB Models
const User = require('./models/User');
const Profile = require('./models/Profile');
const Job = require('./models/Job');

// Google Auth Library
let { google } = require('google-auth-library');

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/huntersite';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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
    ];
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
app.use(express.json({ limit: '10mb' }));

// Serve static files
app.use(express.static(__dirname));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// JWT Helper
function generateToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, userType: user.userType, name: user.name },
    JWT_SECRET,
    { expiresIn: '4h' }
  );
}

// Auth Middleware
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

// Google OAuth
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
let client = null;
if (CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
  try {
    client = new google.auth.OAuth2(CLIENT_ID);
  } catch (error) {
    console.warn('Google OAuth initialization failed:', error.message);
  }
}

// ==================== AUTH ROUTES ====================

// Email Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, userType = 'jobseeker' } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    
    const sanitizedEmail = email.toLowerCase().trim();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
    if (!gmailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Only Gmail addresses are allowed' });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Find or create user in MongoDB
    let user = await User.findOne({ email: sanitizedEmail });
    
    if (!user) {
      user = new User({
        email: sanitizedEmail,
        name: sanitizedEmail.split('@')[0],
        userType: userType,
        authSource: 'email',
        loginCount: 1
      });
      await user.save();
      
      // Create empty profile for new user
      await Profile.create({
        userId: user._id.toString(),
        email: sanitizedEmail,
        basicInfo: {
          name: user.name,
          email: sanitizedEmail,
          jobStatus: 'Passively looking for jobs'
        }
      });
    } else {
      user.loginCount += 1;
      await user.save();
    }
    
    const token = generateToken(user);
    
    console.log(`[SECURITY] Login successful: ${sanitizedEmail}`);
    
    res.json({
      message: 'Login successful',
      token,
      expiresIn: '4h',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        authSource: user.authSource
      }
    });
  } catch (error) {
    console.error('[SECURITY] Login error:', error);
    res.status(500).json({ error: 'Authentication service temporarily unavailable' });
  }
});

// Google OAuth
app.post('/api/auth/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Valid Google credential required' });
    }
    
    // Decode token (in production, verify with Google)
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
    if (!gmailRegex.test(payload.email)) {
      return res.status(400).json({ error: 'Only Gmail accounts are allowed' });
    }
    
    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      user = new User({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        userType: 'jobseeker',
        authSource: 'google',
        googleId: payload.sub,
        loginCount: 1
      });
      await user.save();
      
      // Create profile for new user
      await Profile.create({
        userId: user._id.toString(),
        email: payload.email,
        basicInfo: {
          name: payload.name,
          email: payload.email,
          avatar: payload.picture,
          jobStatus: 'Passively looking for jobs'
        }
      });
    } else {
      user.loginCount += 1;
      if (payload.picture) user.picture = payload.picture;
      await user.save();
    }
    
    const token = generateToken(user);
    
    res.json({
      message: 'Google login successful',
      token,
      expiresIn: '4h',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('[SECURITY] Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  // In a more advanced setup, you could blacklist tokens here
  res.json({ message: 'Logout successful' });
});

// ==================== PROFILE ROUTES ====================

// Get my profile
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      // Create profile if doesn't exist
      profile = await Profile.create({
        userId: req.user.id,
        email: req.user.email,
        basicInfo: {
          name: req.user.name,
          email: req.user.email
        }
      });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id; // Prevent ID modification
    delete updates.userId; // Prevent userId modification
    
    let profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );
    
    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete profile
app.delete('/api/profile', verifyToken, async (req, res) => {
  try {
    await Profile.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Profile deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// ==================== JOBS ROUTES ====================

// Get all jobs (with search)
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, category, location, page = 1, limit = 20 } = req.query;
    const query = { status: 'active' };
    
    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Increment views
    job.views += 1;
    await job.save();
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create job (employer only)
app.post('/api/jobs', verifyToken, async (req, res) => {
  try {
    if (req.user.userType !== 'employer') {
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }
    
    const job = new Job({
      ...req.body,
      employerId: req.user.id,
      employerEmail: req.user.email
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (employer only, own jobs)
app.put('/api/jobs/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    if (req.user.userType !== 'employer' || job.employerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json({ message: 'Job updated', job: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (employer only, own jobs)
app.delete('/api/jobs/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    if (req.user.userType !== 'employer' || job.employerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ==================== SAVED JOBS & APPLICATIONS ====================

// Save a job
app.post('/api/saved-jobs/:jobId', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    if (!profile.savedJobs.includes(req.params.jobId)) {
      profile.savedJobs.push(req.params.jobId);
      await profile.save();
    }
    
    res.json({ message: 'Job saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Get saved jobs
app.get('/api/saved-jobs', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.json({ savedJobs: [] });
    
    const jobs = await Job.find({ _id: { $in: profile.savedJobs } });
    res.json({ savedJobs: jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// Apply to job
app.post('/api/applications', verifyToken, async (req, res) => {
  try {
    const { jobId, jobTitle, company } = req.body;
    
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    profile.applications.push({
      jobId,
      jobTitle,
      company,
      appliedDate: new Date(),
      status: 'pending'
    });
    
    await profile.save();
    
    // Increment job applications count
    await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });
    
    res.json({ message: 'Application submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get my applications
app.get('/api/applications', verifyToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.json({ applications: [] });
    
    res.json({ applications: profile.applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('\n🔐 AUTH:');
  console.log('  POST /api/auth/login       - Email login');
  console.log('  POST /api/auth/google      - Google OAuth login');
  console.log('  GET  /api/auth/me          - Get current user');
  console.log('  POST /api/auth/logout      - Logout');
  console.log('\n👤 PROFILE:');
  console.log('  GET    /api/profile        - Get my profile');
  console.log('  PUT    /api/profile        - Update profile');
  console.log('  DELETE /api/profile        - Delete profile');
  console.log('\n💼 JOBS:');
  console.log('  GET    /api/jobs           - Get all jobs (search: ?search=term)');
  console.log('  GET    /api/jobs/:id       - Get single job');
  console.log('  POST   /api/jobs           - Create job (employer only)');
  console.log('  PUT    /api/jobs/:id       - Update job (employer only)');
  console.log('  DELETE /api/jobs/:id       - Delete job (employer only)');
  console.log('\n🔖 SAVED JOBS & APPLICATIONS:');
  console.log('  POST   /api/saved-jobs/:jobId  - Save a job');
  console.log('  GET    /api/saved-jobs         - Get saved jobs');
  console.log('  POST   /api/applications       - Apply to job');
  console.log('  GET    /api/applications       - Get my applications');
});
