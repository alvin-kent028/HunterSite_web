/**
 * Location Filter
 * Populates location dropdown from jobs.json
 * Note: The actual filtering is handled by job-filters.js
 */

(function () {
  "use strict";

  // Initialize location filter
  document.addEventListener("DOMContentLoaded", function () {
    // Wait a bit for JobFilterModule to load first
    setTimeout(initLocationFilter, 100);
  });

  async function initLocationFilter() {
    try {
      // Wait for JobFilterModule to be available
      if (!window.JobFilterModule) {
        console.warn("JobFilterModule not loaded yet, retrying...");
        setTimeout(initLocationFilter, 200);
        return;
      }

      // Get jobs from the JobFilterModule
      const jobs = window.JobFilterModule.getAllJobs();

      if (!jobs || jobs.length === 0) {
        console.warn("No jobs loaded yet, will try fetching from JSON...");
        // Fallback to fetching from JSON
        const response = await fetch("../assets/data/jobs.json");
        if (!response.ok) {
          throw new Error("Failed to load jobs data");
        }
        const data = await response.json();
        const jobsFromJson = data.jobs || [];

        // Extract unique locations
        const uniqueLocations = getUniqueLocations(jobsFromJson);

        // Populate dropdown
        populateLocationDropdown(uniqueLocations);
      } else {
        // Extract unique locations from loaded jobs
        const uniqueLocations = getUniqueLocations(jobs);

        // Populate dropdown
        populateLocationDropdown(uniqueLocations);
      }
    } catch (error) {
      console.error("Error loading location filter:", error);
    }
  }

  function getUniqueLocations(jobs) {
    const locations = new Set();

    jobs.forEach((job) => {
      if (job.location) {
        locations.add(job.location.trim());
      }
    });

    // Convert to sorted array
    return Array.from(locations).sort();
  }

  function populateLocationDropdown(locations) {
    const locationSelect = document.getElementById("locationFilter");
    if (!locationSelect) {
      console.warn("Location filter dropdown not found");
      return;
    }

    // Clear existing options except the first one (All Locations)
    while (locationSelect.options.length > 1) {
      locationSelect.remove(1);
    }

    // Add location options
    locations.forEach((location) => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });

    console.log(`📍 Loaded ${locations.length} unique locations`);
  }

  console.log("📍 Location filter loaded");
})();
