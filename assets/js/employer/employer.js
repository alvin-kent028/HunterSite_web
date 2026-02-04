/**
 * Employer Dashboard
 * For employers to post and manage jobs
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is employer
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    window.location.href = "../login/login.html";
    return;
  }

  if (user.userType === "employer") {
    initEmployerDashboard();
  } else if (user.userType === "admin") {
    initAdminPanel();
  }
});

function initEmployerDashboard() {
  // Add employer controls to the page
  addEmployerControls();

  // Setup job posting form
  setupJobPostingForm();

  // Load employer's posted jobs
  loadEmployerJobs();
}

function addEmployerControls() {
  const mainContent = document.querySelector("main, .jobs-main");
  if (!mainContent) return;

  // Create employer dashboard
  const dashboard = document.createElement("div");
  dashboard.className = "employer-dashboard container my-4";
  dashboard.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h2 class="h5 mb-0">Employer Dashboard</h2>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="stat-card p-3 bg-light rounded">
              <h3 class="h6 text-muted">Active Jobs</h3>
              <p class="h3 mb-0" id="activeJobsCount">0</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card p-3 bg-light rounded">
              <h3 class="h6 text-muted">Total Applications</h3>
              <p class="h3 mb-0" id="totalApplications">0</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="stat-card p-3 bg-light rounded">
              <h3 class="h6 text-muted">Views This Week</h3>
              <p class="h3 mb-0" id="weeklyViews">0</p>
            </div>
          </div>
        </div>
        
        <button class="btn btn-primary" onclick="showJobPostingForm()">
          + Post New Job
        </button>
        
        <div id="jobPostingForm" class="mt-4" style="display: none;">
          <h3 class="h5">Post a New Job</h3>
          <form id="postJobForm">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Job Title *</label>
                <input type="text" class="form-control" name="title" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Company *</label>
                <input type="text" class="form-control" name="company" required>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Location *</label>
                <input type="text" class="form-control" name="location" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Job Type *</label>
                <select class="form-select" name="type" required>
                  <option value="">Select...</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Job Description *</label>
              <textarea class="form-control" name="description" rows="4" required></textarea>
            </div>
            
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Salary Range</label>
                <input type="text" class="form-control" name="salary" placeholder="e.g., ₱30,000 - ₱50,000">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Application Deadline</label>
                <input type="date" class="form-control" name="deadline">
              </div>
            </div>
            
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-success">Post Job</button>
              <button type="button" class="btn btn-secondary" onclick="hideJobPostingForm()">Cancel</button>
            </div>
          </form>
        </div>
        
        <div id="employerJobsList" class="mt-4">
          <h3 class="h5">Your Posted Jobs</h3>
          <div id="jobsContainer"></div>
        </div>
      </div>
    </div>
  `;

  // Insert at the top of main content
  mainContent.insertBefore(dashboard, mainContent.firstChild);
}

function setupJobPostingForm() {
  const form = document.getElementById("postJobForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this);
    const jobData = {
      id: "job_" + Date.now(),
      title: formData.get("title"),
      company: formData.get("company"),
      location: formData.get("location"),
      type: formData.get("type"),
      description: formData.get("description"),
      salary: formData.get("salary"),
      deadline: formData.get("deadline"),
      postedDate: new Date().toISOString(),
      employer: window.StorageManager.getCurrentUser().email,
      status: "active",
      applications: 0,
    };

    // Validate
    if (!jobData.title || !jobData.company || !jobData.location) {
      alert("Please fill in all required fields");
      return;
    }

    // Save job
    const employerJobs = getEmployerJobs();
    employerJobs.push(jobData);
    saveEmployerJobs(employerJobs);

    // Reset form
    this.reset();
    hideJobPostingForm();

    // Reload jobs list
    loadEmployerJobs();

    alert("Job posted successfully!");
  });
}

function getEmployerJobs() {
  try {
    const jobs = localStorage.getItem("employer_jobs");
    return jobs ? JSON.parse(jobs) : [];
  } catch (error) {
    console.error("Error loading employer jobs:", error);
    return [];
  }
}

function saveEmployerJobs(jobs) {
  try {
    localStorage.setItem("employer_jobs", JSON.stringify(jobs));
    return true;
  } catch (error) {
    console.error("Error saving employer jobs:", error);
    return false;
  }
}

function loadEmployerJobs() {
  const user = window.StorageManager.getCurrentUser();
  if (!user) return;

  const allJobs = getEmployerJobs();
  const userJobs = allJobs.filter((job) => job.employer === user.email);

  // Update stats
  document.getElementById("activeJobsCount").textContent = userJobs.length;
  document.getElementById("totalApplications").textContent = userJobs.reduce(
    (sum, job) => sum + (job.applications || 0),
    0
  );
  document.getElementById("weeklyViews").textContent =
    Math.floor(Math.random() * 500) + 100;

  // Display jobs
  const container = document.getElementById("jobsContainer");
  if (!container) return;

  if (userJobs.length === 0) {
    container.innerHTML = '<p class="text-muted">No jobs posted yet.</p>';
    return;
  }

  container.innerHTML = userJobs
    .map(
      (job) => `
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between">
          <div>
            <h4 class="h6 mb-1">${job.title}</h4>
            <p class="text-muted small mb-2">${job.company} • ${
        job.location
      }</p>
            <p class="small mb-0">Posted: ${new Date(
              job.postedDate
            ).toLocaleDateString()}</p>
            <span class="badge bg-${
              job.status === "active" ? "success" : "secondary"
            }">${job.status}</span>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary" onclick="editJob('${
              job.id
            }')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteJob('${
              job.id
            }')">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// Global functions for buttons
window.showJobPostingForm = function () {
  document.getElementById("jobPostingForm").style.display = "block";
};

window.hideJobPostingForm = function () {
  document.getElementById("jobPostingForm").style.display = "none";
};

window.editJob = function (jobId) {
  alert("Edit functionality would be implemented here");
};

window.deleteJob = function (jobId) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  const jobs = getEmployerJobs();
  const filtered = jobs.filter((job) => job.id !== jobId);
  saveEmployerJobs(filtered);
  loadEmployerJobs();
  alert("Job deleted successfully");
};

// Admin Panel
function initAdminPanel() {
  addAdminControls();
  loadAllUsers();
  loadAllJobs();
}

function addAdminControls() {
  const mainContent = document.querySelector("main, .jobs-main");
  if (!mainContent) return;

  const adminPanel = document.createElement("div");
  adminPanel.className = "admin-panel container my-4";
  adminPanel.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-header bg-danger text-white">
        <h2 class="h5 mb-0">Admin Panel</h2>
      </div>
      <div class="card-body">
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <a class="nav-link active" data-bs-toggle="tab" href="#users">Users</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#jobs">All Jobs</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#stats">Statistics</a>
          </li>
        </ul>
        
        <div class="tab-content">
          <div class="tab-pane fade show active" id="users">
            <h3 class="h6">Registered Users</h3>
            <div id="usersList"></div>
          </div>
          
          <div class="tab-pane fade" id="jobs">
            <h3 class="h6">All Posted Jobs</h3>
            <div id="allJobsList"></div>
          </div>
          
          <div class="tab-pane fade" id="stats">
            <h3 class="h6">Platform Statistics</h3>
            <div class="row">
              <div class="col-md-3">
                <div class="stat-card p-3 bg-light rounded">
                  <h4 class="h6">Total Jobs</h4>
                  <p class="h3" id="totalJobs">0</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card p-3 bg-light rounded">
                  <h4 class="h6">Total Applications</h4>
                  <p class="h3" id="totalApps">0</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card p-3 bg-light rounded">
                  <h4 class="h6">Active Employers</h4>
                  <p class="h3" id="activeEmployers">0</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="stat-card p-3 bg-light rounded">
                  <h4 class="h6">Job Seekers</h4>
                  <p class="h3" id="jobSeekers">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  mainContent.insertBefore(adminPanel, mainContent.firstChild);
}

function loadAllUsers() {
  // In a real app, this would come from a database
  const users = [
    {
      email:
        window.StorageManager.getCurrentUser()?.email || "admin@huntersite.ph",
      type: "admin",
      joined: new Date().toLocaleDateString(),
    },
  ];

  const container = document.getElementById("usersList");
  if (!container) return;

  container.innerHTML = `
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Email</th>
          <th>Type</th>
          <th>Joined</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users
          .map(
            (user) => `
          <tr>
            <td>${user.email}</td>
            <td><span class="badge bg-primary">${user.type}</span></td>
            <td>${user.joined}</td>
            <td>
              <button class="btn btn-sm btn-outline-secondary">View</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function loadAllJobs() {
  const jobs = getEmployerJobs();

  // Update stats
  document.getElementById("totalJobs").textContent = jobs.length;
  document.getElementById("totalApps").textContent = jobs.reduce(
    (sum, job) => sum + (job.applications || 0),
    0
  );
  document.getElementById("activeEmployers").textContent = new Set(
    jobs.map((job) => job.employer)
  ).size;
  document.getElementById("jobSeekers").textContent =
    window.StorageManager.getUserApplications().length;

  const container = document.getElementById("allJobsList");
  if (!container) return;

  if (jobs.length === 0) {
    container.innerHTML =
      '<p class="text-muted">No jobs in the system yet.</p>';
    return;
  }

  container.innerHTML = jobs
    .map(
      (job) => `
    <div class="card mb-2">
      <div class="card-body py-2">
        <strong>${job.title}</strong> - ${job.company}
        <span class="badge bg-${
          job.status === "active" ? "success" : "secondary"
        } ms-2">${job.status}</span>
      </div>
    </div>
  `
    )
    .join("");
}

console.log("👔 Employer/Admin system loaded");
