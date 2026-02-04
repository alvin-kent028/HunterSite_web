/**
 * Initialize Sample Data for Testing
 * Run this once to populate the system with sample employer jobs
 */

function initializeSampleData() {
  // Sample employer jobs
  const sampleJobs = [
    {
      id: "job_sample_1",
      title: "Senior Frontend Developer",
      company: "TechCorp Solutions",
      description:
        "We're looking for an experienced Frontend Developer to join our innovative team. You'll work on cutting-edge web applications using React, TypeScript, and modern tools.",
      requirements:
        "5+ years experience with React, TypeScript proficiency, strong CSS skills, experience with state management (Redux/MobX), excellent communication skills",
      location: "Manila, Philippines",
      type: "Full-time",
      salary: "₱80,000 - ₱120,000",
      category: "Technology",
      deadline: "2025-12-31",
      status: "active",
      postedBy: "employer@techcorp.com",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      applicationsCount: 12,
    },
    {
      id: "job_sample_2",
      title: "Marketing Manager",
      company: "GrowthHub Agency",
      description:
        "Join our dynamic marketing team! Lead campaigns, manage social media strategy, and drive brand growth for multiple clients.",
      requirements:
        "3+ years in digital marketing, proven track record in campaign management, SEO/SEM expertise, analytics proficiency, creative mindset",
      location: "Quezon City, Philippines",
      type: "Full-time",
      salary: "₱60,000 - ₱90,000",
      category: "Marketing",
      deadline: "2025-11-30",
      status: "active",
      postedBy: "employer@growthhub.com",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      applicationsCount: 8,
    },
    {
      id: "job_sample_3",
      title: "UX/UI Designer",
      company: "DesignStudio Inc",
      description:
        "Create beautiful, user-centered designs for web and mobile applications. Work with a talented team on exciting projects.",
      requirements:
        "Portfolio required, 2+ years UX/UI experience, Figma expert, understanding of design systems, user research skills",
      location: "Remote",
      type: "Remote",
      salary: "₱50,000 - ₱80,000",
      category: "Design",
      deadline: "2025-12-15",
      status: "pending",
      postedBy: "employer@designstudio.com",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      applicationsCount: 5,
    },
  ];

  // Sample applications
  const sampleApplications = [
    {
      id: "app_1",
      jobId: "job_sample_1",
      applicantEmail: "jobseeker1@test.com",
      applicantName: "Maria Santos",
      appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "app_2",
      jobId: "job_sample_1",
      applicantEmail: "jobseeker2@test.com",
      applicantName: "Juan Dela Cruz",
      appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
    {
      id: "app_3",
      jobId: "job_sample_2",
      applicantEmail: "jobseeker3@test.com",
      applicantName: "Ana Reyes",
      appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "new",
    },
  ];

  // Save to localStorage
  const existingJobs = JSON.parse(localStorage.getItem("employer_jobs")) || [];
  const existingApps =
    JSON.parse(localStorage.getItem("job_applications")) || [];

  // Only add if not already there
  const newJobs = sampleJobs.filter(
    (job) => !existingJobs.find((ej) => ej.id === job.id)
  );
  const newApps = sampleApplications.filter(
    (app) => !existingApps.find((ea) => ea.id === app.id)
  );

  if (newJobs.length > 0) {
    localStorage.setItem(
      "employer_jobs",
      JSON.stringify([...existingJobs, ...newJobs])
    );
    console.log(`✅ Added ${newJobs.length} sample jobs`);
  }

  if (newApps.length > 0) {
    localStorage.setItem(
      "job_applications",
      JSON.stringify([...existingApps, ...newApps])
    );
    console.log(`✅ Added ${newApps.length} sample applications`);
  }

  if (newJobs.length > 0 || newApps.length > 0) {
    console.log("✅ Sample data initialized!");
    console.log("\nTest employer accounts:");
    console.log("- employer@techcorp.com");
    console.log("- employer@growthhub.com");
    console.log("- employer@designstudio.com");
  } else {
    console.log("ℹ️ Sample data already exists");
  }
}

// Auto-initialize on load if in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  console.log("🔧 Development mode detected");
  console.log("Run initializeSampleData() to add sample data");
}

// Export for manual use
window.initializeSampleData = initializeSampleData;
