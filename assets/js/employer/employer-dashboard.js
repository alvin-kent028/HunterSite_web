/**
 * Employer Dashboard
 * Manages employer job postings and applications
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in as employer
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    alert("Please login to access the employer dashboard");
    window.location.href = "../login/login.html";
    return;
  }

  if (user.userType !== "employer") {
    alert("Access denied. This page is for employers only.");
    window.location.href = "../index.html";
    return;
  }

  // Initialize dashboard
  initEmployerDashboard();
});

/**
 * Initialize the employer dashboard
 */
function initEmployerDashboard() {
  loadHeaderComponent();
  loadDashboardStats();
  loadEmployerJobs();

  // Add form submit event listener (only once)
  const form = document.getElementById("postJobForm");
  if (form && !form.hasAttribute("data-listener-attached")) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitJob();
    });
    form.setAttribute("data-listener-attached", "true");
  }
}

/**
 * Load header component
 */
function loadHeaderComponent() {
  if (typeof window.HeaderComponent !== "undefined") {
    window.HeaderComponent.init("header-container");
  }
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
  const jobs = getEmployerJobs();
  const applications = getAllApplications();

  // Calculate stats
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const totalApplications = applications.length;

  // Calculate new applications (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newApplications = applications.filter((app) => {
    const appDate = new Date(app.appliedDate);
    return appDate >= oneWeekAgo;
  }).length;

  // Random profile views for demo (in real app, this would come from analytics)
  const profileViews = Math.floor(Math.random() * 500) + 100;

  // Update UI
  document.getElementById("activeJobsCount").textContent = activeJobs;
  document.getElementById("totalApplicationsCount").textContent =
    totalApplications;
  document.getElementById("newApplicationsCount").textContent = newApplications;
  document.getElementById("profileViewsCount").textContent = profileViews;
}

/**
 * Load employer's job postings
 */
function loadEmployerJobs() {
  const jobs = getEmployerJobs();
  console.log(`Loading ${jobs.length} jobs for employer dashboard`);

  const jobsList = document.getElementById("jobsList");

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <div class="text-center py-5 text-muted">
        <svg width="64" height="64" fill="currentColor" class="bi bi-briefcase mb-3" viewBox="0 0 16 16">
          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <p>No jobs posted yet. Click "Post New Job" to get started!</p>
      </div>
    `;
    return;
  }

  // Sort jobs by date (newest first)
  jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

  // Render jobs
  jobsList.innerHTML = jobs
    .map(
      (job) => `
    <div class="job-card">
      <div class="row align-items-start g-3">
        <div class="col-lg-8">
          <h5 class="mb-2 fw-bold">${escapeHtml(job.title)}</h5>
          <p class="text-muted mb-2 d-flex align-items-center flex-wrap">
            <svg width="14" height="14" fill="currentColor" class="me-1 flex-shrink-0" viewBox="0 0 16 16" style="margin-top: 2px;">
              <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
              <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            </svg>
            <strong>${escapeHtml(
              job.company
            )}</strong>&nbsp;•&nbsp;${escapeHtml(
        job.location
      )}&nbsp;•&nbsp;${escapeHtml(job.type)}
          </p>
          <p class="card-text text-secondary mb-3">${escapeHtml(
            job.description
          ).substring(0, 150)}...</p>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <span class="status-badge status-${job.status}">${capitalizeFirst(
        job.status
      )}</span>
            <span class="text-muted small d-flex align-items-center">
              <svg width="14" height="14" fill="currentColor" class="me-1 flex-shrink-0" viewBox="0 0 16 16">
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
              Posted ${formatDate(job.postedDate)}
            </span>
            <span class="badge bg-primary rounded-pill">${
              job.applicationsCount || 0
            } Applications</span>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="d-grid gap-2">
            ${
              job.status === "pending"
                ? `<button class="btn btn-success btn-sm d-flex align-items-center justify-content-center" onclick="activateJob('${job.id}')">
                     <svg width="14" height="14" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                       <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                     </svg>
                     <span>Activate Job</span>
                   </button>`
                : ""
            }
            <button class="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center" onclick="viewApplications('${
              job.id
            }')">
              <svg width="14" height="14" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
              </svg>
              <span>View Applications</span>
            </button>
            <button class="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center" onclick="editJob('${
              job.id
            }')">
              <svg width="14" height="14" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
              <span>Edit</span>
            </button>
            <button class="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" onclick="deleteJob('${
              job.id
            }')">
              <svg width="14" height="14" fill="currentColor" class="me-2" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Auto-fill job form with sample data for testing
 */
function autoFillJobForm() {
  const sampleJobs = [
    {
      title: "Senior Full Stack Developer",
      company: "TechInnovate Solutions",
      description:
        "We're looking for an experienced Full Stack Developer to join our dynamic team. You'll be working on cutting-edge projects using modern technologies like React, Node.js, and AWS. This role offers the opportunity to work on challenging problems and make a real impact on our product.\n\nResponsibilities:\n- Design and develop scalable web applications\n- Collaborate with cross-functional teams\n- Write clean, maintainable code\n- Participate in code reviews and technical discussions",
      requirements:
        "- 5+ years of experience in full stack development\n- Strong proficiency in JavaScript, React, and Node.js\n- Experience with cloud platforms (AWS/Azure/GCP)\n- Excellent problem-solving skills\n- Bachelor's degree in Computer Science or related field\n- Strong communication and teamwork abilities",
      location: "Makati City, Metro Manila",
      type: "Full-time",
      salary: "₱80,000 - ₱120,000",
      category: "Technology",
    },
    {
      title: "Digital Marketing Manager",
      company: "Growth Marketing Co.",
      description:
        "Join our award-winning marketing agency as a Digital Marketing Manager! Lead strategic campaigns for top-tier clients and drive measurable results through innovative digital marketing strategies.\n\nWhat you'll do:\n- Develop and execute digital marketing campaigns\n- Manage social media and content strategies\n- Analyze campaign performance and optimize ROI\n- Lead a team of marketing specialists",
      requirements:
        "- 3+ years of digital marketing experience\n- Proven track record in campaign management\n- Expertise in Google Ads, Facebook Ads, and SEO\n- Strong analytical and data-driven mindset\n- Excellent written and verbal communication\n- Experience managing marketing budgets",
      location: "BGC, Taguig City",
      type: "Full-time",
      salary: "₱60,000 - ₱90,000",
      category: "Marketing",
    },
    {
      title: "UX/UI Designer",
      company: "Creative Design Studio",
      description:
        "We're seeking a talented UX/UI Designer to create beautiful, user-centered designs for web and mobile applications. You'll work closely with developers and product managers to bring ideas to life.\n\nKey Responsibilities:\n- Design intuitive user interfaces\n- Conduct user research and usability testing\n- Create wireframes, prototypes, and mockups\n- Maintain design systems and guidelines",
      requirements:
        "- 3+ years of UX/UI design experience\n- Proficiency in Figma, Adobe XD, or Sketch\n- Strong portfolio showcasing web and mobile designs\n- Understanding of user-centered design principles\n- Knowledge of HTML/CSS is a plus\n- Excellent attention to detail",
      location: "Remote",
      type: "Remote",
      salary: "₱50,000 - ₱80,000",
      category: "Design",
    },
    {
      title: "Sales Executive",
      company: "ProSales Corporation",
      description:
        "Exciting opportunity for a driven Sales Executive to join our fast-growing team! You'll be responsible for building client relationships and driving revenue growth in the B2B sector.\n\nWhat we offer:\n- Competitive base salary plus commission\n- Comprehensive training program\n- Career advancement opportunities\n- Supportive team environment",
      requirements:
        "- 2+ years of B2B sales experience\n- Proven sales track record\n- Excellent negotiation and presentation skills\n- Self-motivated and target-driven\n- Strong interpersonal skills\n- Willingness to travel for client meetings",
      location: "Quezon City, Metro Manila",
      type: "Full-time",
      salary: "₱35,000 - ₱50,000 + Commission",
      category: "Sales",
    },
    {
      title: "Customer Support Specialist",
      company: "HelpDesk Plus",
      description:
        "Provide exceptional customer support as part of our dedicated team! This role is perfect for someone who loves helping people and solving problems.\n\nYour responsibilities:\n- Respond to customer inquiries via email, chat, and phone\n- Troubleshoot and resolve customer issues\n- Document customer interactions\n- Collaborate with technical teams when needed",
      requirements:
        "- 1-2 years of customer service experience\n- Excellent communication skills\n- Problem-solving mindset\n- Patience and empathy when dealing with customers\n- Ability to work flexible shifts\n- Tech-savvy and quick learner",
      location: "Ortigas, Pasig City",
      type: "Hybrid",
      salary: "₱25,000 - ₱35,000",
      category: "Customer Service",
    },
  ];

  // Pick a random sample job
  const randomJob = sampleJobs[Math.floor(Math.random() * sampleJobs.length)];

  // Get the form
  const form = document.getElementById("postJobForm");

  // Fill in the form fields
  form.querySelector('input[name="title"]').value = randomJob.title;
  form.querySelector('input[name="company"]').value = randomJob.company;
  form.querySelector('textarea[name="description"]').value =
    randomJob.description;
  form.querySelector('textarea[name="requirements"]').value =
    randomJob.requirements;
  form.querySelector('input[name="location"]').value = randomJob.location;
  form.querySelector('select[name="type"]').value = randomJob.type;
  form.querySelector('input[name="salary"]').value = randomJob.salary;
  form.querySelector('select[name="category"]').value = randomJob.category;

  // Set deadline to 30 days from now
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);
  form.querySelector('input[name="deadline"]').value = deadline
    .toISOString()
    .split("T")[0];
}

/**
 * Show post job modal
 */
function showPostJobModal() {
  const form = document.getElementById("postJobForm");

  // Reset form and clear any edit mode
  form.reset();
  form.removeAttribute("data-edit-id");

  // Update modal title
  document.getElementById("postJobModalLabel").textContent = "Post New Job";
  document.getElementById("submitJobBtn").textContent = "Post Job";

  // Auto-fill form with sample data
  autoFillJobForm();

  // Show modal - use existing instance or create new one
  const modalEl = document.getElementById("postJobModal");
  let modal = bootstrap.Modal.getInstance(modalEl);
  if (!modal) {
    modal = new bootstrap.Modal(modalEl);
  }
  modal.show();
}

/**
 * Submit new job posting or update existing job
 */
function submitJob() {
  const form = document.getElementById("postJobForm");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const user = window.StorageManager.getCurrentUser();
  const editId = form.getAttribute("data-edit-id");

  if (editId) {
    // Update existing job
    updateExistingJob(editId, formData, user);
  } else {
    // Create new job
    createNewJob(formData, user);
  }
}

/**
 * Create a new job posting
 */
function createNewJob(formData, user) {
  const job = {
    id: "job_" + Date.now(),
    title: formData.get("title"),
    company: formData.get("company"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    location: formData.get("location"),
    type: formData.get("type"),
    salary: formData.get("salary"),
    category: formData.get("category"),
    deadline: formData.get("deadline"),
    status: "active", // Auto-activate for now (until admin system is built)
    postedBy: user.email,
    postedDate: new Date().toISOString(),
    applicationsCount: 0,
  };

  // Save job
  const jobs = getEmployerJobs();
  jobs.push(job);
  saveEmployerJobs(jobs);

  console.log("Job created successfully, refreshing dashboard...");

  // Remove focus from submit button to avoid aria-hidden warning
  const submitBtn = document.getElementById("submitJobBtn");
  if (submitBtn) {
    submitBtn.blur();
  }

  // Close modal
  const modalEl = document.getElementById("postJobModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) {
    modal.hide();
  }

  // Clear form
  document.getElementById("postJobForm").reset();

  // Show success message
  displayToast(
    "Job posted successfully! It's now live and visible to job seekers."
  );

  // Refresh dashboard immediately - no delay needed
  loadDashboardStats();
  loadEmployerJobs();

  console.log("Dashboard refreshed after creating job");
}

/**
 * Update an existing job posting
 */
function updateExistingJob(jobId, formData, user) {
  const jobs = getEmployerJobs();
  const jobIndex = jobs.findIndex((j) => j.id === jobId);

  if (jobIndex === -1) {
    displayToast("Error: Job not found", "error");
    return;
  }

  // Keep original data but update editable fields
  jobs[jobIndex] = {
    ...jobs[jobIndex],
    title: formData.get("title"),
    company: formData.get("company"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    location: formData.get("location"),
    type: formData.get("type"),
    salary: formData.get("salary"),
    category: formData.get("category"),
    deadline: formData.get("deadline"),
    updatedAt: new Date().toISOString(),
  };

  saveEmployerJobs(jobs);

  console.log("Job updated successfully, refreshing dashboard...");

  // Remove focus from submit button to avoid aria-hidden warning
  const submitBtn = document.getElementById("submitJobBtn");
  if (submitBtn) {
    submitBtn.blur();
  }

  // Close modal
  const modalEl = document.getElementById("postJobModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) {
    modal.hide();
  }

  // Clear form
  const form = document.getElementById("postJobForm");
  form.reset();
  form.removeAttribute("data-edit-id");

  // Show success message
  displayToast("Job updated successfully!");

  // Refresh dashboard immediately - no delay needed
  loadDashboardStats();
  loadEmployerJobs();

  console.log("Dashboard refreshed after updating job");
}

/**
 * View applications for a job
 */
function viewApplications(jobId) {
  const applications = getAllApplications().filter(
    (app) => app.jobId === jobId
  );
  const job = getEmployerJobs().find((j) => j.id === jobId);

  const modal = new bootstrap.Modal(
    document.getElementById("applicationsModal")
  );
  const applicationsList = document.getElementById("applicationsList");

  if (applications.length === 0) {
    applicationsList.innerHTML = `
      <div class="text-center py-4 text-muted">
        <p>No applications yet for this job.</p>
      </div>
    `;
  } else {
    applicationsList.innerHTML = `
      <h6 class="mb-3">Applications for: ${escapeHtml(job.title)}</h6>
      <div class="list-group">
        ${applications
          .map(
            (app) => `
          <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">${escapeHtml(
                  app.applicantName || "Job Seeker"
                )}</h6>
                <p class="mb-1 text-muted">
                  <small>
                    <svg width="14" height="14" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                    ${escapeHtml(app.applicantEmail)}
                  </small>
                </p>
                <p class="mb-0">
                  <small class="text-muted">Applied ${formatDate(
                    app.appliedDate
                  )}</small>
                </p>
              </div>
              <div>
                <button class="btn btn-sm btn-primary" onclick="alert('Feature coming soon: Contact applicant')">
                  Contact
                </button>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  modal.show();
}

/**
 * Activate a pending job
 */
function activateJob(jobId) {
  let jobs = getEmployerJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) return;

  job.status = "active";
  saveEmployerJobs(jobs);

  displayToast("Job activated! It's now visible to all job seekers.");
  loadDashboardStats();
  loadEmployerJobs();
}

/**
 * Edit job
 */
function editJob(jobId) {
  const jobs = getEmployerJobs();
  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    displayToast("Error: Job not found", "error");
    return;
  }

  // Populate form with existing job data
  const form = document.getElementById("postJobForm");
  form.elements["title"].value = job.title;
  form.elements["company"].value = job.company;
  form.elements["description"].value = job.description;
  form.elements["requirements"].value = job.requirements;
  form.elements["location"].value = job.location;
  form.elements["type"].value = job.type;
  form.elements["salary"].value = job.salary;
  form.elements["category"].value = job.category;
  form.elements["deadline"].value = job.deadline || "";

  // Set edit mode
  form.setAttribute("data-edit-id", jobId);

  // Update modal title and button
  document.getElementById("postJobModalLabel").textContent = "Edit Job Posting";
  document.getElementById("submitJobBtn").textContent = "Update Job";

  // Show modal - use existing instance or create new one
  const modalEl = document.getElementById("postJobModal");
  let modal = bootstrap.Modal.getInstance(modalEl);
  if (!modal) {
    modal = new bootstrap.Modal(modalEl);
  }
  modal.show();
}

/**
 * Delete job
 */
function deleteJob(jobId) {
  if (!confirm("Are you sure you want to delete this job posting?")) {
    return;
  }

  let jobs = getEmployerJobs();
  jobs = jobs.filter((job) => job.id !== jobId);
  saveEmployerJobs(jobs);

  displayToast("Job deleted successfully");
  loadDashboardStats();
  loadEmployerJobs();
}

/**
 * Get employer's jobs from storage
 */
function getEmployerJobs() {
  const user = window.StorageManager.getCurrentUser();
  const allJobs = JSON.parse(localStorage.getItem("employer_jobs")) || [];

  console.log(`Getting jobs for employer: ${user?.email}`);
  console.log(`Total jobs in storage: ${allJobs.length}`);

  // Filter jobs by current employer
  const employerJobs = allJobs.filter((job) => job.postedBy === user.email);
  console.log(`Employer's jobs: ${employerJobs.length}`);

  return employerJobs;
}

/**
 * Save employer jobs to storage
 */
function saveEmployerJobs(newJobs) {
  const user = window.StorageManager.getCurrentUser();
  let allJobs = JSON.parse(localStorage.getItem("employer_jobs")) || [];

  console.log(`Saving ${newJobs.length} jobs for employer: ${user?.email}`);
  console.log(`Jobs before save: ${allJobs.length}`);

  // Remove old jobs from this employer
  allJobs = allJobs.filter((job) => job.postedBy !== user.email);

  // Add new jobs
  allJobs = [...allJobs, ...newJobs];

  console.log(`Jobs after save: ${allJobs.length}`);

  localStorage.setItem("employer_jobs", JSON.stringify(allJobs));
}

/**
 * Get all applications for employer's jobs
 */
function getAllApplications() {
  const employerJobs = getEmployerJobs();
  const jobIds = employerJobs.map((job) => job.id);

  const allApplications =
    JSON.parse(localStorage.getItem("job_applications")) || [];

  return allApplications.filter((app) => jobIds.includes(app.jobId));
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Utility: Format date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString();
}

/**
 * Utility: Show toast notification
 */
function displayToast(message, type = "success") {
  // Check if global toast function exists from utils.js
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    // Fallback to alert
    alert(message);
  }
}

/**
 * Handle logout
 */
function handleLogout(event) {
  if (event) {
    event.preventDefault();
  }

  // Confirm logout
  if (!confirm("Are you sure you want to logout?")) {
    return;
  }

  // Use StorageManager to logout
  if (window.StorageManager && window.StorageManager.logoutUser) {
    window.StorageManager.logoutUser();
  } else {
    // Fallback: clear only employer data
    localStorage.removeItem("huntersite_user");
    localStorage.removeItem("huntersite_employer_profile");
    localStorage.removeItem("huntersite_employer_company");
  }

  // Redirect to login page
  window.location.href = "../login/login.html";
}

/**
 * View profile
 */
function viewProfile(event) {
  if (event) {
    event.preventDefault();
  }

  // For now, show an alert that profile page is coming soon
  // In the future, redirect to employer profile page
  alert(
    "Employer profile page coming soon! You can manage your company information here."
  );

  // Future implementation:
  // window.location.href = "../profile/employer-profile.html";
}
