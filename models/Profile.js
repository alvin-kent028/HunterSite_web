const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  basicInfo: {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '../assets/images/profile/profile-avatar.svg' },
    online: { type: Boolean, default: false },
    jobStatus: { type: String, default: 'Passively looking for jobs' },
    views: { type: Number, default: 0 }
  },
  resume: {
    fileName: { type: String, default: '' },
    url: { type: String, default: '' }
  },
  skills: {
    technical: [{ name: String, level: Number }],
    soft: [String],
    tools: [{ name: String, level: String }]
  },
  experience: [{
    title: String,
    company: String,
    duration: String,
    location: String,
    responsibilities: [String]
  }],
  education: [{
    degree: String,
    school: String,
    graduation: String,
    gpa: String,
    description: String,
    coursesLabel: String,
    courses: [String]
  }],
  todo: {
    items: {
      'create-account': { type: Boolean, default: true },
      'complete-basic': { type: Boolean, default: false },
      'work-experience': { type: Boolean, default: false },
      'upload-resume': { type: Boolean, default: false },
      'add-education': { type: Boolean, default: false }
    },
    summary: {
      total: { type: Number, default: 5 },
      done: { type: Number, default: 1 },
      pct: { type: Number, default: 20 }
    }
  },
  savedJobs: [{ type: String }],
  applications: [{
    jobId: String,
    jobTitle: String,
    company: String,
    appliedDate: Date,
    status: { type: String, default: 'pending' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamp
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate todo completion
  const items = this.todo?.items || {};
  const done = Object.values(items).filter(v => v === true).length;
  const total = this.todo?.summary?.total || 5;
  
  if (!this.todo) this.todo = {};
  if (!this.todo.summary) this.todo.summary = {};
  
  this.todo.summary.done = done;
  this.todo.summary.pct = Math.round((done / total) * 100);
  
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
