/**
 * Authentication and User Management
 * Handles Google Login, Email/Password Login, and Logout
 * SIMULATED VERSION: Works without a real backend server
 */

// Initialize auth when page loads
document.addEventListener("DOMContentLoaded", function () {
  initAuth();
});

function initAuth() {
  if (typeof window.StorageManager === 'undefined') {
    console.error('StorageManager not loaded. Authentication will not work.');
    return;
  }

  const user = window.StorageManager.getCurrentUser();
  updateAuthUI(user);
  setupLoginForm();
  setupLogoutButtons();
  setupUserTypeSelector();

  window.handleCredentialResponse = handleCredentialResponse;
  initializeGoogleSignIn();
}

/**
 * Handle Google Sign-In response (Simulated for Frontend Testing)
 */
function handleCredentialResponse(response) {
  try {
    if (!response || !response.credential) {
      throw new Error('No credential received from Google');
    }

    // Normally we'd fetch() here. Instead, we decode the token to simulate a server response.
    // Note: In production, NEVER decode on the frontend to authorize a user.
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const userType = getUserTypeFromPage();

    const simulatedUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      userType: userType,
      loginDate: new Date().toISOString(),
      authSource: "google"
    };

    window.StorageManager.saveToStorage(
      window.StorageManager.STORAGE_KEYS.USER,
      simulatedUser
    );
    
    alert(`Welcome, ${simulatedUser.name}! Login successful.`);
    redirectAfterLogin(userType);

  } catch (error) {
    console.error("Auth Error:", error);
    alert("Authentication failed: " + error.message);
  }
}

/**
 * Handle Traditional Login Form (Email + Password)
 * SIMULATED: Always succeeds if Gmail is valid and Password >= 6 chars
 */
function setupLoginForm() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const passwordInput = this.querySelector('input[type="password"]');
    
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!isValidGmail(email)) {
      if (emailInput) showError(emailInput, "Please enter a valid Gmail address");
      return;
    }

    if (!password || password.length < 6) {
      if (passwordInput) showError(passwordInput, "Password must be at least 6 characters");
      return;
    }

    const userType = getUserTypeFromPage();

    // SIMULATION logic
    const simulatedUser = {
      email: email,
      name: email.split('@')[0],
      userType: userType,
      loginDate: new Date().toISOString(),
      authSource: "manual"
    };

    const success = window.StorageManager.saveToStorage(
      window.StorageManager.STORAGE_KEYS.USER,
      simulatedUser
    );

    if (success) {
      alert(`Login successful! Welcome ${simulatedUser.name}`);
      redirectAfterLogin(userType);
    } else {
      alert("Local storage error.");
    }
  });

  const emailInput = loginForm.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      if (this.value && !isValidGmail(this.value)) {
        showError(this, "Please enter a valid Gmail address");
      } else {
        clearError(this);
      }
    });
  }
}

function setupLogoutButtons() {
  if (!window.StorageManager.isLoggedIn()) return;

  const navRight = document.querySelector(".nav-right");
  if (!navRight || navRight.querySelector(".logout-btn")) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn-sm btn-outline-danger logout-btn ms-2";
  logoutBtn.textContent = "Logout";
  logoutBtn.style.fontSize = "12px";

  logoutBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      const user = window.StorageManager.getCurrentUser();

      if (user && user.authSource === "google") {
        if (typeof google !== "undefined") {
          google.accounts.id.disableAutoSelect();
        }
      }

      window.StorageManager.logoutUser();
      alert("Logged out successfully");

      const isInLoginDir = window.location.pathname.includes("/login/");
      window.location.href = isInLoginDir ? "login.html" : "login/login.html";
    }
  });

  navRight.appendChild(logoutBtn);
}

/**
 * UI & Helper Functions
 */

function updateAuthUI(user) {
  if (!user) return;

  const userLinks = document.querySelectorAll(".user, .nav-right a, .user-name");
  userLinks.forEach((link) => {
    if (link.textContent.includes("Ruby Grace") || link.classList.contains('user-name')) {
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
  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    console.warn('Google Client ID not configured.');
  }
}

function getUserTypeFromPage() {
  const selector = document.querySelector('input[name="userType"]:checked');
  return selector ? selector.value : "jobseeker";
}

function setupUserTypeSelector() {
  const loginForm = document.querySelector(".auth-form");
  if (!loginForm || document.querySelector(".user-type-selector")) return;

  const selector = document.createElement("div");
  selector.className = "user-type-selector mb-3";
  selector.innerHTML = `
    <p class="small mb-2">I am a:</p>
    <div class="btn-group w-100" role="group">
      <input type="radio" class="btn-check" name="userType" id="typeJobseeker" value="jobseeker" checked>
      <label class="btn btn-outline-primary" for="typeJobseeker">Job Seeker</label>
      <input type="radio" class="btn-check" name="userType" id="typeEmployer" value="employer">
      <label class="btn btn-outline-primary" for="typeEmployer">Employer</label>
    </div>
  `;

  const emailField = loginForm.querySelector(".field") || loginForm.firstElementChild;
  loginForm.insertBefore(selector, emailField);
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

console.log("🔐 Auth system (Simulated) loaded");