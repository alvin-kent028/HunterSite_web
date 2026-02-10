// backend/routes/jobs.js
// Job Routes - Define API endpoints

const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCategory
} = require('../controllers/jobController');

// Routes
router.route('/')
  .get(getAllJobs)      // GET /api/jobs
  .post(createJob);     // POST /api/jobs

router.route('/:id')
  .get(getJobById)      // GET /api/jobs/:id
  .put(updateJob)       // PUT /api/jobs/:id
  .delete(deleteJob);   // DELETE /api/jobs/:id

router.route('/category/:category')
  .get(getJobsByCategory);  // GET /api/jobs/category/it-software

module.exports = router;
