/**
 * Backend API Service
 * Handles all API calls to the backend server
 */

const API_BASE_URL = 'http://localhost:5000/api';

class BackendAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authorization headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Email login
  async login(email, userType = 'jobseeker') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, userType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save token and user data
      this.setToken(data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google OAuth login
  async googleLogin(credential) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ credential })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      // Save token and user data
      this.setToken(data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Google login error:', error);
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
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
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
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.userType = userType;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
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
      localStorage.removeItem('currentUser');
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
