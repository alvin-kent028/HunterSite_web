/**
 * Profile Management - Uses REAL Backend API (MongoDB)
 * NOT localStorage - Dynamic data from database
 */

document.addEventListener("DOMContentLoaded", async function () {
    await initProfile();
    setupEditModals();
});

async function initProfile() {
    // Check auth
    const token = localStorage.getItem('huntersite_token');
    const user = JSON.parse(localStorage.getItem('huntersite_user') || 'null');

    if (!token || !user) {
        alert("Please login to view your profile");
        window.location.href = "../login/login.html";
        return;
    }

    // Load profile from BACKEND API (not static JSON)
    try {
        const profile = await window.jobsAPI.getMyProfile();
        
        if (!profile) {
            throw new Error('Failed to load profile');
        }
        
        console.log("✅ Profile loaded from database");
        renderProfileData(profile, user);
        renderUserAddedSections(profile);
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error loading profile from database");
    }

    setupProfileForms();
    setupTodoList();
}

/**
 * Render profile data - DYNAMIC from logged-in user
 * NO hardcoded "Ruby Jane" - shows actual logged-in user's data
 */
function renderProfileData(profile, user) {
    // Use data from the logged-in user's profile
    const basicInfo = profile.basicInfo || {};
    
    // Update name - DYNAMIC (not "Ruby Jane")
    const nameElements = document.querySelectorAll(".user-name, .profile-name");
    nameElements.forEach((el) => {
        if (el) el.textContent = basicInfo.name || user.name || "User";
    });

    // Update location
    const locationEl = document.querySelector(".contact-item.location span");
    if (locationEl) locationEl.textContent = basicInfo.location || "";

    // Update email
    const emailEl = document.querySelector(".contact-item.email span");
    if (emailEl) emailEl.textContent = basicInfo.email || user.email || "";

    // Update phone
    const phoneEl = document.querySelector(".contact-item.phone span");
    if (phoneEl) phoneEl.textContent = basicInfo.phone || "";

    // Update job status
    const jobStatusEl = document.querySelector(".status-item.job-status span");
    if (jobStatusEl) {
        jobStatusEl.textContent = basicInfo.jobStatus || "Passively looking for jobs";
    }

    // Update online indicator
    const onlineIndicator = document.querySelector(".status-indicator");
    if (onlineIndicator) {
        onlineIndicator.classList.toggle("online", basicInfo.online === true);
    }

    // Update avatar if exists
    const avatarImg = document.querySelector(".avatar-img");
    if (avatarImg && basicInfo.avatar) {
        avatarImg.src = basicInfo.avatar;
    }

    // Update views
    const viewsEl = document.querySelector(".stat-number");
    if (viewsEl) {
        viewsEl.textContent = `${basicInfo.views || 0} views`;
    }

    // Update resume filename
    if (profile.resume && profile.resume.fileName) {
        const resumeNameEl = document.querySelector(".resume-card .file-name");
        if (resumeNameEl) resumeNameEl.textContent = profile.resume.fileName;
    }
}

/**
 * Setup edit modals
 */
function setupEditModals() {
    document.querySelectorAll(".card-header .edit-btn, .card-header .add-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    const basicEditBtn = document.querySelector(".basic-info-card .edit-btn");
    if (basicEditBtn) {
        basicEditBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            openBasicInfoModal();
        });
    }
}

/**
 * Open Basic Info Modal with current data
 */
function openBasicInfoModal() {
    const user = JSON.parse(localStorage.getItem('huntersite_user') || '{}');
    
    // Fetch current profile to prefill
    window.jobsAPI.getMyProfile().then(profile => {
        const basicInfo = profile?.basicInfo || {};
        
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val ?? "";
        };

        setVal("bi-name", basicInfo.name || user.name || "");
        setVal("bi-title", basicInfo.title || "");
        setVal("bi-location", basicInfo.location || "");
        setVal("bi-email", basicInfo.email || user.email || "");
        setVal("bi-phone", basicInfo.phone || "");

        const jobSel = document.getElementById("bi-jobStatus");
        if (jobSel) jobSel.value = basicInfo.jobStatus || "Passively looking for jobs";

        const onlineChk = document.getElementById("bi-online");
        if (onlineChk) onlineChk.checked = !!basicInfo.online;

        const form = document.getElementById("basicInfoForm");
        if (form) form.classList.remove("was-validated");

        const modalEl = document.getElementById("editBasicInfoModal");
        if (modalEl && window.bootstrap?.Modal) {
            const modal = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
            modal.show();
        }
    });
}

/**
 * Setup profile forms - Save to BACKEND API
 */
function setupProfileForms() {
    const basicForm = document.getElementById("basicInfoForm");
    if (basicForm) {
        basicForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            e.stopPropagation();

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

            try {
                // Save to BACKEND API
                const result = await window.jobsAPI.updateProfile({ basicInfo: basicInfoUpdates });
                
                if (result.profile) {
                    const user = JSON.parse(localStorage.getItem('huntersite_user') || '{}');
                    renderProfileData(result.profile, user);
                    showToast("Profile updated in database");

                    const modalEl = document.getElementById("editBasicInfoModal");
                    if (modalEl && window.bootstrap?.Modal) {
                        const modal = window.bootstrap.Modal.getInstance(modalEl) || new window.bootstrap.Modal(modalEl);
                        modal.hide();
                    }
                }
            } catch (error) {
                console.error("Save error:", error);
                alert("Failed to save to database: " + error.message);
            }
        });
    }
}

/**
 * Setup To-Do List
 */
function setupTodoList() {
    const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async function() {
            const todoItem = this.closest('.todo-item');
            if (this.checked) {
                todoItem.classList.add('completed');
            } else {
                todoItem.classList.remove('completed');
            }
            
            // Update progress in backend
            await updateTodoProgress();
        });
    });
}

async function updateTodoProgress() {
    const checkboxes = document.querySelectorAll('.todo-item input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.todo-item input[type="checkbox"]:checked').length;
    const pct = Math.round((checked / total) * 100);
    
    // Update UI
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}% Done`;
    
    // Update in backend
    try {
        await window.jobsAPI.updateProfile({
            todo: {
                items: {
                    'create-account': true,
                    'complete-basic': checkboxes[1]?.checked || false,
                    'work-experience': checkboxes[2]?.checked || false,
                    'upload-resume': checkboxes[3]?.checked || false,
                    'add-education': checkboxes[4]?.checked || false
                }
            }
        });
    } catch (error) {
        console.error("Failed to update todo:", error);
    }
}

/**
 * Render user-added sections (skills, experience, education)
 */
function renderUserAddedSections(profile) {
    // Remove prior user-added nodes
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
        profile.education.forEach((edu) => {
            const div = document.createElement("div");
            div.className = "education-item user-added";
            const courses = (edu.courses || [])
                .map((c) => `<span class="course-tag">${c}</span>`)
                .join("");
            div.innerHTML = `
                <div class="education-header">
                    <div class="education-main">
                        <h5 class="degree-title">${edu.degree}</h5>
                        <span class="school-name">${edu.school}</span>
                    </div>
                    <div class="education-period">
                        <span class="graduation">${edu.graduation}</span>
                        <span class="gpa">${edu.gpa || ""}</span>
                    </div>
                </div>
                <div class="education-details">
                    <p class="education-description">${edu.description || ""}</p>
                    <div class="relevant-courses">
                        <span class="courses-label">${edu.coursesLabel || "Courses:"}</span>
                        <div class="courses-tags">${courses}</div>
                    </div>
                </div>`;
            eduWrap.appendChild(div);
        });
    }
}

/**
 * Helper: Show toast notification
 */
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5";
    toast.style.zIndex = "9999";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

console.log("👤 Profile management loaded (MongoDB Backend)");
