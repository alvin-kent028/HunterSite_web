# Testing Guide

This guide helps you test all the new features added to the Hunters.ph job portal.

## Before You Start

1. Open the project in a web browser
2. Open the browser's Developer Console (F12 or Right-click → Inspect → Console)
3. You should see messages like:
   - "💾 Storage Manager loaded"
   - "🔐 Auth system loaded"
   - "💼 Job management loaded"

## Test 1: User Login

### Test Job Seeker Login
1. Go to `login/login.html`
2. Select "Job Seeker" 
3. Enter email: `jobseeker@test.com`
4. Click "Continue"
5. ✅ Should redirect to job listings page
6. ✅ Should show welcome message

### Test Employer Login
1. Go to `login/login.html`
2. Select "Employer"
3. Enter email: `employer@test.com`
4. Click "Continue"
5. ✅ Should redirect to employer dashboard
6. ✅ Should see "Employer Dashboard" card

### Test Admin Login
1. Go to `login/login.html`
2. Select "Admin"
3. Enter email: `admin@test.com`
4. Click "Continue"
5. ✅ Should redirect to admin panel
6. ✅ Should see "Admin Panel" with tabs

### Test Login Errors
1. Try submitting empty email
   - ✅ Should show error message
2. Try invalid email format (e.g., "notanemail")
   - ✅ Should show "Invalid email format"
3. Try "test@" or "@test.com"
   - ✅ Should show error

## Test 2: Saving Jobs (Job Seeker)

### Prerequisites
- Login as a job seeker first

### Steps
1. Go to job listing or home page
2. Find a job card with a heart icon
3. Click the heart icon
4. ✅ Heart should turn red
5. ✅ Should show toast: "Job saved! ❤️"
6. Refresh the page
7. ✅ Heart should still be red (data persisted)

### Test Removing Saved Job
1. Click the red heart again
2. ✅ Heart should turn back to outline
3. ✅ Should show toast: "Job removed from saved list"

### Test Save Without Login
1. Logout (if logout button exists) or clear storage:
   - Console: `localStorage.clear()`
2. Try to save a job
3. ✅ Should show alert: "Please login to save jobs"
4. ✅ Should redirect to login page

## Test 3: Job Applications (Job Seeker)

### Prerequisites
- Login as a job seeker

### Steps
1. Find a job with "Apply" button
2. Click "Apply"
3. ✅ Should show confirmation dialog
4. Click "OK" to confirm
5. ✅ Button should change to "Applied ✓"
6. ✅ Button should be disabled
7. ✅ Should show toast: "Application submitted successfully!"

### Test Double Application
1. Try clicking "Apply" on the same job again
2. ✅ Should show: "You have already applied to this job"

### Test Application Without Login
1. Clear storage: `localStorage.clear()`
2. Try to apply for a job
3. ✅ Should ask to login

## Test 4: Job Search

### Steps
1. Go to home page or job listing
2. Find the search bar
3. Enter a job keyword (e.g., "Developer")
4. Click "Search" or press Enter
5. ✅ Should show toast: "Searching for..."
6. ✅ Jobs should filter (matching jobs shown, others hidden)

### Test Empty Search
1. Leave search field empty
2. Click "Search"
3. ✅ Should show error
4. ✅ Search field should have red border

### Test Search History
1. After searching, check console:
   - Type: `StorageManager.getSearchHistory()`
2. ✅ Should show your recent searches

## Test 5: Employer Dashboard

### Prerequisites
- Login as an employer

### Steps to Post a Job
1. Should see "Employer Dashboard"
2. Click "+ Post New Job"
3. ✅ Form should appear
4. Fill in all required fields:
   - Job Title: "Software Engineer"
   - Company: "Tech Corp"
   - Location: "Manila"
   - Job Type: "Full-time"
   - Description: "We are hiring..."
5. Click "Post Job"
6. ✅ Should show alert: "Job posted successfully!"
7. ✅ Job should appear in "Your Posted Jobs" list
8. ✅ Active Jobs Count should increase

### Test Form Validation
1. Click "+ Post New Job"
2. Leave fields empty
3. Try to submit
4. ✅ Should show validation errors

### Test Delete Job
1. Find a posted job
2. Click "Delete" button
3. ✅ Should ask for confirmation
4. Confirm deletion
5. ✅ Job should disappear
6. ✅ Should show "Job deleted successfully"

## Test 6: Admin Panel

### Prerequisites
- Login as an admin

### Steps
1. Should see "Admin Panel" with tabs
2. Click "Users" tab
3. ✅ Should show user list
4. Click "All Jobs" tab
5. ✅ Should show all posted jobs
6. Click "Statistics" tab
7. ✅ Should show platform stats (Total Jobs, Applications, etc.)

## Test 7: Profile Management

### Prerequisites
- Login with any user type

### Steps
1. Go to profile page
2. ✅ Should see user's name and email
3. Look for "Edit Profile" button (top right)
4. Click "Edit Profile"
5. ✅ Input fields should become editable
6. ✅ Fields should have blue border
7. Change some information (e.g., name)
8. Click "Save Changes"
9. ✅ Should show "Profile saved successfully!"
10. Refresh page
11. ✅ Changes should persist

### Test Saved Jobs in Profile
1. After saving some jobs
2. Go to profile page
3. ✅ Should see "Saved Jobs" section
4. ✅ Should list all saved jobs
5. Click "Remove" on a job
6. ✅ Job should be removed from list

### Test Applications in Profile
1. After applying to jobs
2. Go to profile page
3. ✅ Should see "My Applications" section
4. ✅ Should list all applications
5. ✅ Should show status badges

## Test 8: Error Handling

### Test Storage Quota
1. Open console
2. Try to fill storage:
```javascript
// Try to save a lot of data
for(let i = 0; i < 10000; i++) {
  StorageManager.saveJob({
    id: 'job' + i,
    title: 'Job ' + i,
    company: 'Company ' + i
  });
}
```
3. ✅ Should eventually show storage quota error

### Test Invalid Operations
1. Try to get data before login:
```javascript
StorageManager.getCurrentUser() // Should return null
```
2. ✅ Should handle gracefully (no crash)

## Test 9: Dark Mode

### Steps
1. On any page, look for moon icon (🌙) button
2. Click it
3. ✅ Page should invert colors
4. ✅ Button should change to sun icon (☀️)
5. Click again
6. ✅ Should return to normal

## Test 10: Logout

### Steps
1. Login with any user
2. Look for "Logout" button in navigation
3. Click "Logout"
4. ✅ Should ask for confirmation
5. Confirm logout
6. ✅ Should show "Logged out successfully"
7. ✅ Should redirect to login page
8. ✅ User data should be cleared

## Verify in Console

You can check data in the browser console:

```javascript
// Check current user
StorageManager.getCurrentUser()

// Check saved jobs
StorageManager.getSavedJobs()

// Check applications
StorageManager.getUserApplications()

// Check profile
StorageManager.getUserProfile()

// Check search history
StorageManager.getSearchHistory()

// Clear all data
StorageManager.clearAllData()
```

## Common Issues and Solutions

### Issue: "StorageManager is not defined"
**Solution:** Make sure `storage.js` is loaded before other scripts

### Issue: Features not working
**Solution:** 
1. Check console for errors
2. Make sure you're logged in
3. Clear browser cache and reload

### Issue: Data not persisting
**Solution:** 
1. Check if cookies/storage are enabled
2. Don't use private/incognito mode
3. Check browser storage in DevTools → Application → Local Storage

### Issue: Buttons not responding
**Solution:**
1. Check console for JavaScript errors
2. Make sure Bootstrap is loaded
3. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Data persists after refresh
✅ Error messages show correctly
✅ All user types work properly
✅ Features work as expected

## Notes

- This project uses localStorage, so data is only saved in your browser
- Clearing browser data will delete all saved information
- Each user type has different features
- All features have error handling
- Forms validate inputs before submission
