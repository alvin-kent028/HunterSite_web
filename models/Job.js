// backend/models/Job.js
// Job Model - Defines the structure of job documents

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  requirements: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  salary: {
    type: String,
    default: 'Competitive'
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['it-software', 'engineering', 'design', 'marketing', 'sales', 'finance']
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending'],
    default: 'active'
  },
  postedBy: {
    type: String,
    default: 'Anonymous'
  },
  applications: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Create indexes for better search performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ category: 1 });
jobSchema.index({ location: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
