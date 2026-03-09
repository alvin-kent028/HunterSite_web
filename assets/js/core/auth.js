/**
 * Authentication and User Management
 * Handles login, logout, and user type selection
 * Now connects to backend API for proper authentication
 */

// Initialize auth when page loads
document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});

function initAuth() {
  // Ensure BackendAPI is available
  if (typeof window.backendAPI === 'undefined') {
    console.error('BackendAPI not loaded. Authentication will not work.');
    return;
  }

  // Check if user is logged in (from backend)
  const user = window.backendAPI.getCachedUser();

  // Update UI based on login status
  updateAuthUI(user);

  // Setup login form if it exists
  setupLoginForm();

  // Setup logout buttons
  setupLogoutButtons();

  // Setup user type selector
  setupUserTypeSelector();

  // Make Google callback available globally
  window.handleCredentialResponse = handleCredentialResponse;
  
  // Initialize Google Sign-In if on login page
  initializeGoogleSignIn();
}

/**
 * Handle Google Sign-In response
 * @param {Object} response - Credential response from Google
 */
async function handleCredentialResponse(response) {
  try {
    // Check if response and credential exist
    if (!response || !response.credential) {
      console.error('Invalid response from Google Sign-In');
      alert('Google Sign-In failed. Please try again.');
      return;
    }

    // Validate that it's a Gmail address (backend will also validate)
    const payload = decodeJwtResponse(response.credential);
    if (!isValidGmail(payload.email)) {
      console.error('Non-Gmail account attempted:', payload.email);
      alert('Only Gmail accounts are allowed for sign-in. Please use your Gmail account.');
      return;
    }

    console.log("Google user logged in:", payload);

    // Get user type (default to jobseeker)
    const userType = getUserTypeFromPage();

    // Call backend API for Google login
    const result = await window.backendAPI.googleLogin(response.credential);
    
    // Update user type if needed
    if (userType !== 'jobseeker') {
      await window.backendAPI.updateUserType(userType);
    }

    alert(`Welcome, ${payload.name}! Login successful.`);
    redirectAfterLogin(userType);
    
  } catch (error) {
    console.error("Error handling Google login:", error);
    alert(error.message || "An error occurred during Google login. Please try again.");
  }
}

function decodeJwtResponse(token) {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Add padding if needed
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Failed to decode Google token');
  }
}

function updateAuthUI(user) {
  if (!user) {
    return;
  }

  // Update user name in navigation - handle both text content and empty links
  const userLinks = document.querySelectorAll(".user, .nav-right a");
  userLinks.forEach((link) => {
    // Update if it contains "Ruby Grace" or if it's empty
    if (link.textContent.includes("Ruby Grace") || link.textContent.trim() === "") {
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

function initializeGoogleSignIn() {
  // Check if we're on the login page and Google Sign-In is configured
  const googleSignInElement = document.getElementById('g_id_onload');
  if (!googleSignInElement) return;
  
  const clientId = googleSignInElement.dataset.client_id;
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    console.warn('Google Client ID is not configured. Please replace YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com with your actual Client ID.');
    
    // Hide Google Sign-In button if not configured
    const googleButton = document.querySelector('.g_id_signin');
    if (googleButton) {
      googleButton.style.display = 'none';
    }
    
    // Show a message to the user
    const authActions = document.querySelector('.auth-actions');
    if (authActions) {
      const warningMsg = document.createElement('div');
      warningMsg.className = 'alert alert-warning mt-2';
      warningMsg.innerHTML = '<small>Google Sign-In is not configured. Please use email login or contact administrator.</small>';
      authActions.appendChild(warningMsg);
    }
  }
}

async function setupLoginForm() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    // Validate email
    if (!email) {
      if (emailInput) showError(emailInput, "Please enter your email");
      return;
    }

    // Check if it's a valid Gmail address
    if (!isValidGmail(email)) {
      if (emailInput) showError(emailInput, "Please enter a valid Gmail address (e.g., yourname@gmail.com)");
      return;
    }

    // Get user type (default to jobseeker)
    const userType = getUserTypeFromPage();

    try {
      // Call backend API for login
      const result = await window.backendAPI.login(email, userType);
      
      // Show success message
      alert(`Login successful! Welcome ${email}`);

      // Redirect to appropriate page
      redirectAfterLogin(userType);
    } catch (error) {
      alert(error.message || "Login failed. Please try again.");
    }
  });

  // Add input validation
  const emailInput = loginForm.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      if (this.value && !isValidGmail(this.value)) {
        showError(this, "Please enter a valid Gmail address (e.g., yourname@gmail.com)");
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
  // Determine the base path based on where we are
  const isInLoginDir = window.location.pathname.includes("/login/");
  const prefix = isInLoginDir ? "../" : "";

  // Redirect based on user type
  switch (userType) {
    case "employer":
      window.location.href = prefix + "employer/dashboard.html"; // Employer dashboard
      break;
    case "admin":
      window.location.href = prefix + "admin/dashboard.html"; // Admin panel
      break;
    default:
      window.location.href = prefix + "job-listing/job-listing.html"; // Job listings
  }
}

async function setupLogoutButtons() {
  // Add logout button to navigation if user is logged in
  if (!window.backendAPI.isLoggedIn()) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight || navRight.querySelector(".logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn-sm btn-outline-danger logout-btn ms-2";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.fontSize = "12px";

  logoutBtn.addEventListener("click", async function () {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await window.backendAPI.logout();
        alert("Logged out successfully");

        // Redirect to login page
        const isInLoginDir = window.location.pathname.includes("/login/");
        window.location.href = isInLoginDir ? "login.html" : "login/login.html";
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if logout API call fails
        window.location.href = "login/login.html";
      }
    }
  });

  navRight.appendChild(logoutBtn);
}

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidGmail(email) {
  // Check if it's a valid email format first
  if (!isValidEmail(email)) {
    return false;
  }
  
  // Check if it's a Gmail address (including googlemail.com)
  const domain = email.toLowerCase().split('@')[1];
  return domain === 'gmail.com' || domain === 'googlemail.com';
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
