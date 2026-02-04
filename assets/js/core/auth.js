/**
 * Authentication and User Management
 * Handles login, logout, and user type selection
 */

// Initialize auth when page loads
document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});

function initAuth() {
  // Check if user is logged in
  const user = window.StorageManager.getCurrentUser();

  // Update UI based on login status
  updateAuthUI(user);

  // Setup login form if it exists
  setupLoginForm();

  // Setup logout buttons
  setupLogoutButtons();

  // Setup user type selector
  setupUserTypeSelector();
}

function updateAuthUI(user) {
  if (!user) {
    return;
  }

  // Update user name in navigation
  const userLinks = document.querySelectorAll(".user, .nav-right a");
  userLinks.forEach((link) => {
    if (link.textContent.includes("Ruby Grace")) {
      link.textContent = user.name || user.email.split("@")[0];
    }
  });

  // Show welcome message on homepage
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    showWelcomeMessage(user);
  }
}

function showWelcomeMessage(user) {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const welcomeMsg = document.createElement("div");
  welcomeMsg.className =
    "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5";
  welcomeMsg.style.zIndex = "9999";
  welcomeMsg.innerHTML = `
    Welcome back, ${user.name}! 
    <span class="badge bg-primary ms-2">${user.userType}</span>
  `;

  document.body.appendChild(welcomeMsg);

  setTimeout(() => {
    welcomeMsg.remove();
  }, 4000);
}

function setupLoginForm() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    // Validate email
    if (!email) {
      showError(emailInput, "Please enter your email");
      return;
    }

    if (!isValidEmail(email)) {
      showError(emailInput, "Please enter a valid email address");
      return;
    }

    // Get user type (default to jobseeker)
    const userType = getUserTypeFromPage();

    // Save login
    const success = window.StorageManager.saveUserLogin(email, userType);

    if (success) {
      // Show success message
      alert("Login successful!");

      // Redirect to appropriate page
      redirectAfterLogin(userType);
    } else {
      alert("Login failed. Please try again.");
    }
  });

  // Add input validation
  const emailInput = loginForm.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      if (this.value && !isValidEmail(this.value)) {
        showError(this, "Invalid email format");
      } else {
        clearError(this);
      }
    });
  }
}

function getUserTypeFromPage() {
  // Check if there's a user type selector
  const selector = document.querySelector('input[name="userType"]:checked');
  if (selector) {
    return selector.value;
  }

  // Default to jobseeker
  return "jobseeker";
}

function setupUserTypeSelector() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm) return;

  // Check if selector already exists
  if (document.querySelector(".user-type-selector")) return;

  // Check URL parameters to see if user type should be pre-selected
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get("as"); // e.g., ?as=employer

  // Determine which type should be checked by default
  let defaultType = "jobseeker";
  if (preselectedType === "employer" || preselectedType === "admin") {
    defaultType = preselectedType;
  }

  // Create user type selector
  const selector = document.createElement("div");
  selector.className = "user-type-selector mb-3";
  selector.innerHTML = `
    <p class="small mb-2">I am a:</p>
    <div class="btn-group w-100" role="group">
      <input type="radio" class="btn-check" name="userType" id="typeJobseeker" value="jobseeker" ${
        defaultType === "jobseeker" ? "checked" : ""
      }>
      <label class="btn btn-outline-primary" for="typeJobseeker">Job Seeker</label>
      
      <input type="radio" class="btn-check" name="userType" id="typeEmployer" value="employer" ${
        defaultType === "employer" ? "checked" : ""
      }>
      <label class="btn btn-outline-primary" for="typeEmployer">Employer</label>
      
      <!-- Admin option commented out - not implemented yet
      <input type="radio" class="btn-check" name="userType" id="typeAdmin" value="admin" ${
        defaultType === "admin" ? "checked" : ""
      }>
      <label class="btn btn-outline-primary" for="typeAdmin">Admin</label>
      -->
    </div>
  `;

  // Insert before the email field
  const emailField = loginForm.querySelector(".field");
  if (emailField) {
    emailField.parentNode.insertBefore(selector, emailField);
  }
}

function redirectAfterLogin(userType) {
  // Redirect based on user type
  switch (userType) {
    case "employer":
      window.location.href = "../employer/dashboard.html"; // Employer dashboard
      break;
    case "admin":
      window.location.href = "../admin/dashboard.html"; // Admin panel
      break;
    default:
      window.location.href = "../job-listing/job-listing.html"; // Job listings
  }
}

function setupLogoutButtons() {
  // Add logout button to navigation if user is logged in
  if (!window.StorageManager.isLoggedIn()) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight || navRight.querySelector(".logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn-sm btn-outline-danger logout-btn ms-2";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.fontSize = "12px";

  logoutBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      window.StorageManager.logoutUser();
      alert("Logged out successfully");
      window.location.href = "../login/login.html";
    }
  });

  navRight.appendChild(logoutBtn);
}

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showError(input, message) {
  // Remove existing error
  clearError(input);

  // Add error class
  input.classList.add("border-danger");

  // Create error message
  const error = document.createElement("small");
  error.className = "text-danger d-block mt-1";
  error.textContent = message;
  error.dataset.error = "true";

  // Insert after input
  input.parentNode.appendChild(error);
}

function clearError(input) {
  input.classList.remove("border-danger");
  const error = input.parentNode.querySelector('[data-error="true"]');
  if (error) {
    error.remove();
  }
}

console.log("🔐 Auth system loaded");
