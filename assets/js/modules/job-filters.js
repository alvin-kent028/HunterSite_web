/**
 * Job Listing Page Filters
 * Handles all filtering interactions on the job listing page
 */

(function () {
  "use strict";

  const activeFilters = {};
  let searchQuery = "";
  let locationQuery = "";

  /**
   * Clear all URL search parameters
   */
  function clearAllUrlParams() {
    try {
      const url = new URL(window.location);
      // Clear all search parameters
      url.search = "";
      window.history.replaceState({}, "", url);
    } catch (error) {
      console.error("Error clearing URL params:", error);
    }
  }

  /**
   * Initialize all filter event listeners
   */
  function init() {
    // Only run on job listing page
    if (!window.location.pathname.includes("job-listing")) {
      return;
    }

    // Wait for JobFilterModule to be available
    if (!window.JobFilterModule) {
      console.error("JobFilterModule not loaded");
      return;
    }

    initDropdownFilters();
    initSearchFilters();
    initQuickFilterChips();
    initClearFiltersButton();

    console.log("🔍 Job filters UI initialized");
  }

  /**
   * Initialize dropdown filter event listeners
   */
  function initDropdownFilters() {
    const clearFiltersBtn = document.getElementById("clearFilters");

    document
      .querySelectorAll(".dropdown-menu .dropdown-item")
      .forEach((item) => {
        item.addEventListener("click", function (e) {
          e.preventDefault();

          // Clear all URL parameters when any filter is changed
          clearAllUrlParams();

          const filterType = this.dataset.filter;
          const filterValue = this.dataset.value;
          const dropdownButton =
            this.closest(".dropdown").querySelector(".dropdown-toggle");

          // Special handling for Job Function (category) filter
          if (filterType === "function") {
            if (filterValue === "") {
              // Clear category
              delete activeFilters[filterType];
              dropdownButton.textContent =
                dropdownButton.textContent.split(" (")[0];
            } else {
              activeFilters[filterType] = filterValue;
              const originalText = dropdownButton.textContent.split(" (")[0];
              dropdownButton.textContent = `${originalText} (${this.textContent.trim()})`;
            }
          } else {
            // Handle other filters normally
            if (filterValue === "") {
              delete activeFilters[filterType];
              dropdownButton.textContent =
                dropdownButton.textContent.split(" (")[0];
            } else {
              activeFilters[filterType] = filterValue;
              const originalText = dropdownButton.textContent.split(" (")[0];
              dropdownButton.textContent = `${originalText} (${this.textContent.trim()})`;
            }
          }

          // Show/hide clear filters button
          updateClearButtonVisibility();

          // Apply filters
          applyAllFilters();

          // Add active state to selected item
          this.closest(".dropdown-menu")
            .querySelectorAll(".dropdown-item")
            .forEach((i) => {
              i.classList.remove("active");
            });
          this.classList.add("active");
        });
      });
  }

  /**
   * Initialize search input filters (job title/company and location)
   */
  function initSearchFilters() {
    // Job title/company search
    const searchInput = document.querySelector(
      '.search-input-wrapper input[placeholder*="job title"]'
    );
    const searchButton = document.querySelector(".search-btn");

    if (searchInput && searchButton) {
      // Search on button click
      searchButton.addEventListener("click", function () {
        // Clear all URL parameters when search is performed
        clearAllUrlParams();

        searchQuery = searchInput.value.trim().toLowerCase();
        applyAllFilters();
      });

      // Search on Enter key
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          // Clear all URL parameters when search is performed
          clearAllUrlParams();

          searchQuery = searchInput.value.trim().toLowerCase();
          applyAllFilters();
        }
      });

      // Real-time search (optional - remove if you prefer button-only)
      searchInput.addEventListener("input", function () {
        searchQuery = this.value.trim().toLowerCase();
        // Debounce for performance
        clearTimeout(searchInput.searchTimeout);
        searchInput.searchTimeout = setTimeout(() => {
          // Clear all URL parameters when search is performed
          clearAllUrlParams();
          applyAllFilters();
        }, 300);
      });
    }

    // Location dropdown filter
    const locationSelect = document.getElementById("locationFilter");

    if (locationSelect) {
      locationSelect.addEventListener("change", function () {
        // Clear all URL parameters when location is changed
        clearAllUrlParams();

        locationQuery = this.value;

        // Update clear button visibility
        updateClearButtonVisibility();

        // Apply all filters
        applyAllFilters();
      });
    }

    // Legacy location input (if still exists)
    const locationInput = document.querySelector(
      '.search-input-wrapper input[placeholder="Location"]'
    );

    if (locationInput) {
      // Real-time location filter
      locationInput.addEventListener("input", function () {
        locationQuery = this.value.trim().toLowerCase();
        // Debounce for performance
        clearTimeout(locationInput.searchTimeout);
        locationInput.searchTimeout = setTimeout(() => {
          applyAllFilters();
        }, 300);
      });

      // Location search on Enter
      locationInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          locationQuery = this.value.trim().toLowerCase();
          applyAllFilters();
        }
      });
    }
  }

  /**
   * Initialize quick filter chip buttons
   */
  function initQuickFilterChips() {
    const chips = document.querySelectorAll(".chips .chip");

    chips.forEach((chip) => {
      chip.addEventListener("click", function () {
        // Clear all URL parameters when chip is clicked
        clearAllUrlParams();

        const chipText = this.textContent.trim();
        const wasActive = this.classList.contains("active");

        // Deactivate all chips first (radio button behavior)
        chips.forEach((c) => c.classList.remove("active"));

        // Clear chip-related filters
        delete activeFilters.tags;
        delete activeFilters.chipLevel; // Use separate key for chip level filter

        // If this chip wasn't active, activate it and apply filter
        if (!wasActive) {
          this.classList.add("active");

          // Map chip text to filter values
          switch (chipText) {
            case "Remote Work":
              if (!activeFilters.tags) {
                activeFilters.tags = [];
              }
              activeFilters.tags.push("Remote");
              break;
            case "Hybrid":
              if (!activeFilters.tags) {
                activeFilters.tags = [];
              }
              activeFilters.tags.push("Hybrid");
              break;
            case "Fresh Grad":
              activeFilters.chipLevel = "entry"; // Use separate key to avoid conflict with dropdown
              break;
          }
        }

        // Show/hide clear filters button
        updateClearButtonVisibility();

        // Apply filters
        applyAllFilters();
      });
    });
  }

  /**
   * Initialize clear all filters button
   */
  function initClearFiltersButton() {
    const clearFiltersBtn = document.getElementById("clearFilters");

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", function () {
        // Clear all URL parameters
        clearAllUrlParams();

        // Reset all filters
        Object.keys(activeFilters).forEach((key) => delete activeFilters[key]);
        searchQuery = "";
        locationQuery = "";

        // Reset search inputs
        const searchInput = document.querySelector(
          '.search-input-wrapper input[placeholder*="job title"]'
        );
        const locationInput = document.querySelector(
          '.search-input-wrapper input[placeholder="Location"]'
        );
        if (searchInput) searchInput.value = "";
        if (locationInput) locationInput.value = "";

        // Reset location dropdown
        const locationSelect = document.getElementById("locationFilter");
        if (locationSelect) locationSelect.value = "";

        // Reset dropdown button texts
        document.querySelectorAll(".dropdown-toggle").forEach((btn) => {
          btn.textContent = btn.textContent.split(" (")[0];
        });

        // Remove active states from dropdown items
        document.querySelectorAll(".dropdown-item").forEach((item) => {
          item.classList.remove("active");
        });

        // Remove active states from chips
        document.querySelectorAll(".chips .chip").forEach((chip) => {
          chip.classList.remove("active");
        });

        // Hide clear button
        this.style.display = "none";

        // Show all jobs (respecting category if present)
        applyAllFilters();

        console.log("All filters cleared");
      });
    }
  }

  /**
   * Apply all active filters including search and location
   */
  function applyAllFilters() {
    // If user is interacting with filters, ensure any deep-link id param is removed
    clearIdParamFromUrl();

    // Get all jobs
    let allJobs = window.JobFilterModule.getAllJobs();

    // Get category from URL (updated by Job Function dropdown or initial page load)
    const urlParams = new URLSearchParams(window.location.search);
    const urlCategory = urlParams.get("category");

    // Start with all jobs in current category (or all jobs if no category)
    if (urlCategory) {
      allJobs = allJobs.filter((job) => job.category === urlCategory);
    }

    // Apply dropdown and chip filters
    let filtered = applyDropdownFilters(allJobs);

    // Apply search query (job title or company)
    if (searchQuery) {
      filtered = filtered.filter((job) => {
        const titleMatch = job.title.toLowerCase().includes(searchQuery);
        const companyMatch = job.company.toLowerCase().includes(searchQuery);
        return titleMatch || companyMatch;
      });
    }

    // Apply location query
    if (locationQuery) {
      filtered = filtered.filter((job) => {
        // Exact match for dropdown (full location string)
        // or substring match for typed input (legacy support)
        return (
          job.location === locationQuery ||
          job.location.toLowerCase().includes(locationQuery.toLowerCase())
        );
      });
    }

    // Display ONLY the filtered jobs (others are not rendered at all)
    window.JobFilterModule.displayJobs(filtered);

    // Log results for debugging
    console.log("🔍 Filter Results:");
    console.log("  Category from URL:", urlCategory || "All");
    console.log("  Total jobs in category:", allJobs.length);
    console.log("  Matching jobs after filters:", filtered.length);
    console.log("  Active filters:", activeFilters);
    if (searchQuery) console.log("  Search:", searchQuery);
    if (locationQuery) console.log("  Location:", locationQuery);

    return filtered.length;
  }

  /**
   * Remove the `id` search param from the URL if present
   * Called when any filter is applied to follow normal browsing workflow
   */
  function clearIdParamFromUrl() {
    try {
      const url = new URL(window.location);
      if (url.searchParams.has("id")) {
        url.searchParams.delete("id");
        window.history.replaceState({}, "", url);
      }
    } catch (e) {
      // no-op if URL API not available
    }
  }

  /**
   * Apply dropdown and chip filters to jobs array
   */
  function applyDropdownFilters(jobs) {
    let filtered = jobs;

    Object.keys(activeFilters).forEach((filterType) => {
      const filterValue = activeFilters[filterType];

      if (filterType === "tags") {
        // Handle tag array filters (for chips)
        if (Array.isArray(filterValue)) {
          filterValue.forEach((tagValue) => {
            filtered = filtered.filter((job) =>
              job.tags.some((tag) => tag.includes(tagValue))
            );
          });
        }
      } else {
        // Handle single value filters
        filtered = filtered.filter((job) => {
          switch (filterType) {
            case "level":
              return job.level === filterValue;
            case "chipLevel":
              // Special handling for chip level filter (Fresh Grad)
              return job.level === filterValue;
            case "type":
              return job.type === filterValue;
            case "function":
              return job.category === filterValue;
            case "education":
              return job.education === filterValue;
            case "company":
              const jobCompany = job.company
                .toLowerCase()
                .replace(/[.\s]/g, "");
              return jobCompany.includes(filterValue.toLowerCase());
            case "salary":
              return job.salary === filterValue;
            default:
              return true;
          }
        });
      }
    });

    return filtered;
  }

  /**
   * Update visibility of clear filters button
   */
  function updateClearButtonVisibility() {
    const clearFiltersBtn = document.getElementById("clearFilters");
    const hasFilters =
      Object.keys(activeFilters).length > 0 ||
      searchQuery !== "" ||
      locationQuery !== "";

    if (clearFiltersBtn) {
      clearFiltersBtn.style.display = hasFilters ? "inline-block" : "none";
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for debugging
  window.JobFiltersUI = {
    getActiveFilters: () => activeFilters,
    getSearchQuery: () => searchQuery,
    getLocationQuery: () => locationQuery,
    applyAllFilters: applyAllFilters,
  };
})();
