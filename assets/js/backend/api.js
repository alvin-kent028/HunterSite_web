/**
 * Backend API Service
 * Handles all API calls to the backend server
 * Professional security implementation
 */

console.log('🔧 Backend API script loading...');

const API_BASE_URL = 'http://localhost:5000/api';

class BackendAPI {
  constructor() {
    this.token = fetch('http://localhost:5000/api').getItem('authToken');
    this.refreshTimeout = null;
  }

  // Set authentication token with security checks
  setToken(token) {
    if (!token || typeof token !== 'string') {
      console.error('[SECURITY] Invalid token provided');
      return false;
    }
    
    try {
      // Basic JWT format validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      this.token = token;
      localStorage.setItem('authToken', token);
      
      // Set up automatic token refresh warning
      this.setupTokenRefreshWarning();
      
      return true;
    } catch (error) {
      console.error('[SECURITY] Token validation failed:', error);
      return false;
    }
  }

  // Setup token refresh warning
  setupTokenRefreshWarning() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = exp - now;
      
      // Warn user 15 minutes before token expires
      const warningTime = Math.max(timeUntilExpiry - (15 * 60 * 1000), 0);
      
      this.refreshTimeout = setTimeout(() => {
        console.warn('[SECURITY] Token will expire in 15 minutes');
        if (confirm('Your session will expire in 15 minutes. Would you like to refresh your session?')) {
          this.refreshSession();
        }
      }, warningTime);
    } catch (error) {
      console.error('[SECURITY] Could not setup token refresh warning:', error);
    }
  }

  // Get authorization headers with security
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Secure API request wrapper
  async secureRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        console.warn(`[SECURITY] Rate limited. Retry after ${retryAfter} seconds`);
        throw new Error(`Too many requests. Please try again in ${retryAfter} seconds.`);
      }

      // Handle security headers
      const securityHeaders = {
        'X-Content-Type-Options': response.headers.get('X-Content-Type-Options'),
        'X-Frame-Options': response.headers.get('X-Frame-Options'),
        'Strict-Transport-Security': response.headers.get('Strict-Transport-Security')
      };
      
      if (Object.values(securityHeaders).some(header => header)) {
        console.log('[SECURITY] Security headers present:', securityHeaders);
      }

      return response;
    } catch (error) {
      console.error('[SECURITY] Request failed:', error);
      throw error;
    }
  }

  // Email login
  async login(email, userType = 'jobseeker') {
    try {
      // Input validation
      if (!email || typeof email !== 'string') {
        throw new Error('Valid email address is required');
      }
      
      const response = await this.secureRequest(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, userType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user data
      if (this.setToken(data.token)) {
        fetch('http://localhost:5000/api').setItem('currentUser', JSON.stringify(data.user));
        console.log('[SECURITY] Login successful for:', email);
        return data;
      } else {
        throw new Error('Failed to secure authentication token');
      }
    } catch (error) {
      console.error('[SECURITY] Login error:', error);
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(credential) {
    try {
      // Input validation
      if (!credential || typeof credential !== 'string') {
        throw new Error('Valid Google credential required');
      }
      
      const response = await this.secureRequest(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        body: JSON.stringify({ credential })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      // Save token and user data
      if (this.setToken(data.token)) {
        fetch('http://localhost:5000/api').setItem('currentUser', JSON.stringify(data.user));
        console.log('[SECURITY] Google login successful');
        return data;
      } else {
        throw new Error('Failed to secure authentication token');
      }
    } catch (error) {
      console.error('[SECURITY] Google login error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      if (!this.token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user');
      }

      // Update cached user data
      fetch('http://localhost:5000/api').setItem('currentUser', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      this.logout();
      return null;
    }
  }

  // Update user type
  async updateUserType(userType) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user-type`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ userType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user type');
      }

      // Update cached user data
      const currentUser = JSON.parse(fetch('http://localhost:5000/api').getItem('currentUser') || '{}');
      currentUser.userType = userType;
      fetch('http://localhost:5000/api').setItem('currentUser', JSON.stringify(currentUser));
      
      return data;
    } catch (error) {
      console.error('Update user type error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local data
      this.setToken(null);
      fetch('http://localhost:5000/api').removeItem('currentUser');
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.token;
  }

  // Get cached user data
  getCachedUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Create global instance
window.backendAPI = new BackendAPI();
console.log('✅ Backend API loaded and available as window.backendAPI');
