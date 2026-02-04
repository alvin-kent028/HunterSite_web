(function () {
  const state = {
    data: null,
  };

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Load profile data from localStorage (source of truth) using our storage strategy
      state.data = await window.StorageManager.loadProfileData();
    } catch (err) {
      console.error("Failed to load profile data:", err.message);
      // Final fallback to embedded data if everything fails
      state.data = getFallbackData();
    }

    render(state.data);
    // Update To-Do progress display
    renderTodoProgress(state.data.todo);
    // Header user name is updated by header.js automatically
  });

  function render(data) {
    if (!data) return;
    renderBasicInfo(data.basicInfo || {});
    renderResume(data.resume || {});
    renderSkills(data.skills || {});
    renderExperience(data.experience || []);
    renderEducation(data.education || []);
  }

  function renderBasicInfo(info) {
    setText("pp-name", info.name);
    setText("pp-title", info.title);
    setText("pp-location", info.location);
    setText("pp-email", info.email);
    setText("pp-phone", info.phone);
    setText("pp-views", `${info.views || 0} views`);
    setText("pp-job-status", info.jobStatus);

    const avatar = document.getElementById("pp-avatar");
    if (avatar && info.avatar) {
      avatar.src = info.avatar;
      avatar.alt = info.name || "Profile Avatar";
    }

    const onlineDot = document.getElementById("pp-online-dot");
    if (onlineDot) {
      onlineDot.classList.toggle("online", !!info.online);
      onlineDot.setAttribute("aria-label", info.online ? "Online" : "Offline");
    }
  }

  function renderResume(resume) {
    const nameEl = document.getElementById("pp-resume-name");
    const linkEl = document.getElementById("pp-resume-link");
    if (nameEl) nameEl.textContent = resume.fileName || "No resume uploaded";
    if (linkEl) {
      if (resume.url) {
        linkEl.href = resume.url;
        linkEl.classList.remove("disabled");
        linkEl.setAttribute("aria-disabled", "false");
      } else {
        linkEl.href = "#";
        linkEl.classList.add("disabled");
        linkEl.setAttribute("aria-disabled", "true");
      }
    }
  }

  function renderSkills(skills) {
    // Technical skills
    const techWrap = document.getElementById("pp-tech-skills");
    if (techWrap) {
      techWrap.innerHTML = (skills.technical || [])
        .map(
          (s) => `
          <div class="skill-item">
            <span class="skill-name">${esc(s.name)}</span>
            <div class="skill-level">
              <div class="skill-bar"><div class="skill-progress" style="width: ${Math.max(
                0,
                Math.min(100, Number(s.level) || 0)
              )}%"></div></div>
              <span class="skill-percentage">${Math.max(
                0,
                Math.min(100, Number(s.level) || 0)
              )}%</span>
            </div>
          </div>
        `
        )
        .join("");
    }

    // Soft skills
    const softWrap = document.getElementById("pp-soft-skills");
    if (softWrap) {
      softWrap.innerHTML = (skills.soft || [])
        .map((t) => `<span class="skill-tag">${esc(t)}</span>`)
        .join("");
    }

    // Tools
    const toolsWrap = document.getElementById("pp-tools");
    if (toolsWrap) {
      toolsWrap.innerHTML = (skills.tools || [])
        .map(
          (t) => `
          <div class="tool-item">
            <div class="tool-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <span class="tool-name">${esc(t.name)}</span>
            <span class="tool-level">${esc(t.level)}</span>
          </div>
        `
        )
        .join("");
    }
  }

  function renderExperience(items) {
    const wrap = document.getElementById("pp-experience");
    if (!wrap) return;
    wrap.innerHTML = items
      .map(
        (exp) => `
      <div class="experience-item">
        <div class="experience-header">
          <div class="experience-main">
            <h5 class="job-title">${esc(exp.title)}</h5>
            <span class="company-name">${esc(exp.company)}</span>
          </div>
          <div class="experience-period">
            <span class="duration">${esc(exp.duration)}</span>
            <span class="location">${esc(exp.location)}</span>
          </div>
        </div>
        <ul class="job-responsibilities">
          ${(exp.responsibilities || [])
            .map((li) => `<li>${esc(li)}</li>`)
            .join("")}
        </ul>
      </div>
    `
      )
      .join("");
  }

  function renderEducation(items) {
    const wrap = document.getElementById("pp-education");
    if (!wrap) return;
    wrap.innerHTML = items
      .map(
        (ed) => `
      <div class="education-item">
        <div class="education-header">
          <div class="education-main">
            <h5 class="degree-title">${esc(ed.degree)}</h5>
            <span class="school-name">${esc(ed.school)}</span>
          </div>
          <div class="education-period">
            <span class="graduation">${esc(ed.graduation)}</span>
            <span class="gpa">${esc(ed.gpa || "")}</span>
          </div>
        </div>
        <div class="education-details">
          ${
            ed.description
              ? `<p class="education-description">${esc(ed.description)}</p>`
              : ""
          }
          ${
            (ed.courses || []).length
              ? `
              <div class="relevant-courses">
                <span class="courses-label">${esc(
                  ed.coursesLabel || "Courses:"
                )}</span>
                <div class="courses-tags">
                  ${(ed.courses || [])
                    .map((c) => `<span class="course-tag">${esc(c)}</span>`)
                    .join("")}
                </div>
              </div>
            `
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "—";
  }

  function esc(str) {
    const s = String(str ?? "");
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderTodoProgress(todo) {
    if (!todo || !todo.summary) return;

    const summary = todo.summary;
    const percentage = Math.round(summary.pct || 0);

    // Update progress badge
    const badge = document.querySelector(
      ".todo-card .progress-badge .progress-text"
    );
    if (badge) {
      badge.textContent = `${percentage}% Done`;
    }

    // Update progress bar
    const progressFill = document.querySelector(".todo-card .progress-fill");
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
  }

  function getFallbackData() {
    // Return empty default structure - this should rarely be used
    // as StorageManager handles the proper fallback chain
    return {
      basicInfo: {
        name: "",
        title: "",
        location: "",
        email: "",
        phone: "",
        avatar: "../assets/images/profile/profile-avatar.svg",
        online: false,
        jobStatus: "Open to opportunities",
        views: 0,
      },
      resume: {
        fileName: "",
        url: "",
      },
      skills: {
        technical: [],
        soft: [],
        tools: [],
      },
      experience: [],
      education: [],
      todo: {
        items: {
          "create-account": false,
          "complete-basic": false,
          "work-experience": false,
          "upload-resume": false,
          "add-education": false,
        },
        summary: {
          total: 5,
          done: 0,
          pct: 0,
        },
      },
    };
  }
})();
