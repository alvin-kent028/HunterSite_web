const API_BASE_URL = 'http://localhost:5000/api/jobs';

const jobsAPI = {
    // 1. Get All Jobs
    getAllJobs: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },

    // 2. Get Single Job details
    getJobById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Job not found');
            return await response.json();
        } catch (error) {
            console.error('Error fetching job details:', error);
            return null;
        }
    }
};

// Make it available to other files
window.jobsAPI = jobsAPI;