/**
 * Category and Job Filtering Module
 * Handles loading jobs from JSON, filtering by category, and displaying results
 */

(function () {
  "use strict";

  // Embedded data for local file support
  const jobsData = {
    categories: [
      {
        id: "it-software",
        name: "IT & Software",
        description: "Technology and software development roles",
        icon: "💻",
        jobCount: 8,
      },
      {
        id: "engineering",
        name: "Engineering",
        description: "Engineering and technical positions",
        icon: "⚙️",
        jobCount: 5,
      },
      {
        id: "design",
        name: "Design",
        description: "Creative and design opportunities",
        icon: "🎨",
        jobCount: 4,
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Marketing and advertising roles",
        icon: "📢",
        jobCount: 6,
      },
      {
        id: "sales",
        name: "Sales",
        description: "Sales and business development",
        icon: "💼",
        jobCount: 5,
      },
      {
        id: "finance",
        name: "Finance",
        description: "Finance and accounting positions",
        icon: "💰",
        jobCount: 4,
      },
    ],
    jobs: [
      {
        id: 1,
        title: "Senior Full Stack Developer",
        company: "LeapFroggr Inc.",
        location: "Manila, Philippines",
        type: "full-time",
        level: "senior",
        category: "it-software",
        salary: "80k+",
        education: "bachelor",
        tags: ["Remote", "Top 50"],
        posted: "2 weeks ago",
        deadline: "Dec 15, 2025",
        description:
          "We are looking for a Senior Full Stack Developer to join our growing team.",
        responsibilities: [
          "Develop and maintain web applications using React and Node.js",
          "Collaborate with cross-functional teams",
          "Mentor junior developers",
        ],
        saved: false,
      },
      {
        id: 2,
        title: "Solutions Engineer",
        company: "AboitizPower",
        location: "Makati, Philippines",
        type: "full-time",
        level: "senior",
        category: "it-software",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Hybrid", "Top 50"],
        posted: "1 month ago",
        deadline: "Jan 13, 2026",
        description:
          "Join our team as a Solutions Engineer to design innovative solutions.",
        responsibilities: [
          "Design technical solutions for client requirements",
          "Provide technical support and guidance",
          "Work with engineering teams",
        ],
        saved: true,
      },
      {
        id: 3,
        title: "Apple iOS Developer",
        company: "LeapFroggr Inc.",
        location: "Manila, Philippines",
        type: "full-time",
        level: "mid",
        category: "it-software",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "9 months ago",
        deadline: "Jan 6, 2026",
        description:
          "Develop B2B and B2C iOS applications for iPhone and iPad.",
        responsibilities: [
          "Collaborate closely with product and design to ship features on time",
          "Write modern, scalable Swift with a focus on performance and UX",
          "Maintain quality with code reviews, testing, and documentation",
        ],
        saved: false,
      },
      {
        id: 4,
        title: "Android Developer",
        company: "LeapFroggr Inc.",
        location: "Manila, Philippines",
        type: "full-time",
        level: "mid",
        category: "it-software",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "9 months ago",
        deadline: "Jan 6, 2026",
        description:
          "Build native Android applications with modern development practices.",
        responsibilities: [
          "Develop Android applications using Kotlin",
          "Implement Material Design guidelines",
          "Collaborate with backend developers",
        ],
        saved: false,
      },
      {
        id: 5,
        title: "Data Engineer",
        company: "LeapFroggr Inc.",
        location: "Manila, Philippines",
        type: "full-time",
        level: "mid",
        category: "it-software",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "9 months ago",
        deadline: "Jan 6, 2026",
        description: "Design and build data pipelines and infrastructure.",
        responsibilities: [
          "Build and maintain data pipelines",
          "Optimize database performance",
          "Work with data science team",
        ],
        saved: false,
      },
      {
        id: 6,
        title: "Frontend Developer",
        company: "Serious MD",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "entry",
        category: "it-software",
        salary: "20k-40k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "1 week ago",
        deadline: "Dec 30, 2025",
        description:
          "Join our team to build beautiful and responsive web interfaces.",
        responsibilities: [
          "Develop responsive web pages using HTML, CSS, JavaScript",
          "Work with React and modern frameworks",
          "Collaborate with designers",
        ],
        saved: false,
      },
      {
        id: 7,
        title: "DevOps Engineer",
        company: "AboitizPower",
        location: "Makati, Philippines",
        type: "full-time",
        level: "senior",
        category: "it-software",
        salary: "80k+",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "2 weeks ago",
        deadline: "Jan 15, 2026",
        description:
          "Manage and automate our infrastructure and deployment processes.",
        responsibilities: [
          "Manage CI/CD pipelines",
          "Automate infrastructure with Terraform",
          "Monitor system performance",
        ],
        saved: false,
      },
      {
        id: 8,
        title: "Cloud Architect",
        company: "TechCorp Solutions",
        location: "BGC, Taguig, Philippines",
        type: "full-time",
        level: "lead",
        category: "it-software",
        salary: "80k+",
        education: "master",
        tags: ["Remote", "Top 50"],
        posted: "3 days ago",
        deadline: "Jan 20, 2026",
        description: "Design and implement cloud infrastructure solutions.",
        responsibilities: [
          "Design cloud architecture on AWS/Azure",
          "Lead cloud migration projects",
          "Ensure security and compliance",
        ],
        saved: false,
      },
      {
        id: 9,
        title: "Mechanical Engineer",
        company: "BuildTech Industries",
        location: "Cavite, Philippines",
        type: "full-time",
        level: "mid",
        category: "engineering",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Onsite"],
        posted: "1 week ago",
        deadline: "Jan 10, 2026",
        description: "Design and develop mechanical systems for manufacturing.",
        responsibilities: [
          "Design mechanical components and systems",
          "Perform CAD modeling and simulations",
          "Collaborate with production teams",
        ],
        saved: false,
      },
      {
        id: 10,
        title: "Electrical Engineer",
        company: "PowerGrid Corp",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "senior",
        category: "engineering",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "2 weeks ago",
        deadline: "Dec 28, 2025",
        description: "Oversee electrical system design and implementation.",
        responsibilities: [
          "Design electrical systems and circuits",
          "Ensure compliance with safety standards",
          "Supervise installation teams",
        ],
        saved: false,
      },
      {
        id: 11,
        title: "Civil Engineer",
        company: "Mega Construction",
        location: "Makati, Philippines",
        type: "full-time",
        level: "mid",
        category: "engineering",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Onsite"],
        posted: "5 days ago",
        deadline: "Jan 5, 2026",
        description: "Plan and oversee construction projects.",
        responsibilities: [
          "Design infrastructure projects",
          "Manage construction sites",
          "Coordinate with contractors",
        ],
        saved: false,
      },
      {
        id: 12,
        title: "Quality Assurance Engineer",
        company: "ManufacturePro",
        location: "Laguna, Philippines",
        type: "full-time",
        level: "entry",
        category: "engineering",
        salary: "20k-40k",
        education: "associate",
        tags: ["Onsite"],
        posted: "1 week ago",
        deadline: "Dec 25, 2025",
        description: "Ensure product quality through testing and inspection.",
        responsibilities: [
          "Perform quality inspections",
          "Document quality metrics",
          "Implement quality improvement processes",
        ],
        saved: false,
      },
      {
        id: 13,
        title: "Process Engineer",
        company: "ChemTech Industries",
        location: "Batangas, Philippines",
        type: "full-time",
        level: "senior",
        category: "engineering",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Onsite"],
        posted: "3 weeks ago",
        deadline: "Jan 8, 2026",
        description: "Optimize manufacturing processes and efficiency.",
        responsibilities: [
          "Analyze and improve production processes",
          "Reduce waste and increase efficiency",
          "Train production staff",
        ],
        saved: false,
      },
      {
        id: 14,
        title: "UI/UX Designer",
        company: "DesignHub Studios",
        location: "Makati, Philippines",
        type: "full-time",
        level: "mid",
        category: "design",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "1 week ago",
        deadline: "Dec 20, 2025",
        description: "Create beautiful and intuitive user interfaces.",
        responsibilities: [
          "Design user interfaces for web and mobile",
          "Create wireframes and prototypes",
          "Conduct user research",
        ],
        saved: false,
      },
      {
        id: 15,
        title: "Graphic Designer",
        company: "Creative Solutions",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "entry",
        category: "design",
        salary: "20k-40k",
        education: "associate",
        tags: ["Remote"],
        posted: "4 days ago",
        deadline: "Jan 2, 2026",
        description: "Design marketing materials and brand assets.",
        responsibilities: [
          "Create visual designs for marketing campaigns",
          "Design logos and brand identities",
          "Collaborate with marketing team",
        ],
        saved: false,
      },
      {
        id: 16,
        title: "Motion Graphics Designer",
        company: "VideoWorks Media",
        location: "Manila, Philippines",
        type: "freelance",
        level: "mid",
        category: "design",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "2 weeks ago",
        deadline: "Jan 12, 2026",
        description: "Create engaging motion graphics and animations.",
        responsibilities: [
          "Design motion graphics for videos",
          "Create animations using After Effects",
          "Collaborate with video production team",
        ],
        saved: false,
      },
      {
        id: 17,
        title: "Product Designer",
        company: "TechStartup Inc",
        location: "BGC, Taguig, Philippines",
        type: "full-time",
        level: "senior",
        category: "design",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Hybrid", "Top 50"],
        posted: "5 days ago",
        deadline: "Dec 18, 2025",
        description: "Lead product design and strategy.",
        responsibilities: [
          "Define product vision and strategy",
          "Design end-to-end user experiences",
          "Lead design team",
        ],
        saved: false,
      },
      {
        id: 18,
        title: "Digital Marketing Specialist",
        company: "MarketPro Agency",
        location: "Makati, Philippines",
        type: "full-time",
        level: "mid",
        category: "marketing",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "1 week ago",
        deadline: "Dec 22, 2025",
        description: "Execute digital marketing campaigns across channels.",
        responsibilities: [
          "Manage social media campaigns",
          "Analyze marketing metrics",
          "Create content strategies",
        ],
        saved: false,
      },
      {
        id: 19,
        title: "Content Marketing Manager",
        company: "ContentCraft",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "senior",
        category: "marketing",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "3 days ago",
        deadline: "Jan 15, 2026",
        description: "Lead content marketing strategy and execution.",
        responsibilities: [
          "Develop content marketing strategies",
          "Manage content creation team",
          "Measure content performance",
        ],
        saved: false,
      },
      {
        id: 20,
        title: "SEO Specialist",
        company: "SearchMasters",
        location: "Manila, Philippines",
        type: "full-time",
        level: "mid",
        category: "marketing",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "2 weeks ago",
        deadline: "Jan 10, 2026",
        description: "Optimize websites for search engines.",
        responsibilities: [
          "Conduct keyword research",
          "Optimize website content",
          "Build backlink strategies",
        ],
        saved: false,
      },
      {
        id: 21,
        title: "Brand Manager",
        company: "BrandBuilders Inc",
        location: "BGC, Taguig, Philippines",
        type: "full-time",
        level: "senior",
        category: "marketing",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Hybrid", "Top 50"],
        posted: "1 week ago",
        deadline: "Dec 30, 2025",
        description: "Manage brand strategy and positioning.",
        responsibilities: [
          "Develop brand strategies",
          "Manage brand campaigns",
          "Analyze brand performance",
        ],
        saved: false,
      },
      {
        id: 22,
        title: "Social Media Manager",
        company: "SocialBuzz",
        location: "Makati, Philippines",
        type: "full-time",
        level: "entry",
        category: "marketing",
        salary: "20k-40k",
        education: "associate",
        tags: ["Hybrid"],
        posted: "5 days ago",
        deadline: "Jan 5, 2026",
        description: "Manage social media presence and engagement.",
        responsibilities: [
          "Create social media content",
          "Engage with followers",
          "Track social media metrics",
        ],
        saved: false,
      },
      {
        id: 23,
        title: "Email Marketing Specialist",
        company: "MailGenius",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "mid",
        category: "marketing",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Remote"],
        posted: "1 week ago",
        deadline: "Jan 8, 2026",
        description: "Design and execute email marketing campaigns.",
        responsibilities: [
          "Create email campaigns",
          "Segment email lists",
          "Analyze email performance",
        ],
        saved: false,
      },
      {
        id: 24,
        title: "Sales Executive",
        company: "SalesPro Corp",
        location: "Makati, Philippines",
        type: "full-time",
        level: "mid",
        category: "sales",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "3 days ago",
        deadline: "Dec 28, 2025",
        description: "Drive sales and build client relationships.",
        responsibilities: [
          "Generate new leads",
          "Close sales deals",
          "Maintain client relationships",
        ],
        saved: false,
      },
      {
        id: 25,
        title: "Business Development Manager",
        company: "GrowthPartners",
        location: "BGC, Taguig, Philippines",
        type: "full-time",
        level: "senior",
        category: "sales",
        salary: "80k+",
        education: "master",
        tags: ["Hybrid", "Top 50"],
        posted: "1 week ago",
        deadline: "Jan 12, 2026",
        description: "Identify and pursue new business opportunities.",
        responsibilities: [
          "Develop business strategies",
          "Build partnerships",
          "Negotiate contracts",
        ],
        saved: false,
      },
      {
        id: 26,
        title: "Account Manager",
        company: "ClientFirst Solutions",
        location: "Manila, Philippines",
        type: "full-time",
        level: "mid",
        category: "sales",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "2 weeks ago",
        deadline: "Jan 5, 2026",
        description: "Manage client accounts and ensure satisfaction.",
        responsibilities: [
          "Manage client relationships",
          "Upsell products and services",
          "Resolve client issues",
        ],
        saved: false,
      },
      {
        id: 27,
        title: "Sales Associate",
        company: "RetailMax",
        location: "Quezon City, Philippines",
        type: "full-time",
        level: "entry",
        category: "sales",
        salary: "20k-40k",
        education: "associate",
        tags: ["Onsite"],
        posted: "4 days ago",
        deadline: "Dec 25, 2025",
        description: "Assist customers and drive retail sales.",
        responsibilities: [
          "Assist customers with purchases",
          "Maintain store appearance",
          "Process transactions",
        ],
        saved: false,
      },
      {
        id: 28,
        title: "Inside Sales Representative",
        company: "TechSales Inc",
        location: "Makati, Philippines",
        type: "full-time",
        level: "entry",
        category: "sales",
        salary: "20k-40k",
        education: "associate",
        tags: ["Remote"],
        posted: "1 week ago",
        deadline: "Jan 3, 2026",
        description: "Generate leads and close sales remotely.",
        responsibilities: [
          "Make outbound sales calls",
          "Qualify leads",
          "Demo products",
        ],
        saved: false,
      },
      {
        id: 29,
        title: "Financial Analyst",
        company: "FinanceHub Corp",
        location: "BGC, Taguig, Philippines",
        type: "full-time",
        level: "mid",
        category: "finance",
        salary: "60k-80k",
        education: "bachelor",
        tags: ["Hybrid"],
        posted: "1 week ago",
        deadline: "Jan 10, 2026",
        description: "Analyze financial data and create reports.",
        responsibilities: [
          "Prepare financial reports",
          "Analyze financial trends",
          "Support budgeting process",
        ],
        saved: false,
      },
      {
        id: 30,
        title: "Accountant",
        company: "AccuBooks Inc",
        location: "Makati, Philippines",
        type: "full-time",
        level: "mid",
        category: "finance",
        salary: "40k-60k",
        education: "bachelor",
        tags: ["Onsite"],
        posted: "3 days ago",
        deadline: "Dec 20, 2025",
        description: "Manage accounting operations and financial records.",
        responsibilities: [
          "Maintain financial records",
          "Prepare tax filings",
          "Reconcile accounts",
        ],
        saved: false,
      },
      {
        id: 31,
        title: "Finance Manager",
        company: "GlobalFinance",
        location: "Manila, Philippines",
        type: "full-time",
        level: "senior",
        category: "finance",
        salary: "80k+",
        education: "master",
        tags: ["Hybrid", "Top 50"],
        posted: "2 weeks ago",
        deadline: "Jan 15, 2026",
        description: "Lead financial planning and strategy.",
        responsibilities: [
          "Develop financial strategies",
          "Manage finance team",
          "Oversee budgets",
        ],
        saved: false,
      },
      {
        id: 32,
        title: "Bookkeeper",
        company: "SmallBiz Accounting",
        location: "Quezon City, Philippines",
        type: "part-time",
        level: "entry",
        category: "finance",
        salary: "0-20k",
        education: "associate",
        tags: ["Remote"],
        posted: "5 days ago",
        deadline: "Dec 30, 2025",
        description: "Maintain financial records for small businesses.",
        responsibilities: [
          "Record financial transactions",
          "Prepare invoices",
          "Reconcile bank statements",
        ],
        saved: false,
      },
    ],
  };

  // Module state
  let allJobs = [];
  let allCategories = [];
  let currentCategory = null;

  /**
   * Get the base path for navigation
   * This handles both local file:// and hosted http:// scenarios
   */
  function getBasePath() {
    const path = window.location.pathname;

    // Check if we're in a subfolder (categories or job-listing)
    if (path.includes("/categories/") || path.includes("/job-listing/")) {
      return "../";
    }

    // We're at root level
    return "./";
  }

  /**
   * Initialize the module
   */
  function init() {
    loadJobsData();
  }

  /**
   * Load jobs data (now using embedded data instead of fetch)
   */
  function loadJobsData() {
    try {
      // Use embedded data directly
      allJobs = jobsData.jobs;
      allCategories = jobsData.categories;

      // Check if we're on the job listing page
      if (window.location.pathname.includes("job-listing")) {
        handleJobListingPage();
      }

      // Check if we're on the categories page
      if (window.location.pathname.includes("categories")) {
        handleCategoriesPage();
      }
    } catch (error) {
      console.error("Error loading jobs data:", error);

      // Show error message to user
      const container =
        document.querySelector("#categories-grid") ||
        document.querySelector(".jobs-main .list");
      if (container) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #d32f2f;">
            <h3>Error Loading Data</h3>
            <p>Could not load job listings. ${error.message}</p>
          </div>
        `;
      }
    }
  }

  /**
   * Handle job listing page - filter and display jobs
   */
  function handleJobListingPage() {
    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get("category");
    const selectedIdParam = urlParams.get("id");
    const selectedJobId = selectedIdParam
      ? parseInt(selectedIdParam, 10)
      : null;

    // Filter jobs if category is specified
    const filteredJobs = currentCategory
      ? allJobs.filter((job) => job.category === currentCategory)
      : allJobs;

    // Display jobs - only do initial display
    // Preselect job if id query param is present
    // The job-filters.js module will handle subsequent filtering
    displayJobs(filteredJobs, selectedJobId);

    // Update page title if category is specified
    if (currentCategory) {
      updatePageTitle(currentCategory);
    }

    // Setup no-results clear filters button
    setupNoResultsClearButton();

    console.log(
      "📋 Job listing initialized:",
      filteredJobs.length,
      "jobs",
      currentCategory ? `(category: ${currentCategory})` : ""
    );
  }

  /**
   * Handle categories page - display all categories
   */
  function handleCategoriesPage() {
    displayCategories();
  }

  /**
   * Display jobs in the job listing page
   */
  function displayJobs(jobs, selectedJobId = null) {
    const jobListContainer = document.querySelector(".jobs-main .list");

    if (!jobListContainer) {
      console.warn("Job list container not found");
      return;
    }

    // Hide all job cards first
    const allCards = jobListContainer.querySelectorAll(
      ".job-card:not(.no-results)"
    );
    allCards.forEach((card) => (card.style.display = "none"));

    // Get the no-results placeholder
    const noResultsPlaceholder = jobListContainer.querySelector(
      ".job-card.no-results"
    );

    // Show "no results" message if no jobs match
    if (jobs.length === 0) {
      if (noResultsPlaceholder) {
        noResultsPlaceholder.style.display = "";
      }
      showDetailsPlaceholder();
      return;
    }

    // Hide no-results placeholder
    if (noResultsPlaceholder) {
      noResultsPlaceholder.style.display = "none";
    }

    // Create and display ONLY the filtered job cards
    jobs.forEach((job, index) => {
      // Only select if there's a selectedJobId from URL params
      const isSelected = selectedJobId ? job.id === selectedJobId : false;
      const jobCard = createJobCard(job, isSelected);
      jobListContainer.appendChild(jobCard);
    });

    // Display selected job details only if there's a selectedJobId from URL
    if (jobs.length > 0 && selectedJobId) {
      const jobToShow = jobs.find((j) => j.id === selectedJobId);
      if (jobToShow) {
        displayJobDetails(jobToShow);
      } else {
        // Job ID not found, show placeholder
        showDetailsPlaceholder();
      }
    } else {
      // No job selected, show placeholder
      showDetailsPlaceholder();
    }

    // Add click handlers to job cards
    addJobCardClickHandlers(jobs);
  }

  /**
   * Filter jobs based on multiple criteria
   */
  function filterJobs(filters) {
    let filtered = currentCategory
      ? allJobs.filter((job) => job.category === currentCategory)
      : allJobs;

    // Apply each filter
    Object.keys(filters).forEach((filterType) => {
      const filterValue = filters[filterType];
      if (!filterValue) return; // Skip empty filters

      filtered = filtered.filter((job) => {
        switch (filterType) {
          case "level":
            return job.level === filterValue;
          case "type":
            return job.type === filterValue;
          case "function":
            return job.category === filterValue;
          case "education":
            return job.education === filterValue;
          case "company":
            // Match company name (case insensitive, remove spaces/dots)
            const jobCompany = job.company.toLowerCase().replace(/[.\s]/g, "");
            return jobCompany.includes(filterValue.toLowerCase());
          case "salary":
            return job.salary === filterValue;
          default:
            return true;
        }
      });
    });

    return filtered;
  }

  /**
   * Apply filters and update display
   */
  function applyFilters(filters) {
    const filtered = filterJobs(filters);
    displayJobs(filtered);
    return filtered.length;
  }

  /**
   * Create a job card element
   */
  function createJobCard(job, isSelected = false) {
    const article = document.createElement("article");
    article.className = `job-card${isSelected ? " selected" : ""}`;
    article.setAttribute("role", "listitem");
    article.setAttribute("data-job-id", job.id);

    const tagsHTML = job.tags
      .map(
        (tag) =>
          `<span class="pill${tag.includes("Top") ? " alt" : ""}">${tag}</span>`
      )
      .join("");

    article.innerHTML = `
      <header class="job-head">
        <h3 class="job-title">${job.title}</h3>
        <button class="love${job.saved ? " loved" : ""}" aria-label="${
      job.saved ? "Saved job" : "Save job"
    }">
          <span class="heart${
            job.saved ? "" : " outline"
          }" aria-hidden="true"></span>
        </button>
      </header>
      <p class="company"><a href="#">${job.company}</a></p>
      <p class="place">${job.location}</p>
      <p class="meta">Posted ${job.posted} · Apply before ${
      job.deadline
    }<br />Recruiter was hiring 4 days ago</p>
      <div class="tags">${tagsHTML}</div>
    `;

    return article;
  }

  /**
   * Display job details in the detail pane
   */
  function displayJobDetails(job) {
    const detailsContainer = document.querySelector(".details");

    if (!detailsContainer) {
      return;
    }

    // Hide placeholder and show detail card
    const placeholder = detailsContainer.querySelector(".detail-placeholder");
    const detailCard = detailsContainer.querySelector(".detail-card");
    const hero = detailsContainer.querySelector(".hero");

    if (placeholder) {
      placeholder.style.display = "none";
    }

    // Show hero section when displaying job details
    if (hero) {
      hero.style.display = "";
    }

    if (!detailCard) {
      console.warn("Detail card element not found");
      return;
    }

    detailCard.style.display = "";

    const responsibilitiesHTML = job.responsibilities
      .map((resp) => `<li>${resp}</li>`)
      .join("");

    // Update the hero ribbon
    const ribbon = detailsContainer.querySelector(".hero .ribbon span");
    if (ribbon) {
      ribbon.textContent = job.company;
    } // Update detail card content
    detailCard.innerHTML = `
      <header class="detail-head">
        <div class="left">
          <h2 id="detail-title">${job.title}</h2>
          <p class="company-line"><a href="#">${job.company}</a></p>
          <p class="summary">${job.location} • ${job.type.replace(
      "-",
      " "
    )} • ${job.tags
      .map((tag) => `<span class="pill tiny">${tag}</span>`)
      .join(" ")}</p>
        </div>
        <p class="posted">Posted ${
          job.posted
        } and deadline of application is on ${
      job.deadline
    }<br />Recruiter was hiring 4 days ago</p>
      </header>

      <div class="cta-row">
        <button class="btn-primary">Apply Now</button>
        <button class="btn-ghost"><span class="ico heart" aria-hidden="true"></span> Save</button>
        <button class="btn-ghost"><span class="ico share" aria-hidden="true"></span> Share</button>
      </div>

      <section class="jd" aria-labelledby="jd-heading">
        <h3 id="jd-heading">Job Description</h3>
        <p>${job.description}</p>

        <h4>Responsibilities</h4>
        <ul class="bullets">
          ${responsibilitiesHTML}
        </ul>
      </section>
    `;

    // Also update the mobile offcanvas drawer
    updateMobileOffcanvas(job, responsibilitiesHTML);
  }

  /**
   * Update the mobile offcanvas drawer with job details
   */
  function updateMobileOffcanvas(job, responsibilitiesHTML) {
    // Update offcanvas content
    const offcanvasCompanyName = document.getElementById(
      "offcanvasCompanyName"
    );
    const offcanvasJobTitle = document.getElementById("offcanvasJobTitle");
    const offcanvasCompanyLink = document.getElementById(
      "offcanvasCompanyLink"
    );
    const offcanvasJobSummary = document.getElementById("offcanvasJobSummary");
    const offcanvasJobPosted = document.getElementById("offcanvasJobPosted");
    const offcanvasJobDescription = document.getElementById(
      "offcanvasJobDescription"
    );
    const offcanvasJobResponsibilities = document.getElementById(
      "offcanvasJobResponsibilities"
    );

    if (offcanvasCompanyName) offcanvasCompanyName.textContent = job.company;
    if (offcanvasJobTitle) offcanvasJobTitle.textContent = job.title;
    if (offcanvasCompanyLink) {
      offcanvasCompanyLink.textContent = job.company;
      offcanvasCompanyLink.href = "#";
    }
    if (offcanvasJobSummary) {
      offcanvasJobSummary.innerHTML = `${job.location} • ${job.type.replace(
        "-",
        " "
      )} • ${job.tags
        .map((tag) => `<span class="pill tiny">${tag}</span>`)
        .join(" ")}`;
    }
    if (offcanvasJobPosted) {
      offcanvasJobPosted.innerHTML = `Posted ${job.posted} and deadline of application is on ${job.deadline}<br />Recruiter was hiring 4 days ago`;
    }
    if (offcanvasJobDescription) {
      offcanvasJobDescription.textContent = job.description;
    }
    if (offcanvasJobResponsibilities) {
      offcanvasJobResponsibilities.innerHTML = responsibilitiesHTML;
    }
  }

  /**
   * Show the details placeholder when no job is selected
   */
  function showDetailsPlaceholder() {
    const detailsContainer = document.querySelector(".details");

    if (!detailsContainer) {
      return;
    }

    // Show placeholder and hide detail card
    const placeholder = detailsContainer.querySelector(".detail-placeholder");
    const detailCard = detailsContainer.querySelector(".detail-card");
    const hero = detailsContainer.querySelector(".hero");

    if (placeholder) {
      placeholder.style.display = "";
    }

    if (detailCard) {
      detailCard.style.display = "none";
    }

    // Hide hero section when showing placeholder
    if (hero) {
      hero.style.display = "none";
    }
  }
  /**
   * Setup the clear filters button in the no-results placeholder
   */
  function setupNoResultsClearButton() {
    const clearBtn = document.getElementById("noResultsClearFilters");

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        // Clear all filters and reload page without params
        const basePath = getBasePath();
        window.location.href = `${basePath}job-listing/job-listing.html`;
      });
    }
  }

  /**
   * Add click handlers to job cards (using event delegation to avoid memory leaks)
   */
  function addJobCardClickHandlers(jobs) {
    // Remove old listener if exists
    const jobListContainer = document.querySelector(".jobs-main .list");
    if (!jobListContainer) return;

    // Use event delegation - attach one listener to the container
    // Remove any existing listener first
    if (jobListContainer._jobCardHandler) {
      jobListContainer.removeEventListener(
        "click",
        jobListContainer._jobCardHandler
      );
    }

    // Create new handler
    const handler = function (e) {
      const card = e.target.closest(".job-card");
      if (!card) return;

      const jobId = parseInt(card.getAttribute("data-job-id"));
      const job = jobs.find((j) => j.id === jobId);

      if (job) {
        // Clear all URL parameters when a job card is clicked
        try {
          const url = new URL(window.location);
          url.search = "";
          window.history.replaceState({}, "", url);
        } catch (_) {}

        // Remove selected class from all cards
        document
          .querySelectorAll(".job-card")
          .forEach((c) => c.classList.remove("selected"));

        // Add selected class to clicked card
        card.classList.add("selected");

        // Display job details (desktop)
        displayJobDetails(job);

        // Show mobile offcanvas drawer on mobile/tablet
        if (window.innerWidth < 992) {
          const offcanvas = document.getElementById("jobDetailsOffcanvas");
          if (offcanvas) {
            const bsOffcanvas = new bootstrap.Offcanvas(offcanvas);
            bsOffcanvas.show();
          }
        }
      }
    };

    // Store reference to handler and add listener
    jobListContainer._jobCardHandler = handler;
    jobListContainer.addEventListener("click", handler);
  }

  /**
   * Update page title based on category
   */
  function updatePageTitle(categoryId) {
    const category = allCategories.find((cat) => cat.id === categoryId);

    if (category) {
      document.title = `${category.name} Jobs - Hunter`;

      // Update search strip if needed
      const searchStrip = document.querySelector(".search-strip");
      if (searchStrip) {
        // You can add a badge or indicator showing the active category
        if (category) {
          const badge = document.createElement("div");
          badge.className = "category-badge";
          const basePath = getBasePath();
          badge.innerHTML = `
          <span>Showing ${category.name} jobs</span>
          <a href="${basePath}job-listing/job-listing.html">Clear filter</a>
        `;
          badge.style.cssText =
            "padding: 10px 20px; background: #fff; margin-top: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;";

          const container = document.querySelector(
            ".search-strip .container:last-child"
          );
          if (container && !document.querySelector(".category-badge")) {
            container.after(badge);
          }
        }
      }
    }
  }

  /**
   * Display categories on the categories page
   */
  function displayCategories() {
    const categoriesContainer = document.getElementById("categories-grid");

    if (!categoriesContainer) {
      return;
    }

    // Clear existing content
    categoriesContainer.innerHTML = "";

    // Create category cards
    allCategories.forEach((category) => {
      const categoryCard = createCategoryCard(category);
      categoriesContainer.appendChild(categoryCard);
    });
  }

  /**
   * Create a category card element
   */
  function createCategoryCard(category) {
    const card = document.createElement("a");
    const basePath = getBasePath();
    card.href = `${basePath}job-listing/job-listing.html?category=${category.id}`;
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <h3 class="category-name">${category.name}</h3>
      <p class="category-description">${category.description}</p>
      <div class="category-count">${category.jobCount} jobs available</div>
    `;

    return card;
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose module for debugging and external use
  window.JobFilterModule = {
    getAllJobs: () => allJobs,
    getAllCategories: () => allCategories,
    getCurrentCategory: () => currentCategory,
    displayJobs: displayJobs,
    filterJobs: filterJobs,
    applyFilters: applyFilters,
  };
})();
