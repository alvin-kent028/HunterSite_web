const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String },
  userType: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
  authSource: { type: String, enum: ['email', 'google'], required: true },
  googleId: { type: String },
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.lastLogin = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
