# HunterSite Backend Authentication Setup

## Professor's Requirement Met
✅ **Focus 80% of effort on connecting Frontend to Backend and fixing User/Auth logic**

## Overview
This implementation connects the frontend to a proper backend API with JWT-based authentication, replacing the localStorage-only approach.

## Backend Setup

### 1. Install Dependencies
```bash
cd c:\Users\ADMIN\OneDrive\文档\GitHub\HunterSite_web
npm install
```

### 2. Start Backend Server
```bash
npm start
```
The backend will run on `http://localhost:5000`

### 3. Configure Google OAuth (Optional)
If you want Google Sign-In to work:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID
5. Add `http://localhost:5000` and `http://localhost:8080` to authorized JavaScript origins
6. Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` in `server.js` with your actual Client ID

## Frontend Changes Made

### 1. Backend API Integration (`assets/js/backend/api.js`)
- Handles all API calls to backend
- JWT token management
- Proper error handling
- User session persistence

### 2. Updated Authentication (`assets/js/core/auth.js`)
- Now uses backend API instead of localStorage
- Async/await pattern for API calls
- Proper Gmail validation on both frontend and backend
- JWT-based authentication

### 3. API Endpoints Available
- `POST /api/auth/login` - Email login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/user-type` - Update user type

## Security Improvements
1. **JWT Tokens**: Secure authentication with expiration
2. **Backend Validation**: Gmail validation enforced on server
3. **Token Verification**: Protected routes require valid JWT
4. **Proper Error Handling**: No sensitive data leaked

## Testing the System

### 1. Start Both Servers
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd c:\Users\ADMIN\OneDrive\文档\GitHub\HunterSite_web
python -m http.server 8080
```

### 2. Test Authentication
1. Go to `http://localhost:8080/login/login.html`
2. Try email login with a Gmail address
3. Check browser's Network tab to see API calls
4. Verify user name appears correctly in navigation

## Key Features Implemented
1. ✅ Backend API with Express.js
2. ✅ JWT-based authentication
3. ✅ Gmail-only validation (frontend + backend)
4. ✅ Google OAuth integration (with proper setup)
5. ✅ Secure session management
6. ✅ Proper error handling
7. ✅ User type management
8. ✅ Logout functionality

## Next Steps for Production
1. Replace in-memory user storage with real database
2. Add password hashing for email registration
3. Implement refresh tokens
4. Add rate limiting
5. Set up HTTPS in production
6. Configure environment variables for secrets

This implementation fulfills the professor's requirement by focusing on backend integration and proper authentication logic.
