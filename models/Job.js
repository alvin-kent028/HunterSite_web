const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'], default: 'Full-time' },
  category: { type: String, required: true },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'PHP' },
    period: { type: String, default: 'monthly' }
  },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  benefits: [String],
  skills: [String],
  employerId: { type: String, required: true },
  employerEmail: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  views: { type: Number, default: 0 },
  applications: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

// Index for search
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ location: 1 });

jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema);
