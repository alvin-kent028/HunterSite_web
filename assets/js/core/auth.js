/**
 * Authentication and User Management
 * Handles Google Login, Email/Password Login, and Logout
 */

// Initialize auth when page loads
document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});

function initAuth() {
  // Ensure StorageManager is available
  if (typeof window.StorageManager === 'undefined') {
    console.error('StorageManager not loaded. Authentication will not work.');
    return;
  }

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

  // Make Google callback available globally
  window.handleCredentialResponse = handleCredentialResponse;
  
  // Initialize Google Sign-In if on login page
  initializeGoogleSignIn();
}

/**
 * Handle Google Sign-In (Secure Server-Side Flow)
 * This must be in the global scope for Google to find it
 */
async function handleCredentialResponse(response) {
  try {
    if (!response || !response.credential) {
      throw new Error('No credential received from Google');
    }

    const userType = getUserTypeFromPage();

    // 1. Send the token to your backend for verification
    // Replace '/api/auth/google' with your actual backend endpoint
    const serverResponse = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: response.credential,
        userType: userType
      })
    });

    const result = await serverResponse.json();

    if (result.success) {
      // 2. Only AFTER server validation do we update the UI/Storage
      window.StorageManager.saveToStorage(
        window.StorageManager.STORAGE_KEYS.USER,
        result.user
      );
      
      alert(`Welcome, ${result.user.name}!`);
      redirectAfterLogin(result.user.userType || userType);
    } else {
      throw new Error(result.message || 'Server-side validation failed');
    }

  } catch (error) {
    console.error("Auth Error:", error);
    alert("Authentication failed: " + error.message);
  }
}

/**
 * FIXED: Setup Logout Buttons
 * Handles local data clearing and Google session management
 */
function setupLogoutButtons() {
  // 1. Check if user is even logged in
  if (!window.StorageManager.isLoggedIn()) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight) return;

  // 2. Prevent duplicate buttons
  if (navRight.querySelector(".logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn-sm btn-outline-danger logout-btn ms-2";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.fontSize = "12px";

  logoutBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      const user = window.StorageManager.getCurrentUser();

      // 3. If they used Google, disable the auto-login prompt for next time
      if (user && user.authSource === "google") {
        if (typeof google !== "undefined") {
          google.accounts.id.disableAutoSelect();
        }
      }

      // 4. Clear local data
      window.StorageManager.logoutUser();
      alert("Logged out successfully");

      // 5. Redirect to login page
      const isInLoginDir = window.location.pathname.includes("/login/");
      window.location.href = isInLoginDir ? "login.html" : "login/login.html";
    }
  });

  navRight.appendChild(logoutBtn);
}

/**
 * Handle Traditional Login Form (Email + Password)
 */
function setupLoginForm() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      if (emailInput) showError(emailInput, "Please enter your email");
      return;
    }

    if (!isValidGmail(email)) {
      if (emailInput) showError(emailInput, "Please enter a valid Gmail address (e.g., yourname@gmail.com)");
      return;
    }

    const userType = getUserTypeFromPage();
    const success = window.StorageManager.saveUserLogin(email, userType);

    if (success) {
      alert(`Login successful! Welcome ${email}`);
      redirectAfterLogin(userType);
    } else {
      alert("Login failed. Please try again.");
    }
  });

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

function updateAuthUI(user) {
  if (!user) return;

  const userLinks = document.querySelectorAll(".user, .nav-right a");
  userLinks.forEach((link) => {
    if (link.textContent.includes("Ruby Grace")) {
      link.textContent = user.name || user.email.split("@")[0];
    }
  });

  if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
    showWelcomeMessage(user);
  }
}

function showWelcomeMessage(user) {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const welcomeMsg = document.createElement("div");
  welcomeMsg.className = "alert alert-success position-fixed top-0 start-50 translate-middle-x mt-5";
  welcomeMsg.style.zIndex = "9999";
  welcomeMsg.innerHTML = `Welcome back, ${user.name}! <span class="badge bg-primary ms-2">${user.userType}</span>`;

  document.body.appendChild(welcomeMsg);
  setTimeout(() => welcomeMsg.remove(), 4000);
}

function initializeGoogleSignIn() {
  const googleSignInElement = document.getElementById('g_id_onload');
  if (!googleSignInElement) return;
  
  const clientId = googleSignInElement.dataset.client_id;
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    console.warn('Google Client ID is not configured.');
    const googleButton = document.querySelector('.g_id_signin');
    if (googleButton) googleButton.style.display = 'none';
  }
}

function getUserTypeFromPage() {
  const selector = document.querySelector('input[name="userType"]:checked');
  return selector ? selector.value : "jobseeker";
}

function setupUserTypeSelector() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm || document.querySelector(".user-type-selector")) return;

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get("as");

  let defaultType = "jobseeker";
  if (preselectedType === "employer" || preselectedType === "admin") {
    defaultType = preselectedType;
  }

  const selector = document.createElement("div");
  selector.className = "user-type-selector mb-3";
  selector.innerHTML = `
    <p class="small mb-2">I am a:</p>
    <div class="btn-group w-100" role="group">
      <input type="radio" class="btn-check" name="userType" id="typeJobseeker" value="jobseeker" ${defaultType === "jobseeker" ? "checked" : ""}>
      <label class="btn btn-outline-primary" for="typeJobseeker">Job Seeker</label>
      <input type="radio" class="btn-check" name="userType" id="typeEmployer" value="employer" ${defaultType === "employer" ? "checked" : ""}>
      <label class="btn btn-outline-primary" for="typeEmployer">Employer</label>
    </div>
  `;

  const emailField = loginForm.querySelector(".field");
  if (emailField) {
    emailField.parentNode.insertBefore(selector, emailField);
  }
}

function redirectAfterLogin(userType) {
  const isInLoginDir = window.location.pathname.includes("/login/");
  const prefix = isInLoginDir ? "../" : "";

  switch (userType) {
    case "employer":
      window.location.href = prefix + "employer/dashboard.html";
      break;
    case "admin":
      window.location.href = prefix + "admin/dashboard.html";
      break;
    default:
      window.location.href = prefix + "job-listing/job-listing.html";
  }
}

<<<<<<< HEAD
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
        
        // Reload current page to update UI (remove user name and logout button)
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        // Still reload page even if logout API call fails
        window.location.reload();
      }
    }
  });

  navRight.appendChild(logoutBtn);
}

// Helper functions
=======
>>>>>>> 1aa6a07653c45d4f1f604cc222c47ef589c0e2f0
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidGmail(email) {
  if (!isValidEmail(email)) return false;
  const domain = email.toLowerCase().split('@')[1];
  return domain === 'gmail.com' || domain === 'googlemail.com';
}

function showError(input, message) {
  clearError(input);
  input.classList.add("border-danger");
  const error = document.createElement("small");
  error.className = "text-danger d-block mt-1";
  error.textContent = message;
  error.dataset.error = "true";
  input.parentNode.appendChild(error);
}

function clearError(input) {
  input.classList.remove("border-danger");
  const error = input.parentNode.querySelector('[data-error="true"]');
  if (error) error.remove();
}

console.log("🔐 Auth system loaded");