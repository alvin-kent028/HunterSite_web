/**
 * Page-specific JavaScript for the homepage (index.html)
 * - Loads data via JobFilterModule (embedded data pattern used across the app)
 * - Renders Popular Categories and Popular Jobs from JSON
 * - Adds autocomplete suggestions to the main search box
 * Encapsulated in an IIFE to avoid polluting global namespace and to not conflict
 * with existing global scripts (jobs.js, main.js, etc.).
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // Only run on pages that have the expected elements
    const searchForm = document.querySelector(".search-form");
    const categoriesCarouselInner = document.querySelector(
      "#categoriesCarousel .carousel-inner"
    );
    const jobsSection = document.querySelector("#jobs .row");

    if (!searchForm && !categoriesCarouselInner && !jobsSection) return;

    // Wait for JobFilterModule (central data provider) to be available
    waitForJobFilterModule()
      .then(() => {
        const categories = window.JobFilterModule.getAllCategories() || [];
        const jobs = window.JobFilterModule.getAllJobs() || [];

        if (categoriesCarouselInner) {
          renderCategories(categoriesCarouselInner, categories);
        }

        if (jobsSection) {
          renderPopularJobs(jobsSection, jobs, categories);
          setupDynamicSaveButtons(jobsSection);
          applySavedState(jobsSection);
        }

        if (searchForm) {
          setupSearchAutocomplete(searchForm, jobs, categories);
          setupSearchFormRedirect(searchForm);
        }
      })
      .catch((err) =>
        console.error("index-page: JobFilterModule unavailable", err)
      );
  });

  function waitForJobFilterModule(maxWaitMs = 2000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      (function check() {
        if (
          window.JobFilterModule &&
          typeof window.JobFilterModule.getAllJobs === "function"
        ) {
          resolve();
        } else if (Date.now() - start > maxWaitMs) {
          reject(new Error("JobFilterModule not found"));
        } else {
          setTimeout(check, 50);
        }
      })();
    });
  }

  function renderCategories(container, categories) {
    // Render categories in slides of 4 per carousel-item
    const perSlide = 4;
    const slides = [];
    for (let i = 0; i < categories.length; i += perSlide) {
      slides.push(categories.slice(i, i + perSlide));
    }

    container.innerHTML = "";

    slides.forEach((group, idx) => {
      const item = document.createElement("div");
      item.className = "carousel-item" + (idx === 0 ? " active" : "");
      const row = document.createElement("div");
      row.className = "row g-3";

      group.forEach((cat) => {
        const col = document.createElement("div");
        col.className = "col-lg-3 col-md-6 col-sm-6";
        const basePath = getBasePath();
        col.innerHTML = `
          <a href="${basePath}job-listing/job-listing.html?category=${encodeURIComponent(
          cat.id || ""
        )}" class="text-decoration-none" aria-label="View ${escapeHtml(
          cat?.name || "category"
        )} jobs">
            <article class="card border-2 rounded-4 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="icon bg-light rounded-3 d-inline-flex p-2 mb-3">${escapeHtml(
                  cat.icon || ""
                )}</div>
                <h3 class="h6 fw-bold mb-1">${escapeHtml(cat.name || "")}</h3>
                <p class="small fw-bold text-warning mb-2">${escapeHtml(
                  String(cat.jobCount || "0") + " jobs"
                )}</p>
                <p class="small text-muted mb-0">${escapeHtml(
                  cat.description || ""
                )}</p>
              </div>
            </article>
          </a>
        `;
        row.appendChild(col);
      });

      item.appendChild(row);
      container.appendChild(item);
    });

    // Update carousel indicators to match number of slides
    const carousel = container.closest(".carousel");
    if (carousel) {
      const indicators = carousel.querySelector(".carousel-indicators");
      if (indicators) {
        indicators.innerHTML = slides
          .map(
            (_, i) =>
              `<button type="button" data-bs-target="#${
                carousel.id
              }" data-bs-slide-to="${i}" class="${
                i === 0 ? "active bg-warning" : "bg-warning"
              }" ${i === 0 ? 'aria-current="true"' : ""} aria-label="Slide ${
                i + 1
              }"></button>`
          )
          .join("");
      }
    }
  }

  function renderPopularJobs(containerRow, jobs, categories) {
    // Determine popular jobs: prefer jobs with tag 'Top 50', fallback to most recent
    let popular = jobs.filter(
      (j) => Array.isArray(j.tags) && j.tags.includes("Top 50")
    );
    if (popular.length === 0) {
      popular = jobs.slice(0, 4);
    } else {
      popular = popular.slice(0, 4);
    }

    // Clear existing
    containerRow.innerHTML = "";

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    popular.forEach((job) => {
      const col = document.createElement("article");
      col.className = "col-md-6";
      const basePath = getBasePath();
      col.innerHTML = `
        <div class="card border rounded-4 shadow-sm position-relative" data-job-id="${escapeHtml(
          job.id
        )}" data-title="${escapeHtml(
        job.title || ""
      )}" data-company="${escapeHtml(
        job.company || ""
      )}" data-location="${escapeHtml(job.location || "")}">
          <div class="card-body p-4">
            <header class="d-flex align-items-start justify-content-between mb-3">
              <h3 class="h5 fw-bold mb-0 job-title">${escapeHtml(
                job.title || ""
              )}</h3>
              <button class="btn btn-outline-dark rounded-circle p-2" aria-label="Save job"
                style="width: 36px; height: 36px;"> 
                <img src="assets/images/heart.svg" alt="" width="18" height="18" />
              </button>
            </header>
            <p class="text-muted mb-3">by <strong class="company">${escapeHtml(
              job.company || ""
            )}</strong> in <a href="#" class="badge bg-warning text-dark rounded-pill text-decoration-none category-badge">${escapeHtml(
        getCategoryName(job.category, categoryMap)
      )}</a></p>
            <div class="d-flex flex-wrap gap-2 mb-3">
              ${job.tags
                .map(
                  (t) =>
                    `<span class="badge bg-light text-dark border rounded-pill">${escapeHtml(
                      t
                    )}</span>`
                )
                .join("")}
              <span class="badge bg-light text-dark border rounded-pill">${escapeHtml(
                job.location || ""
              )}</span>
              <span class="badge bg-light text-dark border rounded-pill">${escapeHtml(
                job.salary || ""
              )}</span>
            </div>
            <p class="text-warning small mb-0">${escapeHtml(
              job.deadline || ""
            )}</p>
            <a class="stretched-link" href="${basePath}job-listing/job-listing.html?id=${encodeURIComponent(
        job.id
      )}" aria-label="View job ${escapeHtml(job.title || "")}"></a>
          </div>
        </div>
      `;

      containerRow.appendChild(col);
    });
  }

  function getCategoryName(categoryId, categoryMap) {
    if (!categoryId) return "Other";
    return (
      categoryMap.get(categoryId) ||
      categoryId.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  function setupSearchAutocomplete(form, jobs /*, categories */) {
    const searchInput = form.querySelector(
      'input[type="search"], input[type="text"]'
    );
    if (!searchInput) return;

    // Build suggestions from jobs JSON (job titles only to keep it focused)
    const titles = Array.from(
      new Set((jobs || []).map((j) => j && j.title).filter(Boolean))
    );

    // Ensure the input wrapper is positioned for absolute dropdown
    const wrapper =
      searchInput.closest(".d-flex.align-items-center") ||
      searchInput.parentElement;
    if (wrapper && !wrapper.style.position) {
      wrapper.style.position = "relative";
    }

    // Create custom suggestion dropdown
    let box = wrapper.querySelector(".index-suggest-list");
    if (!box) {
      box = document.createElement("div");
      box.className = "index-suggest-list";
      box.setAttribute("role", "listbox");
      box.style.cssText =
        "position:absolute; top:100%; left:0; right:0; background:#fff; border:1px solid #e5e7eb; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,.08); z-index:1050; max-height:260px; overflow:auto; margin-top:6px; display:none;";
      wrapper.appendChild(box);
    }

    const showBox = () => (box.style.display = "block");
    const hideBox = () => (box.style.display = "none");

    const renderMatches = (query) => {
      const q = (query || "").trim().toLowerCase();
      if (!q) {
        hideBox();
        box.innerHTML = "";
        return;
      }
      const matches = titles
        .filter((t) => t.toLowerCase().includes(q))
        .slice(0, 8);

      if (matches.length === 0) {
        hideBox();
        box.innerHTML = "";
        return;
      }

      box.innerHTML = matches
        .map(
          (m) =>
            `<button type="button" role="option" class="list-group-item list-group-item-action" style="border:0; background:none; width:100%; text-align:left; padding:10px 14px;">${escapeHtml(
              m
            )}</button>`
        )
        .join("");
      showBox();
    };

    // Input filtering (debounced for snappy UX)
    const onInput = (e) => renderMatches(e.target.value);
    const debounced =
      window.Utils && Utils.debounce ? Utils.debounce(onInput, 120) : onInput;
    searchInput.addEventListener("input", debounced);

    // Click on a suggestion fills the input
    box.addEventListener("click", (e) => {
      const btn = e.target.closest("button[role='option']");
      if (!btn) return;
      searchInput.value = btn.textContent.trim();
      hideBox();
      // Do not auto-submit; user can press Search or Enter
      searchInput.focus();
    });

    // Hide dropdown on blur (with small delay so click can register)
    searchInput.addEventListener("blur", () => setTimeout(hideBox, 120));
    searchInput.addEventListener("focus", () => {
      if (searchInput.value) renderMatches(searchInput.value);
    });

    // Prevent native datalist from showing (in case of residual attributes)
    searchInput.removeAttribute("list");
  }

  /**
   * Setup form submission to redirect to job listing page with search parameter
   */
  function setupSearchFormRedirect(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const searchInput = this.querySelector(
        'input[type="search"], input[placeholder*="Jobs title"], input[placeholder*="keywords"]'
      );

      if (!searchInput) return;

      const searchValue = searchInput.value.trim();

      if (!searchValue) {
        // Show error or just do nothing
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Redirect to job listing page with search parameter
      const jobListingUrl = new URL(
        "job-listing/job-listing.html",
        window.location.origin + window.location.pathname.replace(/[^/]*$/, "")
      );
      jobListingUrl.searchParams.set("search", searchValue);

      window.location.href = jobListingUrl.toString();
    });
  }

  function setupDynamicSaveButtons(containerRow) {
    containerRow.addEventListener("click", function (e) {
      const btn = e.target.closest('.btn[aria-label="Save job"]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      try {
        if (!window.StorageManager || !window.StorageManager.isLoggedIn()) {
          alert("Please login to save jobs");
          window.location.href = "login/login.html";
          return;
        }
      } catch (_) {}

      const card = btn.closest(".card");
      if (!card) return;
      const id =
        card.getAttribute("data-job-id") ||
        generateJobId(
          card.getAttribute("data-title"),
          card.getAttribute("data-company")
        );
      const title =
        card.getAttribute("data-title") ||
        (card.querySelector(".job-title")?.textContent || "").trim();
      const company =
        card.getAttribute("data-company") ||
        (card.querySelector(".company")?.textContent || "").trim();
      const location = card.getAttribute("data-location") || "";

      const jobData = { id, title, company, location };

      const isActive =
        btn.classList.contains("active") || btn.classList.contains("loved");
      if (isActive) {
        const result = window.StorageManager.removeSavedJob(id);
        if (result?.success) {
          btn.classList.remove("active", "loved", "btn-danger");
          btn.classList.add("btn-outline-dark");
          showToast("Job removed from saved list");
        } else {
          showToast(result?.message || "Unable to remove job");
        }
      } else {
        const result = window.StorageManager.saveJob(jobData);
        if (result?.success) {
          btn.classList.add("active", "loved");
          btn.classList.remove("btn-outline-dark");
          btn.classList.add("btn-danger");
          showToast("Job saved! ❤️");
        } else {
          showToast(result?.message || "Unable to save job");
        }
      }
    });
  }

  function applySavedState(containerRow) {
    try {
      const saved =
        (window.StorageManager && window.StorageManager.getSavedJobs()) || [];
      containerRow.querySelectorAll(".card").forEach((card) => {
        const id =
          card.getAttribute("data-job-id") ||
          generateJobId(
            card.getAttribute("data-title"),
            card.getAttribute("data-company")
          );
        const isSaved = saved.some((j) => j.id === id);
        const btn = card.querySelector('.btn[aria-label="Save job"]');
        if (btn && isSaved) {
          btn.classList.add("active", "loved");
          btn.classList.remove("btn-outline-dark");
          btn.classList.add("btn-danger");
        }
      });
    } catch (_) {}
  }

  function generateJobId(title, company) {
    const str = (String(title) + String(company))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return str.substring(0, 20) + Date.now().toString().slice(-4);
  }

  function showToast(message) {
    if (typeof window.showToastMessage === "function") {
      window.showToastMessage(message);
    } else {
      console.log("📢", message);
    }
  }

  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes("/categories/") || path.includes("/job-listing/")) {
      return "../";
    }
    return "./";
  }

  // Basic HTML escape to avoid injecting raw JSON content
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  console.log("🧭 index-page script loaded");
})();
