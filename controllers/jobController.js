// backend/controllers/jobController.js
// Business Logic for Job Operations (CRUD)

const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const { category, location, type, search } = req.query;
    
    // Build query object
    let query = {};
    
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }
    
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Increment views
    job.views += 1;
    await job.save();
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get jobs by category
// @route   GET /api/jobs/category/:category
// @access  Public
exports.getJobsByCategory = async (req, res) => {
  try {
    const jobs = await Job.find({ category: req.params.category })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};
