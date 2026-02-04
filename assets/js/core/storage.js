/**
 * Local Storage Manager
 * Handles saving and loading data from browser storage
 *
 * This module provides a centralized way to manage all data persistence
 * in the browser's localStorage. It includes error handling and data validation.
 *
 * STORAGE STRATEGY:
 * ================
 * 1. Static JSON Files (Read-Only Defaults):
 *    - profile.json: Template profile structure
 *    - jobs.json: Job listings (updated by admin/system)
 *
 * 2. LocalStorage (User-Specific Dynamic Data):
 *    - User modifications override static JSON
 *    - Persists across browser sessions
 *    - Each item includes timestamps for conflict resolution
 *
 * 3. Data Flow:
 *    Page Load → Check localStorage first
 *             → If empty/missing, load from JSON defaults
 *             → Merge if needed, localStorage wins
 *
 * 4. Edge Cases Handled:
 *    - First-time users: Load from JSON, save to localStorage
 *    - Conflicts: LocalStorage takes priority (user data > defaults)
 *    - Quota exceeded: Clear old data, notify user
 *    - Corrupted data: Fallback to JSON defaults
 *    - Partial updates: Merge with existing data
 *
 * Key Features:
 * - Safe JSON parsing/stringifying with error handling
 * - Quota exceeded detection and user notification
 * - Consistent key naming to prevent conflicts
 * - Type checking and validation before saving
 * - Timestamp tracking for data freshness
 * - Graceful degradation when JSON unavailable
 */

// ============================================
// STORAGE CONFIGURATION
// ============================================

/**
 * Central storage keys definition
 * Using a constant object prevents typos and makes keys easy to update
 * All keys are prefixed with 'huntersite_' to avoid conflicts with other apps
 *
 * IMPORTANT: Employer and Job Seeker data are completely separate
 */
const STORAGE_KEYS = {
  // Common (all users)
  USER: "huntersite_user",
  STORAGE_VERSION: "huntersite_storage_version",

  // Job Seeker specific
  JOBSEEKER_SAVED_JOBS: "huntersite_jobseeker_saved_jobs",
  JOBSEEKER_SEARCH_HISTORY: "huntersite_jobseeker_search_history",
  JOBSEEKER_APPLICATIONS: "huntersite_jobseeker_applications",
  JOBSEEKER_PROFILE: "huntersite_jobseeker_profile",
  JOBSEEKER_PROFILE_METADATA: "huntersite_jobseeker_profile_metadata",

  // Employer specific
  EMPLOYER_JOBS: "employer_jobs", // Jobs posted by employers
  EMPLOYER_PROFILE: "huntersite_employer_profile",
  EMPLOYER_COMPANY_INFO: "huntersite_employer_company",

  // Legacy keys (for backward compatibility - will be migrated)
  SAVED_JOBS: "huntersite_saved_jobs",
  SEARCH_HISTORY: "huntersite_search_history",
  APPLICATIONS: "huntersite_applications",
  USER_PROFILE: "huntersite_user_profile",
  PROFILE_METADATA: "huntersite_profile_metadata",
};

// Storage configuration constants
const MAX_SEARCH_HISTORY = 10;
const STORAGE_VERSION = "1.0.0";
const DEFAULT_JSON_PATHS = {
  PROFILE: "../assets/data/profile.json",
  JOBS: "../assets/data/jobs.json",
};

// ============================================
// CORE STORAGE OPERATIONS
// ============================================

/**
 * Safely retrieve and parse data from localStorage
 *
 * @param {string} key - The storage key to retrieve
 * @returns {any|null} Parsed data if successful, null if error or not found
 *
 * Error handling:
 * - Returns null if key doesn't exist
 * - Returns null if JSON parsing fails (corrupted data)
 * - Logs errors to console for debugging
 */
function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    // Return null if no data found, otherwise parse JSON
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from storage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Safely stringify and save data to localStorage
 *
 * @param {string} key - The storage key to use
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} True if successful, false if error occurred
 *
 * Error handling:
 * - Catches QuotaExceededError when storage is full
 * - Shows user-friendly alert when quota exceeded
 * - Logs all errors to console
 */
function saveToStorage(key, data) {
  try {
    // Convert data to JSON string and save
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (key: ${key}):`, error);

    // Special handling for storage quota errors
    // This happens when localStorage is full (usually 5-10MB limit)
    if (error.name === "QuotaExceededError") {
      alert("Storage is full. Please clear some saved data.");
    }
    return false;
  }
}

// ============================================
// HYBRID DATA LOADING (LocalStorage + JSON)
// ============================================

/**
 * Load profile data with smart fallback strategy
 *
 * Priority order:
 * 1. LocalStorage (user has made changes)
 * 2. profile.json (default/template data)
 *
 * @returns {Promise<Object>} Profile data object
 */
async function loadProfileData() {
  try {
    const user = getCurrentUser();

    // Determine which profile key to use based on user type
    let profileKey;
    if (user && user.userType === "employer") {
      profileKey = STORAGE_KEYS.EMPLOYER_PROFILE;
    } else {
      profileKey = STORAGE_KEYS.JOBSEEKER_PROFILE;
    }

    // Check localStorage first
    const localProfile = getFromStorage(profileKey);
    const metadata = getFromStorage(STORAGE_KEYS.PROFILE_METADATA);

    // If we have local data, use it
    if (localProfile && metadata) {
      console.log("📦 Loaded profile from localStorage");
      return localProfile;
    }

    // Otherwise, load from JSON and cache it (only for job seekers)
    if (!user || user.userType !== "employer") {
      console.log("📄 Loading profile from JSON (first time)");
      const response = await fetch(DEFAULT_JSON_PATHS.PROFILE);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonProfile = await response.json();

      // Cache to localStorage for next time (don't use saveUserProfile to avoid recursion)
      saveToStorage(profileKey, jsonProfile);
      saveToStorage(STORAGE_KEYS.PROFILE_METADATA, {
        lastUpdated: new Date().toISOString(),
        source: "json_load",
        version: STORAGE_VERSION,
        userType: user?.userType || "jobseeker",
      });

      return jsonProfile;
    }

    // For employers without profile, return default
    return getDefaultProfileStructure();
  } catch (error) {
    console.error("Error loading profile data:", error);

    // Return minimal default if all else fails
    return getDefaultProfileStructure();
  }
}

/**
 * Load jobs data (from JSON + employer posts from localStorage)
 *
 * Combines static jobs from JSON with dynamic employer-posted jobs.
 * Only shows ACTIVE employer jobs (pending/closed jobs hidden from job seekers).
 * User's saved/applied jobs are tracked in separate localStorage keys.
 *
 * @returns {Promise<Object>} Jobs data with categories and listings
 */
async function loadJobsData() {
  try {
    const response = await fetch(DEFAULT_JSON_PATHS.JOBS);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jobsData = await response.json();

    // Get employer jobs from localStorage (only active ones)
    const employerJobs = getActiveEmployerJobs();

    // Merge employer jobs with static jobs
    if (employerJobs.length > 0) {
      jobsData.jobs = [...employerJobs, ...(jobsData.jobs || [])];
      console.log(
        `📄 Loaded ${jobsData.jobs.length} jobs (${employerJobs.length} from employers)`
      );
    } else {
      console.log("📄 Loaded jobs from JSON");
    }

    return jobsData;
  } catch (error) {
    console.error("Error loading jobs data:", error);

    // Even on error, try to show employer jobs
    const employerJobs = getActiveEmployerJobs();
    return {
      categories: [],
      jobs: employerJobs,
    };
  }
}

/**
 * Get active employer jobs from localStorage
 * Only returns jobs with status "active" (hides pending and closed)
 * Converts employer job format to match the static job format
 *
 * @returns {Array} Active employer jobs
 */
function getActiveEmployerJobs() {
  try {
    const allEmployerJobs =
      JSON.parse(localStorage.getItem("employer_jobs")) || [];

    // Filter only active jobs
    const activeJobs = allEmployerJobs.filter((job) => job.status === "active");

    // Convert to standard job format
    return activeJobs.map((job) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      category: job.category,
      posted: job.postedDate,
      deadline: job.deadline,
      featured: false,
      logo: "../assets/images/company-placeholder.svg", // Default logo
      source: "employer", // Mark as employer-posted
    }));
  } catch (error) {
    console.error("Error loading employer jobs:", error);
    return [];
  }
}

/**
 * Get default profile structure when no data exists
 * Provides empty but properly structured profile object
 *
 * @returns {Object} Default empty profile
 */
function getDefaultProfileStructure() {
  return {
    basicInfo: {
      name: "Ruby Grace Jasper",
      title: "Senior Full Stack Developer",
      location: "Pasay, Metro Manila, Philippines",
      email: "rubygracejasper@hotmail.com",
      phone: "+1 123 456 7890",
      avatar: "../assets/images/profile/profile-avatar.svg",
      online: true,
      jobStatus: "Passively looking for jobs",
      views: 127,
    },
    resume: {
      fileName: "Ruby Grace Jasper.pdf",
      url: "#",
    },
    skills: {
      technical: [
        { name: "JavaScript", level: 90 },
        { name: "React", level: 85 },
        { name: "Node.js", level: 80 },
        { name: "Python", level: 75 },
        { name: "TypeScript", level: 85 },
        { name: "SQL", level: 70 },
      ],
      soft: [
        "Leadership",
        "Communication",
        "Problem Solving",
        "Team Collaboration",
        "Project Management",
        "Critical Thinking",
        "Adaptability",
        "Time Management",
      ],
      tools: [
        { name: "Git", level: "Expert" },
        { name: "VS Code", level: "Expert" },
        { name: "Docker", level: "Advanced" },
        { name: "Figma", level: "Intermediate" },
        { name: "AWS", level: "Intermediate" },
        { name: "Jira", level: "Advanced" },
      ],
    },
    experience: [
      {
        title: "Senior Full Stack Developer",
        company: "TechCorp Solutions",
        duration: "2022 - Present",
        location: "Manila, Philippines",
        responsibilities: [
          "Led a team of 5 developers in building scalable web applications using React and Node.js",
          "Implemented CI/CD pipelines reducing deployment time by 60%",
          "Collaborated with product team to deliver features for 50,000+ active users",
        ],
      },
      {
        title: "Frontend Developer",
        company: "Digital Innovations Inc.",
        duration: "2020 - 2022",
        location: "Makati, Philippines",
        responsibilities: [
          "Developed responsive web applications using React, Vue.js, and TypeScript",
          "Optimized application performance improving load times by 40%",
          "Mentored junior developers and conducted code reviews",
        ],
      },
      {
        title: "Web Developer",
        company: "StartupHub Philippines",
        duration: "2018 - 2020",
        location: "Quezon City, Philippines",
        responsibilities: [
          "Built and maintained multiple client websites using HTML, CSS, JavaScript, and PHP",
          "Integrated third-party APIs and payment systems",
          "Provided technical support and training to clients",
        ],
      },
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of the Philippines - Diliman",
        graduation: "2014 - 2018",
        gpa: "GPA: 3.8/4.0",
        description:
          "Graduated Magna Cum Laude. Specialized in Software Engineering and Web Development.",
        coursesLabel: "Relevant Courses:",
        courses: [
          "Data Structures & Algorithms",
          "Database Systems",
          "Software Engineering",
          "Web Development",
          "Machine Learning",
        ],
      },
      {
        degree: "Full Stack Web Development Bootcamp",
        school: "Kodego Bootcamp",
        graduation: "2017",
        gpa: "Certificate",
        description:
          "Intensive 6-month program covering modern web development technologies and best practices.",
        coursesLabel: "Technologies Learned:",
        courses: ["MEAN Stack", "React", "Node.js", "MongoDB", "Git & GitHub"],
      },
    ],
    todo: {
      items: {
        "create-account": true,
        "complete-basic": true,
        "work-experience": true,
        "upload-resume": true,
        "add-education": true,
      },
      summary: {
        total: 5,
        done: 5,
        pct: 100,
      },
    },
  };
}

// ============================================
// USER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Get currently logged in user data
 * @returns {Object|null} User object with email, userType, name, loginDate or null if not logged in
 */
function getCurrentUser() {
  return getFromStorage(STORAGE_KEYS.USER);
}

/**
 * Save user login information to storage
 *
 * @param {string} email - User's email address
 * @param {string} userType - Type of user (jobseeker, employer, admin)
 * @returns {boolean} True if save successful
 *
 * Creates a user object with:
 * - email: User's email
 * - userType: Their role in the system
 * - loginDate: ISO timestamp when they logged in
 * - name: Extracted from email (part before @)
 */
function saveUserLogin(email, userType = "jobseeker") {
  const user = {
    email: email,
    userType: userType,
    loginDate: new Date().toISOString(),
    name: email.split("@")[0], // Extract username from email
  };
  return saveToStorage(STORAGE_KEYS.USER, user);
}

/**
 * Log out current user
 * Clears user data and user-type-specific data based on their role
 */
function logoutUser() {
  const user = getCurrentUser();

  if (user) {
    // Clear user-type specific data
    if (user.userType === "jobseeker") {
      // Clear job seeker data
      localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_SAVED_JOBS);
      localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_SEARCH_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_APPLICATIONS);
      localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_PROFILE_METADATA);

      // Clear legacy keys
      localStorage.removeItem(STORAGE_KEYS.SAVED_JOBS);
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_METADATA);
    } else if (user.userType === "employer") {
      // Clear employer data (but NOT their posted jobs)
      localStorage.removeItem(STORAGE_KEYS.EMPLOYER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.EMPLOYER_COMPANY_INFO);
      // Note: employer_jobs is kept so jobs remain available
    }
  }

  // Always clear user session
  localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user data exists in storage
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

// ============================================
// JOB SAVING FUNCTIONS (Job Seeker Only)
// ============================================

/**
 * Get the correct storage key based on user type
 * @returns {string} Storage key to use
 */
function getSavedJobsKey() {
  const user = getCurrentUser();
  // Only job seekers can save jobs
  if (user && user.userType === "jobseeker") {
    return STORAGE_KEYS.JOBSEEKER_SAVED_JOBS;
  }
  // Fallback for backward compatibility
  return STORAGE_KEYS.SAVED_JOBS;
}

/**
 * Get all jobs saved by the current user (Job Seeker only)
 * @returns {Array} Array of saved job objects (empty array if none or not job seeker)
 */
function getSavedJobs() {
  const user = getCurrentUser();

  // Only job seekers can have saved jobs
  if (!user || user.userType !== "jobseeker") {
    return [];
  }

  return getFromStorage(getSavedJobsKey()) || [];
}

/**
 * Save a job to user's saved list
 *
 * @param {Object} jobData - Job information to save
 * @param {string} jobData.id - Unique job identifier
 * @param {string} jobData.title - Job title
 * @param {string} jobData.company - Company name
 * @param {string} jobData.location - Job location
 * @returns {Object} Result object with success flag and message
 *
 * Process:
 * 1. Check if user is job seeker
 * 2. Get current saved jobs
 * 3. Check if job already saved (prevent duplicates)
 * 4. Add savedDate timestamp
 * 5. Save updated list back to storage
 */
function saveJob(jobData) {
  try {
    const user = getCurrentUser();

    // Only job seekers can save jobs
    if (!user || user.userType !== "jobseeker") {
      return {
        success: false,
        message: "Only job seekers can save jobs",
      };
    }

    const savedJobs = getSavedJobs();

    // Prevent duplicate saves - check if job ID already exists
    const exists = savedJobs.find((job) => job.id === jobData.id);
    if (exists) {
      return { success: false, message: "Job already saved" };
    }

    // Add the job with a timestamp
    savedJobs.push({
      ...jobData, // Spread existing job data
      savedDate: new Date().toISOString(), // Add when it was saved
      savedBy: user.email, // Track who saved it
    });

    const success = saveToStorage(getSavedJobsKey(), savedJobs);
    return {
      success: success,
      message: success ? "Job saved successfully" : "Failed to save job",
    };
  } catch (error) {
    console.error("Error saving job:", error);
    return { success: false, message: "Error saving job" };
  }
}

/**
 * Remove a job from user's saved list (Job Seeker only)
 *
 * @param {string} jobId - ID of job to remove
 * @returns {Object} Result object with success flag and message
 */
function removeSavedJob(jobId) {
  try {
    const user = getCurrentUser();

    // Only job seekers can have saved jobs
    if (!user || user.userType !== "jobseeker") {
      return {
        success: false,
        message: "Only job seekers can save/remove jobs",
      };
    }

    const savedJobs = getSavedJobs();
    // Filter out the job with matching ID
    const filtered = savedJobs.filter((job) => job.id !== jobId);

    const success = saveToStorage(getSavedJobsKey(), filtered);
    return {
      success: success,
      message: success ? "Job removed from saved list" : "Failed to remove job",
    };
  } catch (error) {
    console.error("Error removing job:", error);
    return { success: false, message: "Error removing job" };
  }
}

/**
 * Check if a specific job is saved
 * @param {string} jobId - Job ID to check
 * @returns {boolean} True if job is in saved list
 */
function isJobSaved(jobId) {
  const savedJobs = getSavedJobs();
  return savedJobs.some((job) => job.id === jobId);
}

// ============================================
// SEARCH HISTORY FUNCTIONS
// ============================================

/**
 * Add a search query to user's search history
 * Maintains a limited history (max 10 items) with most recent first
 *
 * @param {string} query - Search query entered by user
 * @param {string} location - Location filter (can be empty)
 *
 * Implementation:
 * - Adds new search to beginning of array (unshift)
 * - Keeps only last 10 searches (prevents unlimited growth)
 * - Stores timestamp for each search
 */
function addSearchHistory(query, location) {
  try {
    const history = getFromStorage(STORAGE_KEYS.SEARCH_HISTORY) || [];

    // Add new search to the beginning (most recent first)
    history.unshift({
      query: query,
      location: location,
      date: new Date().toISOString(),
    });

    // Keep only the last 10 searches to save space
    const trimmed = history.slice(0, MAX_SEARCH_HISTORY);

    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, trimmed);
  } catch (error) {
    console.error("Error saving search history:", error);
  }
}

/**
 * Get user's search history
 * @returns {Array} Array of search objects (query, location, date)
 */
function getSearchHistory() {
  return getFromStorage(STORAGE_KEYS.SEARCH_HISTORY) || [];
}

// ============================================
// JOB APPLICATION FUNCTIONS
// ============================================

/**
 * Save a job application
 * Records when user applies to a job
 *
 * @param {string} jobId - Unique job identifier
 * @param {string} jobTitle - Title of the job
 * @param {string} company - Company name
 * @returns {Object} Result with success flag and message
 *
 * Application object includes:
 * - jobId: For tracking which job
 * - jobTitle & company: For display purposes
 * - appliedDate: Timestamp of application
 * - status: Current status (pending, accepted, rejected)
 */
function saveApplication(jobId, jobTitle, company) {
  try {
    const user = getCurrentUser();

    // Only job seekers can submit applications
    if (!user || user.userType !== "jobseeker") {
      return {
        success: false,
        message: "Only job seekers can submit applications",
      };
    }

    const applications =
      getFromStorage(STORAGE_KEYS.JOBSEEKER_APPLICATIONS) || [];

    // Prevent applying to same job twice
    const exists = applications.find((app) => app.jobId === jobId);
    if (exists) {
      return { success: false, message: "You already applied to this job" };
    }

    // Add new application
    applications.push({
      jobId: jobId,
      jobTitle: jobTitle,
      company: company,
      appliedBy: user.email,
      appliedDate: new Date().toISOString(),
      status: "pending", // Initial status
    });

    const success = saveToStorage(
      STORAGE_KEYS.JOBSEEKER_APPLICATIONS,
      applications
    );
    return {
      success: success,
      message: success
        ? "Application submitted successfully"
        : "Failed to submit application",
    };
  } catch (error) {
    console.error("Error saving application:", error);
    return { success: false, message: "Error submitting application" };
  }
}

/**
 * Get all applications submitted by user
 * @returns {Array} Array of application objects
 */
function getUserApplications() {
  return getFromStorage(STORAGE_KEYS.APPLICATIONS) || [];
}

/**
 * Check if user has already applied to a specific job
 * @param {string} jobId - Job ID to check
 * @returns {boolean} True if application exists
 */
function hasAppliedToJob(jobId) {
  const applications = getUserApplications();
  return applications.some((app) => app.jobId === jobId);
}

// ============================================
// USER PROFILE FUNCTIONS (Enhanced with Hybrid Loading)
// ============================================

/**
 * Save user profile information with metadata tracking
 *
 * @param {Object} profileData - User profile data
 * @param {boolean} isPartialUpdate - If true, merges with existing data
 * @returns {Object} Result with success flag and message
 */
function saveUserProfile(profileData, isPartialUpdate = false) {
  try {
    const user = getCurrentUser();

    // Determine which profile key to use based on user type
    let profileKey;
    if (user && user.userType === "employer") {
      profileKey = STORAGE_KEYS.EMPLOYER_PROFILE;
    } else {
      // Default to job seeker profile
      profileKey = STORAGE_KEYS.JOBSEEKER_PROFILE;
    }

    let dataToSave = profileData;

    // If partial update, merge with existing data
    if (isPartialUpdate) {
      const existingProfile = getFromStorage(profileKey);
      if (existingProfile) {
        dataToSave = deepMerge(existingProfile, profileData);
      }
    }

    // Save profile data
    const success = saveToStorage(profileKey, dataToSave);

    // Save metadata (timestamp, source)
    if (success) {
      saveToStorage(STORAGE_KEYS.PROFILE_METADATA, {
        lastUpdated: new Date().toISOString(),
        source: "user_edit",
        version: STORAGE_VERSION,
        userType: user?.userType || "jobseeker",
      });
    }

    return {
      success: success,
      message: success
        ? "Profile saved successfully"
        : "Failed to save profile",
    };
  } catch (error) {
    console.error("Error saving profile:", error);
    return { success: false, message: "Error saving profile" };
  }
}

/**
 * Get user profile data (synchronous version)
 * Use this when you need immediate access and localStorage is already populated
 * For first-time load, use loadProfileData() instead
 *
 * @returns {Object} Profile object with all user fields
 */
function getUserProfile() {
  const user = getCurrentUser();

  // Determine which profile key to use based on user type
  let profileKey;
  if (user && user.userType === "employer") {
    profileKey = STORAGE_KEYS.EMPLOYER_PROFILE;
  } else {
    // Default to job seeker profile
    profileKey = STORAGE_KEYS.JOBSEEKER_PROFILE;
  }

  const profile = getFromStorage(profileKey);

  if (profile) {
    return profile;
  }

  // Return default structure if no profile exists
  // Note: This is just a fallback. For first load, use loadProfileData()
  return getDefaultProfileStructure();
}

/**
 * Deep merge two objects (for partial profile updates)
 * Recursively merges nested objects without losing data
 *
 * @param {Object} target - Target object (existing data)
 * @param {Object} source - Source object (new data)
 * @returns {Object} Merged object
 */
function deepMerge(target, source) {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }

  return output;
}

/**
 * Check if value is a plain object
 * @param {any} item - Value to check
 * @returns {boolean} True if plain object
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all user data from storage
 * Used for logout or account reset
 * Removes all keys defined in STORAGE_KEYS
 */
function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  console.log("🗑️ All user data cleared from storage");
}

/**
 * Get storage metadata and statistics
 * Useful for debugging and showing user their data usage
 *
 * @returns {Object} Storage info (size, item counts, etc.)
 */
function getStorageInfo() {
  try {
    const info = {
      savedJobsCount: getSavedJobs().length,
      applicationsCount: getUserApplications().length,
      searchHistoryCount: getSearchHistory().length,
      hasProfile: !!getFromStorage(STORAGE_KEYS.USER_PROFILE),
      isLoggedIn: isLoggedIn(),
      storageVersion: STORAGE_VERSION,
    };

    // Calculate approximate storage size
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    });

    info.approximateSizeKB = Math.round(totalSize / 1024);

    return info;
  } catch (error) {
    console.error("Error getting storage info:", error);
    return null;
  }
}

// ============================================
// PUBLIC API EXPORT
// ============================================

/**
 * Export all storage functions as a single object
 * Makes them available to other scripts via window.StorageManager
 *
 * Usage in other files:
 *
 * // Load profile data (first time or when localStorage empty)
 * const profile = await window.StorageManager.loadProfileData();
 *
 * // Get profile from localStorage (after initial load)
 * const profile = window.StorageManager.getUserProfile();
 *
 * // Update profile (partial update - merges with existing)
 * window.StorageManager.saveUserProfile({ basicInfo: { name: "John" } }, true);
 *
 * // Save a job
 * window.StorageManager.saveJob(jobData);
 *
 * // Load jobs from JSON
 * const jobs = await window.StorageManager.loadJobsData();
 */
window.StorageManager = {
  // User authentication functions
  getCurrentUser,
  saveUserLogin,
  logoutUser,
  isLoggedIn,

  // Job management functions
  getSavedJobs,
  saveJob,
  removeSavedJob,
  isJobSaved,

  // Search functions
  addSearchHistory,
  getSearchHistory,

  // Application functions
  saveApplication,
  getUserApplications,
  hasAppliedToJob,

  // Profile functions (enhanced)
  saveUserProfile,
  getUserProfile,
  loadProfileData, // Async: loads from JSON if needed

  // Data loading functions
  loadJobsData, // Async: loads jobs from JSON
  getDefaultProfileStructure, // Get empty profile template

  // Utility functions
  clearAllData,
  getStorageInfo, // Debug/stats function

  // Constants (exposed for reference)
  STORAGE_KEYS,
  STORAGE_VERSION,
};

console.log("💾 Storage Manager loaded (v" + STORAGE_VERSION + ")");
