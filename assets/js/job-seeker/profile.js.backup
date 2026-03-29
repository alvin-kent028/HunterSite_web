/**
 * Profile Management
 * Handles user profile editing and saving with hybrid storage strategy
 *
 * Storage Flow:
 * 1. On first load: Check localStorage → Load from JSON if empty → Save to localStorage
 * 2. On edit: Update localStorage → Update UI immediately
 * 3. LocalStorage always takes priority over JSON defaults
 */

document.addEventListener("DOMContentLoaded", async function () {
  await initProfile();
  setupEditModals();
});

async function initProfile() {
  // Check if user is logged in
  const user = window.StorageManager.getCurrentUser();

  if (!user) {
    alert("Please login to view your profile");
    window.location.href = "../login/login.html";
    return;
  }

  // Load user profile data using hybrid strategy
  // This checks localStorage first, then loads from JSON if needed
  try {
    const profile = await window.StorageManager.loadProfileData();
    console.log("✅ Profile data loaded");

    // Render the profile with loaded data
    renderProfileData(profile);
    renderUserAddedSections(profile);
  } catch (error) {
    console.error("Error initializing profile:", error);
    alert("Error loading profile data. Using defaults.");

    // Fallback to empty profile
    const defaultProfile = window.StorageManager.getDefaultProfileStructure();
    renderProfileData(defaultProfile);
  }

  // Setup profile edit forms
  setupProfileForms();

  // Show saved jobs
  showSavedJobs();

  // Show applications
  showApplications();

  // Setup To-Do List progress and handlers
  setupTodoList();
}

/**
 * Render profile data to the UI
 * @param {Object} profile - Complete profile object
 */
function renderProfileData(profile) {
  const user = window.StorageManager.getCurrentUser();

  // Basic Info Section
  if (profile.basicInfo) {
    const bi = profile.basicInfo;

    // Update name in header and main profile
    const nameElements = document.querySelectorAll(".user-name, .profile-name");
    nameElements.forEach((el) => {
      if (el) el.textContent = bi.name || user.name || "";
    });

    // Update location
    const locationEl = document.querySelector(".contact-item.location span");
    if (locationEl) locationEl.textContent = bi.location || "";

    // Update email
    const emailEl = document.querySelector(".contact-item.email span");
    if (emailEl) emailEl.textContent = bi.email || user.email || "";

    // Update phone
    const phoneEl = document.querySelector(".contact-item.phone span");
    if (phoneEl) phoneEl.textContent = bi.phone || "";

    // Update job status
    const jobStatusEl = document.querySelector(".status-item.job-status span");
    if (jobStatusEl)
      jobStatusEl.textContent = bi.jobStatus || "Open to opportunities";

    // Update online indicator
    const onlineIndicator = document.querySelector(".status-indicator");
    if (onlineIndicator) {
      onlineIndicator.classList.toggle("online", bi.online === true);
    }
  }

  // Resume Section
  if (profile.resume && profile.resume.fileName) {
    const resumeNameEl = document.querySelector(".resume-card .file-name");
    if (resumeNameEl) resumeNameEl.textContent = profile.resume.fileName;
  }
}

/**
 * Legacy function kept for compatibility
 * Now uses the new renderProfileData internally
 */
function loadProfileData() {
  const profile = window.StorageManager.getUserProfile();
  renderProfileData(profile);
}

/**
 * Helper to update display elements
 * @param {string} selector - CSS selector
 * @param {string} value - Value to display
 */
function updateDisplayElement(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) {
    element.textContent = value;
  }
}

function updateField(selector, value) {
  const field = document.querySelector(selector);
  if (field && value) {
    field.value = value;
  }
}

function setupProfileForms() {
  // Find all forms in the profile page
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(this);
      const profileData = {};

      for (let [key, value] of formData.entries()) {
        profileData[key] = value;
      }

      // Save profile
      const result = window.StorageManager.saveUserProfile(profileData);

      if (result.success) {
        showToast("Profile updated successfully!");

        // Update display
        loadProfileData();
      } else {
        alert(result.message || "Failed to save profile");
      }
    });
  });

  // Add edit buttons if they don't exist
  addEditButtons();
}

function addEditButtons() {
  // Add an "Edit Profile" button if it doesn't exist
  const header = document.querySelector(".profile-header, header");
  if (!header || header.querySelector(".edit-profile-btn")) return;

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn-sm btn-primary edit-profile-btn";
  editBtn.textContent = "Edit Profile";
  editBtn.style.position = "fixed";
  editBtn.style.top = "80px";
  editBtn.style.right = "20px";
  editBtn.style.zIndex = "1000";

  editBtn.addEventListener("click", function () {
    toggleEditMode();
  });

  document.body.appendChild(editBtn);

  // Add save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-sm btn-success save-profile-btn";
  saveBtn.textContent = "Save Changes";
  saveBtn.style.position = "fixed";
  saveBtn.style.top = "120px";
  saveBtn.style.right = "20px";
  saveBtn.style.zIndex = "1000";
  saveBtn.style.display = "none";

  saveBtn.addEventListener("click", function () {
    saveProfileChanges();
  });

  document.body.appendChild(saveBtn);
}

function toggleEditMode() {
  const inputs = document.querySelectorAll("input, textarea, select");
  const editBtn = document.querySelector(".edit-profile-btn");
  const saveBtn = document.querySelector(".save-profile-btn");

  inputs.forEach((input) => {
    if (input.disabled || input.readOnly) {
      input.disabled = false;
      input.readOnly = false;
      input.classList.add("border-primary");
    } else {
      input.disabled = true;
      input.classList.remove("border-primary");
    }
  });

  // Toggle buttons
  if (editBtn && saveBtn) {
    if (saveBtn.style.display === "none") {
      saveBtn.style.display = "block";
      editBtn.textContent = "Cancel";
    } else {
      saveBtn.style.display = "none";
      editBtn.textContent = "Edit Profile";
      loadProfileData(); // Reload to cancel changes
    }
  }
}

function saveProfileChanges() {
  const inputs = document.querySelectorAll(
    "input[name], textarea[name], select[name]"
  );
  const profileData = {};

  inputs.forEach((input) => {
    if (input.name) {
      profileData[input.name] = input.value;
    }
  });

  const result = window.StorageManager.saveUserProfile(profileData);

  if (result.success) {
    showToast("Profile saved successfully!");
    toggleEditMode();
  } else {
    alert(result.message);
  }
}

function showSavedJobs() {
  const savedJobs = window.StorageManager.getSavedJobs();

  // Preferred: update dedicated saved jobs list if present
  const list = document.getElementById("savedJobsList");
  if (list) {
    list.innerHTML = savedJobs.length
      ? savedJobs
          .map(
            (job) => `
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title h6">${job.title}</h5>
            <p class="card-text small text-muted">${job.company} • ${
              job.location
            }</p>
            <p class="small">Saved: ${new Date(
              job.savedDate
            ).toLocaleDateString()}</p>
            <button class="btn btn-sm btn-outline-primary" onclick="viewJob('${
              job.id
            }')">View</button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeSavedJob('${
              job.id
            }')">Remove</button>
          </div>
        </div>`
          )
          .join("")
      : '<p class="text-muted">No saved jobs yet.</p>';

    // Update header count if available
    const headerCount = list.closest(".card")?.querySelector(".card-header h3");
    if (headerCount) {
      headerCount.textContent = `Saved Jobs (${savedJobs.length})`;
    }
    return;
  }

  // Fallback: Find a generic container or create a section
  const container = document.querySelector(".saved-jobs-container, #savedJobs");
  if (!container) {
    createSavedJobsSection(savedJobs);
    return;
  }
  container.innerHTML = savedJobs.length
    ? savedJobs
        .map(
          (job) => `
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title h6">${job.title}</h5>
          <p class="card-text small text-muted">${job.company} • ${
            job.location
          }</p>
          <p class="small">Saved: ${new Date(
            job.savedDate
          ).toLocaleDateString()}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="viewJob('${
            job.id
          }')">View</button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeSavedJob('${
            job.id
          }')">Remove</button>
        </div>
      </div>`
        )
        .join("")
    : '<p class="text-muted">No saved jobs yet.</p>';
}

function showApplications() {
  const applications = window.StorageManager.getUserApplications();

  const container = document.querySelector(
    ".applications-container, #applications"
  );
  if (!container) {
    createApplicationsSection(applications);
    return;
  }

  if (applications.length === 0) {
    container.innerHTML = '<p class="text-muted">No applications yet.</p>';
    return;
  }

  container.innerHTML = applications
    .map(
      (app) => `
    <div class="card mb-2">
      <div class="card-body">
        <h5 class="card-title h6">${app.jobTitle}</h5>
        <p class="card-text small text-muted">${app.company}</p>
        <p class="small">Applied: ${new Date(
          app.appliedDate
        ).toLocaleDateString()}</p>
        <span class="badge bg-${
          app.status === "pending" ? "warning" : "success"
        }">${app.status}</span>
      </div>
    </div>
  `
    )
    .join("");
}

function createSavedJobsSection(savedJobs) {
  const main = document.querySelector("main");
  if (!main) return;

  const section = document.createElement("div");
  section.className = "container my-4";
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="h5 mb-0">Saved Jobs (${savedJobs.length})</h3>
      </div>
      <div class="card-body" id="savedJobsList">
        ${
          savedJobs.length === 0
            ? '<p class="text-muted">No saved jobs yet.</p>'
            : savedJobs
                .map(
                  (job) => `
            <div class="card mb-2">
              <div class="card-body">
                <h5 class="card-title h6">${job.title}</h5>
                <p class="card-text small text-muted">${job.company} • ${
                    job.location
                  }</p>
                <p class="small">Saved: ${new Date(
                  job.savedDate
                ).toLocaleDateString()}</p>
                <button class="btn btn-sm btn-outline-danger" onclick="removeSavedJobFromProfile('${
                  job.id
                }')">Remove</button>
              </div>
            </div>
          `
                )
                .join("")
        }
      </div>
    </div>
  `;

  main.appendChild(section);
}

function createApplicationsSection(applications) {
  const main = document.querySelector("main");
  if (!main) return;

  const section = document.createElement("div");
  section.className = "container my-4";
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="h5 mb-0">My Applications (${applications.length})</h3>
      </div>
      <div class="card-body" id="applicationsList">
        ${
          applications.length === 0
            ? '<p class="text-muted">No applications yet.</p>'
            : applications
                .map(
                  (app) => `
            <div class="card mb-2">
              <div class="card-body">
                <h5 class="card-title h6">${app.jobTitle}</h5>
                <p class="card-text small text-muted">${app.company}</p>
                <p class="small">Applied: ${new Date(
                  app.appliedDate
                ).toLocaleDateString()}</p>
                <span class="badge bg-${
                  app.status === "pending" ? "warning" : "success"
                }">${app.status}</span>
              </div>
            </div>
          `
                )
                .join("")
        }
      </div>
    </div>
  `;

  main.appendChild(section);
}

// Global functions for buttons
window.removeSavedJobFromProfile = function (jobId) {
  window.removeSavedJob(jobId);
};

window.viewJob = function (jobId) {
  window.location.href = "../job-listing/job-listing.html";
};

// Global remove handler to support buttons rendered by showSavedJobs
window.removeSavedJob = function (jobId) {
  if (!confirm("Remove this job from saved list?")) return;
  const result = window.StorageManager.removeSavedJob(jobId);
  if (result.success) {
    showToast("Job removed");
    showSavedJobs();
  } else {
    alert(result.message || "Failed to remove job");
  }
};

// Helper function
function showToast(message) {
  const toast = document.createElement("div");
  toast.className =
    "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5";
  toast.style.zIndex = "9999";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

console.log("👤 Profile management loaded");

// ==========================
// Bootstrap Edit Modals
// ==========================
function setupEditModals() {
  // Prevent header buttons from toggling collapse
  document
    .querySelectorAll(".card-header .edit-btn, .card-header .add-btn")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    });

  // Basic Info edit button
  const basicEditBtn = document.querySelector(".basic-info-card .edit-btn");
  if (basicEditBtn) {
    basicEditBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openBasicInfoModal();
    });
  }

  // Resume edit button
  const resumeEditBtn = document.querySelector(".resume-card .edit-btn");
  if (resumeEditBtn) {
    resumeEditBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openResumeModal();
    });
  }

  // Skills add button
  const skillsAddBtn = document.querySelector(".skills-card .add-btn");
  if (skillsAddBtn) {
    skillsAddBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openAddSkillModal();
    });
  }

  // Experience header edit button (used as add)
  const expEditBtn = document.querySelector(".experience-card .edit-btn");
  if (expEditBtn) {
    expEditBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openAddExperienceModal();
    });
  }

  // Education header edit button (used as add)
  const eduEditBtn = document.querySelector(".education-card .edit-btn");
  if (eduEditBtn) {
    eduEditBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openAddEducationModal();
    });
  }

  // Basic Info form submit
  const basicForm = document.getElementById("basicInfoForm");
  if (basicForm) {
    basicForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Bootstrap validation
      if (!basicForm.checkValidity()) {
        basicForm.classList.add("was-validated");
        return;
      }

      const formData = new FormData(basicForm);
      const basicInfoUpdates = {
        name: formData.get("name"),
        title: formData.get("title"),
        location: formData.get("location"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        jobStatus: formData.get("jobStatus"),
        online: formData.get("online") ? true : false,
      };

      // Use partial update to merge with existing profile
      const result = window.StorageManager.saveUserProfile(
        { basicInfo: basicInfoUpdates },
        true // isPartialUpdate
      );

      if (result.success) {
        // Reload profile and re-render UI
        const updatedProfile = window.StorageManager.getUserProfile();
        renderProfileData(updatedProfile);
        showToast("Basic information updated");

        // Close modal
        const modalEl = document.getElementById("editBasicInfoModal");
        if (modalEl && window.bootstrap?.Modal) {
          const modal =
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl);
          modal.hide();
        }
      } else {
        alert(result.message || "Failed to save changes");
      }
    });
  }

  // Resume form submit
  const resumeForm = document.getElementById("resumeForm");
  if (resumeForm) {
    resumeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!resumeForm.checkValidity()) {
        resumeForm.classList.add("was-validated");
        return;
      }
      const fd = new FormData(resumeForm);

      // Use partial update to merge resume data
      const result = window.StorageManager.saveUserProfile(
        {
          resume: {
            fileName: fd.get("fileName") || "",
            url: fd.get("url") || "",
          },
        },
        true // isPartialUpdate
      );

      if (result.success) {
        // Reload and re-render
        const updatedProfile = window.StorageManager.getUserProfile();
        renderProfileData(updatedProfile);
        showToast("Resume updated");

        const modalEl = document.getElementById("editResumeModal");
        if (modalEl && window.bootstrap?.Modal) {
          (
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl)
          ).hide();
        }
      } else {
        alert(result.message || "Failed to save changes");
      }
    });
  }

  // Skill form submit
  const skillForm = document.getElementById("skillForm");
  if (skillForm) {
    skillForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!skillForm.checkValidity()) {
        skillForm.classList.add("was-validated");
        return;
      }
      const fd = new FormData(skillForm);
      const type = fd.get("type");
      const name = fd.get("name");
      let level = fd.get("level");

      const profile = window.StorageManager.getUserProfile() || {};
      profile.skills = profile.skills || {};
      profile.skills.technical = profile.skills.technical || [];
      profile.skills.soft = profile.skills.soft || [];
      profile.skills.tools = profile.skills.tools || [];

      if (type === "technical") {
        const lvl = Math.max(0, Math.min(100, Number(level) || 0));
        profile.skills.technical.push({ name, level: lvl });
      } else if (type === "soft") {
        profile.skills.soft.push(name);
      } else if (type === "tool") {
        profile.skills.tools.push({ name, level: level || "Intermediate" });
      }

      const result = window.StorageManager.saveUserProfile(profile, false);
      if (result.success) {
        // Re-render the skills sections
        renderUserAddedSections(profile);
        showToast("Skill added");

        const modalEl = document.getElementById("addSkillModal");
        if (modalEl && window.bootstrap?.Modal) {
          (
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl)
          ).hide();
        }
        skillForm.reset();
        skillForm.classList.remove("was-validated");
      } else {
        alert(result.message || "Failed to save skill");
      }
    });
  }

  // Experience form submit
  const experienceForm = document.getElementById("experienceForm");
  if (experienceForm) {
    experienceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!experienceForm.checkValidity()) {
        experienceForm.classList.add("was-validated");
        return;
      }
      const fd = new FormData(experienceForm);
      const item = {
        title: fd.get("title") || "",
        company: fd.get("company") || "",
        duration: fd.get("duration") || "",
        location: fd.get("location") || "",
        responsibilities: (fd.get("responsibilities") || "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const profile = window.StorageManager.getUserProfile() || {};
      profile.experience = profile.experience || [];
      profile.experience.push(item);

      const result = window.StorageManager.saveUserProfile(profile, false);
      if (result.success) {
        // Re-render the experience section
        renderUserAddedSections(profile);
        showToast("Experience added");

        const modalEl = document.getElementById("addExperienceModal");
        if (modalEl && window.bootstrap?.Modal) {
          (
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl)
          ).hide();
        }
        experienceForm.reset();
        experienceForm.classList.remove("was-validated");
      } else {
        alert(result.message || "Failed to save experience");
      }
    });
  }

  // Education form submit
  const educationForm = document.getElementById("educationForm");
  if (educationForm) {
    educationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!educationForm.checkValidity()) {
        educationForm.classList.add("was-validated");
        return;
      }
      const fd = new FormData(educationForm);
      const item = {
        degree: fd.get("degree") || "",
        school: fd.get("school") || "",
        graduation: fd.get("graduation") || "",
        gpa: fd.get("gpa") || "",
        description: fd.get("description") || "",
        coursesLabel: "Relevant Courses:",
        courses: (fd.get("courses") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const profile = window.StorageManager.getUserProfile() || {};
      profile.education = profile.education || [];
      profile.education.push(item);

      const result = window.StorageManager.saveUserProfile(profile, false);
      if (result.success) {
        // Re-render the education section
        renderUserAddedSections(profile);
        showToast("Education added");

        const modalEl = document.getElementById("addEducationModal");
        if (modalEl && window.bootstrap?.Modal) {
          (
            window.bootstrap.Modal.getInstance(modalEl) ||
            new window.bootstrap.Modal(modalEl)
          ).hide();
        }
        educationForm.reset();
        educationForm.classList.remove("was-validated");
      } else {
        alert(result.message || "Failed to save education");
      }
    });
  }
}

function openBasicInfoModal() {
  const user = window.StorageManager.getCurrentUser() || {};
  const profile = window.StorageManager.getUserProfile() || {};
  const basicInfo = profile.basicInfo || {};

  // Prefill values from basicInfo object
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };

  setVal(
    "bi-name",
    basicInfo.name || user.name || (user.email || "").split("@")[0]
  );
  setVal("bi-title", basicInfo.title || "");
  setVal("bi-location", basicInfo.location || "");
  setVal("bi-email", basicInfo.email || user.email || "");
  setVal("bi-phone", basicInfo.phone || "");

  const jobSel = document.getElementById("bi-jobStatus");
  if (jobSel)
    jobSel.value = basicInfo.jobStatus || "Passively looking for jobs";

  const onlineChk = document.getElementById("bi-online");
  if (onlineChk) onlineChk.checked = !!basicInfo.online;

  // Reset validation state
  const form = document.getElementById("basicInfoForm");
  if (form) form.classList.remove("was-validated");

  // Show modal
  const modalEl = document.getElementById("editBasicInfoModal");
  if (modalEl && window.bootstrap?.Modal) {
    const modal =
      window.bootstrap.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl);
    modal.show();
  }
}

function openResumeModal() {
  const profile = window.StorageManager.getUserProfile() || {};
  const resume = profile.resume || {};
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? "";
  };
  setVal("re-fileName", resume.fileName || "");
  setVal("re-url", resume.url || "");
  const form = document.getElementById("resumeForm");
  if (form) form.classList.remove("was-validated");
  const modalEl = document.getElementById("editResumeModal");
  if (modalEl && window.bootstrap?.Modal) {
    (
      window.bootstrap.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl)
    ).show();
  }
}

function openAddSkillModal() {
  const form = document.getElementById("skillForm");
  if (form) form.classList.remove("was-validated");
  const modalEl = document.getElementById("addSkillModal");
  if (modalEl && window.bootstrap?.Modal) {
    (
      window.bootstrap.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl)
    ).show();
  }
  // Toggle level help based on type
  const typeSel = document.getElementById("sk-type");
  const levelWrap = document.getElementById("sk-level-wrap");
  if (typeSel && levelWrap) {
    const updateVisibility = () => {
      const t = typeSel.value;
      levelWrap.querySelector("label").textContent =
        t === "technical"
          ? "Level (0-100)"
          : t === "tool"
          ? "Level Label"
          : "Level (optional)";
    };
    typeSel.removeEventListener("change", updateVisibility);
    typeSel.addEventListener("change", updateVisibility);
    updateVisibility();
  }
}

function openAddExperienceModal() {
  const form = document.getElementById("experienceForm");
  if (form) form.classList.remove("was-validated");
  const modalEl = document.getElementById("addExperienceModal");
  if (modalEl && window.bootstrap?.Modal) {
    (
      window.bootstrap.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl)
    ).show();
  }
}

function openAddEducationModal() {
  const form = document.getElementById("educationForm");
  if (form) form.classList.remove("was-validated");
  const modalEl = document.getElementById("addEducationModal");
  if (modalEl && window.bootstrap?.Modal) {
    (
      window.bootstrap.Modal.getInstance(modalEl) ||
      new window.bootstrap.Modal(modalEl)
    ).show();
  }
}

/**
 * Render user-added sections (skills, experience, education)
 * @param {Object} profile - Profile object (optional, loads from storage if not provided)
 */
function renderUserAddedSections(profile) {
  // If profile not provided, load from storage
  if (!profile) {
    profile = window.StorageManager.getUserProfile() || {};
  }

  // Remove prior user-added nodes to prevent duplication
  document.querySelectorAll(".user-added").forEach((el) => el.remove());

  // Skills
  const techWrap = document.querySelector(".skills-card .skills-grid");
  if (techWrap && profile.skills?.technical?.length) {
    profile.skills.technical.forEach((s) => {
      const lvl = Math.max(0, Math.min(100, Number(s.level) || 0));
      const div = document.createElement("div");
      div.className = "skill-item user-added";
      div.innerHTML = `
        <span class="skill-name">${s.name}</span>
        <div class="skill-level">
          <div class="skill-bar"><div class="skill-progress" style="width:${lvl}%"></div></div>
          <span class="skill-percentage">${lvl}%</span>
        </div>`;
      techWrap.appendChild(div);
    });
  }

  const softWrap = document.querySelector(".skills-card .skills-tags");
  if (softWrap && profile.skills?.soft?.length) {
    profile.skills.soft.forEach((name) => {
      const span = document.createElement("span");
      span.className = "skill-tag user-added";
      span.textContent = name;
      softWrap.appendChild(span);
    });
  }

  const toolsWrap = document.querySelector(".skills-card .tools-grid");
  if (toolsWrap && profile.skills?.tools?.length) {
    profile.skills.tools.forEach((t) => {
      const div = document.createElement("div");
      div.className = "tool-item user-added";
      div.innerHTML = `
        <div class="tool-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <span class="tool-name">${t.name}</span>
        <span class="tool-level">${t.level || ""}</span>`;
      toolsWrap.appendChild(div);
    });
  }

  // Experience
  const expWrap = document.querySelector(".experience-card .experience-list");
  if (expWrap && profile.experience?.length) {
    profile.experience.forEach((exp) => {
      const div = document.createElement("div");
      div.className = "experience-item user-added";
      const lis = (exp.responsibilities || [])
        .map((r) => `<li>${r}</li>`)
        .join("");
      div.innerHTML = `
        <div class="experience-header">
          <div class="experience-main">
            <h5 class="job-title">${exp.title}</h5>
            <span class="company-name">${exp.company}</span>
          </div>
          <div class="experience-period">
            <span class="duration">${exp.duration}</span>
            <span class="location">${exp.location || ""}</span>
          </div>
        </div>
        <ul class="job-responsibilities">${lis}</ul>`;
      expWrap.appendChild(div);
    });
  }

  // Education
  const eduWrap = document.querySelector(".education-card .education-list");
  if (eduWrap && profile.education?.length) {
    profile.education.forEach((ed) => {
      const div = document.createElement("div");
      div.className = "education-item user-added";
      const courses = (ed.courses || [])
        .map((c) => `<span class="course-tag">${c}</span>`)
        .join("");
      div.innerHTML = `
        <div class="education-header">
          <div class="education-main">
            <h5 class="degree-title">${ed.degree}</h5>
            <span class="school-name">${ed.school}</span>
          </div>
          <div class="education-period">
            <span class="graduation">${ed.graduation || ""}</span>
            <span class="gpa">${ed.gpa || ""}</span>
          </div>
        </div>
        <div class="education-details">
          ${
            ed.description
              ? `<p class="education-description">${ed.description}</p>`
              : ""
          }
          ${
            (ed.courses || []).length
              ? `<div class="relevant-courses"><span class="courses-label">${
                  ed.coursesLabel || "Relevant Courses:"
                }</span><div class="courses-tags">${courses}</div></div>`
              : ""
          }
        </div>`;
      eduWrap.appendChild(div);
    });
  }
}

// ==========================
// To-Do List: Progress & Handlers
// ==========================
function setupTodoList() {
  const todoCard = document.querySelector(".todo-card");
  if (!todoCard) return;

  const checkboxes = Array.from(
    todoCard.querySelectorAll('input[type="checkbox"]')
  );

  // Restore previously saved state for each checkbox
  const savedMap = loadTodoItemsState();
  checkboxes.forEach((cb) => {
    if (Object.prototype.hasOwnProperty.call(savedMap, cb.id)) {
      cb.checked = !!savedMap[cb.id];
    }
    const item = cb.closest(".todo-item");
    if (item) item.classList.toggle("completed", cb.checked);
  });

  // Wire change handlers
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const item = cb.closest(".todo-item");
      if (item) item.classList.toggle("completed", cb.checked);
      const computed = updateTodoProgress();
      // Persist map + summary
      const map = buildTodoItemsMap();
      persistTodoState(map, computed);
    });
  });

  // Initial calculation
  const computed = updateTodoProgress();
  persistTodoState(buildTodoItemsMap(), computed);
}

function updateTodoProgress() {
  const todoCard = document.querySelector(".todo-card");
  if (!todoCard) return;

  const items = Array.from(todoCard.querySelectorAll(".todo-list .todo-item"));

  let totalWeight = 0;
  let completedWeight = 0;
  let doneCount = 0;

  // Calculate weighted progress
  items.forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    const weight = parseFloat(item.getAttribute("data-weight")) || 0;

    totalWeight += weight;

    if (checkbox && checkbox.checked) {
      completedWeight += weight;
      doneCount++;
    }
  });

  // Calculate percentage based on weights
  // If unchecked, contributes 0%. If checked, contributes full weight.
  const pct =
    totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  const badge = todoCard.querySelector(".progress-badge .progress-text");
  if (badge) badge.textContent = `${pct}% Done`;

  const bar = todoCard.querySelector(".progress-fill");
  if (bar) bar.style.width = `${pct}%`;

  // Persist progress so other pages (e.g., preview) can display it
  try {
    // return computed summary to caller; persistence handled by caller
  } catch (err) {
    console.warn("Unable to persist todo progress:", err);
  }

  return { total: items.length, done: doneCount, pct };
}

function buildTodoItemsMap() {
  const todoCard = document.querySelector(".todo-card");
  const map = {};
  if (!todoCard) return map;
  const checkboxes = todoCard.querySelectorAll(
    '.todo-list input[type="checkbox"][id]'
  );
  checkboxes.forEach((cb) => {
    map[cb.id] = !!cb.checked;
  });
  return map;
}

function loadTodoItemsState() {
  try {
    const profile = window.StorageManager.getUserProfile() || {};
    return profile.todo && profile.todo.items ? profile.todo.items : {};
  } catch (e) {
    return {};
  }
}

function persistTodoState(itemsMap, summary) {
  try {
    const profile = window.StorageManager.getUserProfile() || {};
    profile.todo = {
      items: itemsMap || {},
      total: summary?.total ?? 0,
      done: summary?.done ?? 0,
      pct: summary?.pct ?? 0,
    };
    window.StorageManager.saveUserProfile(profile);
  } catch (e) {
    // ignore
  }
}
