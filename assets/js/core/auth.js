/**
 * Authentication and User Management
 * Uses REAL backend API with MongoDB - NOT simulated
 */

const API_URL = 'http://localhost:5000/api';

// Get auth token from storage
function getAuthToken() {
    return localStorage.getItem('huntersite_token') || sessionStorage.getItem('huntersite_token');
}

// Get current user from storage
function getCurrentUser() {
    const userJson = localStorage.getItem('huntersite_user') || sessionStorage.getItem('huntersite_user');
    return userJson ? JSON.parse(userJson) : null;
}

// Save auth data
function saveAuth(token, user) {
    localStorage.setItem('huntersite_token', token);
    localStorage.setItem('huntersite_user', JSON.stringify(user));
}

// Clear auth data (logout)
function clearAuth() {
    localStorage.removeItem('huntersite_token');
    localStorage.removeItem('huntersite_user');
    sessionStorage.removeItem('huntersite_token');
    sessionStorage.removeItem('huntersite_user');
}

// Check if logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Initialize auth when page loads
document.addEventListener("DOMContentLoaded", function () {
    initAuth();
});

async function initAuth() {
    updateAuthUI(getCurrentUser());
    setupLoginForm();
    setupLogoutButtons();
    setupGoogleSignIn();
}

/**
 * Handle Google Sign-In response
 */
async function handleCredentialResponse(response) {
    try {
        if (!response || !response.credential) {
            throw new Error('No credential received from Google');
        }

        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Save token and user data
        saveAuth(data.token, data.user);
        
        alert(`Welcome, ${data.user.name}! Login successful.`);
        redirectAfterLogin(data.user.userType);

    } catch (error) {
        console.error("Auth Error:", error);
        alert("Authentication failed: " + error.message);
    }
}

/**
 * Handle Traditional Login Form
 */
function setupLoginForm() {
    const loginForm = document.querySelector(".auth-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (e) {
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

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userType })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and user
            saveAuth(data.token, data.user);

            alert(`Login successful! Welcome ${data.user.name}`);
            redirectAfterLogin(data.user.userType);

        } catch (error) {
            console.error("Login error:", error);
            alert(error.message);
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

/**
 * Setup Logout Buttons - FIXED to properly call backend
 */
function setupLogoutButtons() {
    if (!isLoggedIn()) return;

    const navRight = document.querySelector(".nav-right");
    if (!navRight || navRight.querySelector(".logout-btn")) return;

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "btn btn-sm btn-outline-danger logout-btn ms-2";
    logoutBtn.textContent = "Logout";
    logoutBtn.style.fontSize = "12px";

    logoutBtn.addEventListener("click", async function () {
        if (confirm("Are you sure you want to logout?")) {
            try {
                // Call backend logout endpoint
                const token = getAuthToken();
                if (token) {
                    await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                }
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                // Always clear local storage and redirect
                clearAuth();
                
                // Disable Google auto-select if applicable
                if (typeof google !== "undefined") {
                    google.accounts.id.disableAutoSelect();
                }
                
                alert("Logged out successfully");
                window.location.href = "/index.html";
            }
        }
    });

    navRight.appendChild(logoutBtn);
}

/**
 * Setup Google Sign In
 */
function setupGoogleSignIn() {
    window.handleCredentialResponse = handleCredentialResponse;
    
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
        });

        const googleBtn = document.getElementById('googleSignIn');
        if (googleBtn) {
            google.accounts.id.renderButton(googleBtn, {
                theme: 'outline',
                size: 'large',
                width: '100%'
            });
        }
    }
}

/**
 * Update UI based on auth state
 */
function updateAuthUI(user) {
    const loginLink = document.querySelector('a[href="login/login.html"]');
    const postJobBtn = document.querySelector('a[href="login/login.html?as=employer"]');

    if (user) {
        // User is logged in - show user name and logout
        if (loginLink) {
            loginLink.textContent = user.name || user.email;
            loginLink.href = "#";
            loginLink.onclick = (e) => {
                e.preventDefault();
                if (user.userType === 'employer') {
                    window.location.href = 'employer/dashboard.html';
                } else {
                    window.location.href = 'profile/profile.html';
                }
            };
        }
    }
}

/**
 * Redirect after successful login
 */
function redirectAfterLogin(userType) {
    if (userType === 'employer') {
        window.location.href = '../employer/dashboard.html';
    } else {
        window.location.href = '../profile/profile.html';
    }
}

/**
 * Get user type from URL or form
 */
function getUserTypeFromPage() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('as') || 'jobseeker';
}

/**
 * Validate Gmail address
 */
function isValidGmail(email) {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/;
    return gmailRegex.test(email);
}

/**
 * Show error on input
 */
function showError(input, message) {
    input.classList.add('is-invalid');
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    errorDiv.textContent = message;
}

/**
 * Clear error on input
 */
function clearError(input) {
    input.classList.remove('is-invalid');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
        errorDiv.remove();
    }
}

// Make auth functions available globally
window.AuthManager = {
    getAuthToken,
    getCurrentUser,
    isLoggedIn,
    saveAuth,
    clearAuth,
    logout: () => {
        clearAuth();
        window.location.href = '/index.html';
    }
};

console.log("✅ Real backend authentication loaded (MongoDB)");
