const API_BASE_URL = 'http://localhost:5000/api/jobs';
const PROFILE_API_URL = 'http://localhost:5000/api/profile';
const SAVED_JOBS_API_URL = 'http://localhost:5000/api/saved-jobs';
const APPLICATIONS_API_URL = 'http://localhost:5000/api/applications';

// Helper to get auth token
function getAuthToken() {
    return localStorage.getItem('huntersite_token') || sessionStorage.getItem('huntersite_token');
}

// Helper for authenticated requests
async function authFetch(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
}

const jobsAPI = {
    // ==================== JOB OPERATIONS ====================
    
    // 1. Get All Jobs (with optional search)
    getAllJobs: async (search = '', category = '', location = '') => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (location) params.append('location', location);
            
            const url = `${API_BASE_URL}${params.toString() ? '?' + params.toString() : ''}`;
            const data = await authFetch(url);
            return data.jobs || [];
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },

    // 2. Get Single Job details
    getJobById: async (id) => {
        try {
            return await authFetch(`${API_BASE_URL}/${id}`);
        } catch (error) {
            console.error('Error fetching job details:', error);
            return null;
        }
    },

    // 3. CREATE Job (employer only)
    createJob: async (jobData) => {
        try {
            return await authFetch(API_BASE_URL, {
                method: 'POST',
                body: JSON.stringify(jobData)
            });
        } catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    },

    // 4. UPDATE Job (employer only)
    updateJob: async (id, updates) => {
        try {
            return await authFetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    },

    // 5. DELETE Job (employer only)
    deleteJob: async (id) => {
        try {
            return await authFetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    },

    // ==================== PROFILE OPERATIONS ====================
    
    // Get my profile (dynamic from MongoDB - NOT hardcoded)
    getMyProfile: async () => {
        try {
            return await authFetch(PROFILE_API_URL);
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },

    // Update my profile
    updateProfile: async (profileData) => {
        try {
            return await authFetch(PROFILE_API_URL, {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    // Delete my profile
    deleteProfile: async () => {
        try {
            return await authFetch(PROFILE_API_URL, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error deleting profile:', error);
            throw error;
        }
    },

    // ==================== SAVED JOBS ====================
    
    // Save a job
    saveJob: async (jobId) => {
        try {
            return await authFetch(`${SAVED_JOBS_API_URL}/${jobId}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Error saving job:', error);
            throw error;
        }
    },

    // Get saved jobs
    getSavedJobs: async () => {
        try {
            const data = await authFetch(SAVED_JOBS_API_URL);
            return data.savedJobs || [];
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            return [];
        }
    },

    // ==================== APPLICATIONS ====================
    
    // Apply to job
    applyToJob: async (jobId, jobTitle, company) => {
        try {
            return await authFetch(APPLICATIONS_API_URL, {
                method: 'POST',
                body: JSON.stringify({ jobId, jobTitle, company })
            });
        } catch (error) {
            console.error('Error applying to job:', error);
            throw error;
        }
    },

    // Get my applications
    getApplications: async () => {
        try {
            const data = await authFetch(APPLICATIONS_API_URL);
            return data.applications || [];
        } catch (error) {
            console.error('Error fetching applications:', error);
            return [];
        }
    }
};

// Make it available globally
window.jobsAPI = jobsAPI;
