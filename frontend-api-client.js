// assets/js/api/jobsAPI.js
// Frontend API Client - Connect Frontend to Backend

const API_URL = 'http://localhost:5000/api';

const jobsAPI = {
  /**
   * Get all jobs with optional filters
   * @param {Object} filters - Filter options (category, location, type, search)
   * @returns {Promise<Array>} Array of jobs
   */
  getAllJobs: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_URL}/jobs${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  /**
   * Get a single job by ID
   * @param {string} id - Job ID
   * @returns {Promise<Object>} Job object
   */
  getJobById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  /**
   * Create a new job
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>} Created job object
   */
  createJob: async (jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Update an existing job
   * @param {string} id - Job ID
   * @param {Object} jobData - Updated job data
   * @returns {Promise<Object>} Updated job object
   */
  updateJob: async (id, jobData) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  /**
   * Delete a job
   * @param {string} id - Job ID
   * @returns {Promise<Object>} Success response
   */
  deleteJob: async (id) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  /**
   * Get jobs by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of jobs
   */
  getJobsByCategory: async (category) => {
    try {
      const response = await fetch(`${API_URL}/jobs/category/${category}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching jobs by category:', error);
      throw error;
    }
  }
};

// Example Usage:
/*
// Get all jobs
const jobs = await jobsAPI.getAllJobs();

// Get jobs with filters
const itJobs = await jobsAPI.getAllJobs({ category: 'it-software', location: 'Remote' });

// Get single job
const job = await jobsAPI.getJobById('65abc123...');

// Create new job
const newJob = await jobsAPI.createJob({
  title: 'Frontend Developer',
  company: 'TechCorp',
  description: 'Looking for a skilled frontend developer...',
  requirements: ['React', 'JavaScript', 'CSS'],
  location: 'Remote',
  salary: '$70,000 - $90,000',
  type: 'Full-time',
  category: 'it-software'
});

// Update job
const updated = await jobsAPI.updateJob('65abc123...', { salary: '$80,000 - $100,000' });

// Delete job
await jobsAPI.deleteJob('65abc123...');
*/

// Make it available globally
if (typeof window !== 'undefined') {
  window.jobsAPI = jobsAPI;
}
