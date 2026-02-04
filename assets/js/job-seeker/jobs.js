/**
 * Job Management
 * Handles job saving, applications, and filtering
 */

(function () {
  "use strict";

  // Initialize jobs functionality
  document.addEventListener("DOMContentLoaded", function () {
    initJobs();
  });

  function initJobs() {
    // Check for URL search parameter and auto-fill search box
    handleUrlSearchParameter();

    // Setup save job buttons
    setupSaveButtons();

    // Setup apply buttons
    setupApplyButtons();

    // Load saved jobs state
    loadSavedJobsState();

    // Setup job search with history
    setupJobSearch();

    // Setup job filters
    setupJobFilters();
  }

  function setupSaveButtons() {
    const saveButtons = document.querySelectorAll(
      '.btn[aria-label="Save job"], .love'
    );

    saveButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Check if user is logged in
        if (!window.StorageManager.isLoggedIn()) {
          alert("Please login to save jobs");
          window.location.href = "../login/login.html";
          return;
        }

        const jobCard = this.closest(".card, .job-card");
        if (!jobCard) return;

        const jobData = extractJobData(jobCard);
        const isSaved =
          this.classList.contains("active") || this.classList.contains("loved");

        if (isSaved) {
          // Remove from saved
          const result = window.StorageManager.removeSavedJob(jobData.id);
          if (result.success) {
            this.classList.remove("active", "loved");
            this.classList.remove("btn-danger");
            this.classList.add("btn-outline-dark");
            showToast("Job removed from saved list");
          } else {
            showToast(result.message);
          }
        } else {
          // Save job
          const result = window.StorageManager.saveJob(jobData);
          if (result.success) {
            this.classList.add("active", "loved");
            this.classList.remove("btn-outline-dark");
            this.classList.add("btn-danger");
            showToast("Job saved! ❤️");
          } else {
            showToast(result.message);
          }
        }
      });
    });
  }

  function setupApplyButtons() {
    // Find all apply buttons
    const applyButtons = document.querySelectorAll(
      'button:not([aria-label="Save job"])'
    );

    applyButtons.forEach((button) => {
      const buttonText = button.textContent.toLowerCase();
      if (buttonText.includes("apply")) {
        button.addEventListener("click", function (e) {
          handleJobApplication(this, e);
        });
      }
    });
  }

  function handleJobApplication(button, event) {
    event.preventDefault();

    // Check if user is logged in
    if (!window.StorageManager.isLoggedIn()) {
      if (confirm("You need to login to apply for jobs. Go to login page?")) {
        window.location.href = "../login/login.html";
      }
      return;
    }

    const jobCard = button.closest(".card, .job-card");
    if (!jobCard) return;

    const jobData = extractJobData(jobCard);

    // Check if already applied
    if (window.StorageManager.hasAppliedToJob(jobData.id)) {
      alert("You have already applied to this job");
      button.textContent = "Applied ✓";
      button.disabled = true;
      button.classList.add("btn-success");
      return;
    }

    // Confirm application
    if (!confirm(`Apply for ${jobData.title} at ${jobData.company}?`)) {
      return;
    }

    // Save application
    const result = window.StorageManager.saveApplication(
      jobData.id,
      jobData.title,
      jobData.company
    );

    if (result.success) {
      button.textContent = "Applied ✓";
      button.disabled = true;
      button.classList.add("btn-success");
      showToast("Application submitted successfully!");
    } else {
      alert(result.message);
    }
  }

  function extractJobData(jobCard) {
    const titleElement = jobCard.querySelector("h3, .job-title");
    const companyElement = jobCard.querySelector(".company, .company a");
    const locationElement = jobCard.querySelector(".place, .location");

    const title = titleElement
      ? titleElement.textContent.trim()
      : "Unknown Job";
    const company = companyElement
      ? companyElement.textContent.trim()
      : "Unknown Company";
    const location = locationElement
      ? locationElement.textContent.trim()
      : "Unknown Location";

    // Generate a simple ID based on title and company
    const id = generateJobId(title, company);

    return {
      id: id,
      title: title,
      company: company,
      location: location,
    };
  }

  function generateJobId(title, company) {
    // Simple ID generation - in real app would come from backend
    const str = (title + company).toLowerCase().replace(/[^a-z0-9]/g, "");
    return str.substring(0, 20) + Date.now().toString().slice(-4);
  }

  function loadSavedJobsState() {
    const savedJobs = window.StorageManager.getSavedJobs();

    // Mark saved jobs
    document.querySelectorAll(".card, .job-card").forEach((card) => {
      const jobData = extractJobData(card);
      const isSaved = savedJobs.some((job) => job.id === jobData.id);

      if (isSaved) {
        const saveBtn = card.querySelector(
          '.btn[aria-label="Save job"], .love'
        );
        if (saveBtn) {
          saveBtn.classList.add("active", "loved");
          saveBtn.classList.remove("btn-outline-dark");
          saveBtn.classList.add("btn-danger");
        }
      }
    });

    // Mark applied jobs
    const applications = window.StorageManager.getUserApplications();

    document.querySelectorAll(".card, .job-card").forEach((card) => {
      const jobData = extractJobData(card);
      const hasApplied = applications.some((app) => app.jobId === jobData.id);

      if (hasApplied) {
        const applyBtn = card.querySelector("button");
        if (applyBtn && applyBtn.textContent.toLowerCase().includes("apply")) {
          applyBtn.textContent = "Applied ✓";
          applyBtn.disabled = true;
          applyBtn.classList.add("btn-success");
        }
      }
    });
  }

  function setupJobSearch() {
    const searchForm = document.querySelector(
      ".search-form, .search-strip form"
    );
    const searchButton = document.querySelector(".search-strip .search-btn");
    const searchInputInStrip = document.querySelector(
      '.search-strip input[type="text"]'
    );

    // Handle form submission if form exists
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const searchInput = this.querySelector(
          'input[type="search"], input[type="text"]'
        );
        const locationInput =
          this.querySelectorAll('input[type="text"]')[1] ||
          this.querySelectorAll("input")[1];

        const query = searchInput ? searchInput.value.trim() : "";
        const location = locationInput ? locationInput.value.trim() : "";

        // Validate
        if (!query) {
          showError(searchInput, "Please enter a job title or keyword");
          return;
        }

        // Save to search history
        window.StorageManager.addSearchHistory(query, location);

        // Show searching message
        showToast(
          `Searching for "${query}" in "${location || "All Locations"}"...`
        );

        // In a real app, this would filter the jobs
        filterJobsBySearch(query, location);
      });
    }

    // Handle search button click if button exists (for job-listing page)
    if (searchButton && searchInputInStrip) {
      searchButton.addEventListener("click", function (e) {
        e.preventDefault();

        // Clear all URL parameters when search is performed
        try {
          const url = new URL(window.location);
          url.search = "";
          window.history.replaceState({}, "", url);
        } catch (_) {}

        const query = searchInputInStrip.value.trim();
        const locationSelect = document.querySelector("#locationFilter");
        const location = locationSelect ? locationSelect.value : "";

        // Validate
        if (!query) {
          searchInputInStrip.focus();
          showToast("Please enter a job title or keyword");
          return;
        }

        // Save to search history
        if (window.StorageManager && window.StorageManager.addSearchHistory) {
          window.StorageManager.addSearchHistory(query, location);
        }

        // Show searching message
        showToast(
          `Searching for "${query}" in "${location || "All Locations"}"...`
        );

        // Filter the jobs
        filterJobsBySearch(query, location);
      });

      // Also allow Enter key to trigger search
      searchInputInStrip.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();

          // Clear all URL parameters
          try {
            const url = new URL(window.location);
            url.search = "";
            window.history.replaceState({}, "", url);
          } catch (_) {}

          searchButton.click();
        }
      });
    }
  }

  function filterJobsBySearch(query, location) {
    const jobCards = document.querySelectorAll(".card, .job-card");
    let foundCount = 0;

    jobCards.forEach((card) => {
      const jobData = extractJobData(card);
      const matchesQuery =
        jobData.title.toLowerCase().includes(query.toLowerCase()) ||
        jobData.company.toLowerCase().includes(query.toLowerCase());
      const matchesLocation =
        !location ||
        jobData.location.toLowerCase().includes(location.toLowerCase());

      if (matchesQuery && matchesLocation) {
        card.style.display = "";
        foundCount++;
      } else {
        card.style.display = "none";
      }
    });

    // Show result count
    setTimeout(() => {
      showToast(`Found ${foundCount} job(s)`);
    }, 500);
  }

  /**
   * Handle URL search parameter on page load
   * Reads ?search=value from URL, fills search box, and filters jobs
   */
  function handleUrlSearchParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");

    if (!searchParam) return;

    // Find the search input on the page
    const searchInput = document.querySelector(
      '.search-strip input[type="text"]'
    );

    if (searchInput) {
      // Fill the search box with the parameter value
      searchInput.value = searchParam;

      // Trigger the filter to show results
      filterJobsBySearch(searchParam, "");

      // Save to search history
      if (window.StorageManager && window.StorageManager.addSearchHistory) {
        window.StorageManager.addSearchHistory(searchParam, "");
      }
    }
  }

  function setupJobFilters() {
    const filterButtons = document.querySelectorAll(
      ".filter, .chip, .filter-quick"
    );

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const filterText = this.textContent.trim().toLowerCase();

        // Toggle active state
        this.classList.toggle("active");

        // Apply filter
        applyJobFilter(filterText);
      });
    });
  }

  function applyJobFilter(filterText) {
    // Simple filter - in real app would be more sophisticated
    const jobCards = document.querySelectorAll(".card, .job-card");

    jobCards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const matches = cardText.includes(filterText);

      if (matches) {
        card.style.opacity = "1";
      } else {
        card.style.opacity = "0.3";
      }
    });

    showToast(`Filtering by: ${filterText}`);
  }

  // Helper function to show error
  function showError(input, message) {
    input.classList.add("border-danger");
    input.focus();
    showToast(message);
    setTimeout(() => {
      input.classList.remove("border-danger");
    }, 2000);
  }

  // Helper function to show toast
  function showToast(message) {
    // Check if there's a global toast function from main.js
    if (typeof window.showToastMessage === "function") {
      window.showToastMessage(message);
    } else {
      // Fallback to console log
      console.log("📢", message);
    }
  }

  console.log("💼 Job management loaded");
})();
