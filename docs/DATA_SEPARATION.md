# Data Separation: Employer vs Job Seeker

## Overview
Complete separation of localStorage data between employers and job seekers to prevent data contamination and ensure proper user experience.

## Storage Keys

### Job Seeker Specific Keys
- `JOBSEEKER_SAVED_JOBS` - Jobs saved by job seekers
- `JOBSEEKER_APPLICATIONS` - Applications submitted by job seekers
- `JOBSEEKER_PROFILE` - Job seeker profile data

### Employer Specific Keys
- `EMPLOYER_JOBS` - Jobs posted by employers
- `EMPLOYER_PROFILE` - Employer profile data
- `EMPLOYER_COMPANY_INFO` - Company information for employers

### Common Keys (Both User Types)
- `USER` - Current logged-in user info
- `USERS` - All registered users
- `PROFILE_METADATA` - Profile update metadata

## Modified Functions

### 1. logoutUser()
**Change**: Clears only user-type-specific data on logout
- Job seekers: Removes saved jobs, applications, and profile
- Employers: Removes profile and company info (keeps posted jobs)
- Both: Removes current user session

### 2. getSavedJobs()
**Change**: Only returns data for job seekers
- Returns empty array if user is not a job seeker
- Uses `JOBSEEKER_SAVED_JOBS` storage key

### 3. saveJob()
**Change**: Only allows job seekers to save jobs
- Validates user type is "jobseeker"
- Returns error message if employer tries to save jobs
- Tracks `savedBy` email for each saved job

### 4. removeSavedJob()
**Change**: Only allows job seekers to remove saved jobs
- Validates user type is "jobseeker"
- Returns error message if non-job seeker tries to remove

### 5. saveApplication()
**Change**: Only allows job seekers to submit applications
- Validates user type is "jobseeker"
- Uses `JOBSEEKER_APPLICATIONS` storage key
- Tracks `appliedBy` email for each application

### 6. getUserProfile()
**Change**: Returns user-type-specific profile
- Employers: Uses `EMPLOYER_PROFILE` key
- Job seekers: Uses `JOBSEEKER_PROFILE` key (default)

### 7. saveUserProfile()
**Change**: Saves to user-type-specific profile
- Employers: Saves to `EMPLOYER_PROFILE` key
- Job seekers: Saves to `JOBSEEKER_PROFILE` key (default)
- Adds `userType` to profile metadata

## Validation Logic

All user-type-specific functions now follow this pattern:

```javascript
const user = getCurrentUser();

// Check if user is logged in
if (!user) {
  return { success: false, message: "User not logged in" };
}

// Check if user has correct type
if (user.userType !== "jobseeker") {
  return { success: false, message: "Only job seekers can..." };
}

// Proceed with operation...
```

## Testing Checklist

### Job Seeker Login Test
- [ ] Can save jobs
- [ ] Can remove saved jobs
- [ ] Can submit applications
- [ ] Saved jobs persist after refresh
- [ ] Applications persist after refresh
- [ ] Profile saves correctly
- [ ] Logout clears job seeker data only

### Employer Login Test
- [ ] Cannot save jobs (shows error)
- [ ] Cannot submit applications (shows error)
- [ ] Can post jobs
- [ ] Posted jobs persist after refresh
- [ ] Profile saves correctly
- [ ] Logout clears employer data (keeps posted jobs)

### Cross-Contamination Test
1. Login as job seeker
2. Save some jobs
3. Logout
4. Login as employer
5. Verify saved jobs are not visible/accessible
6. Logout
7. Login as original job seeker
8. Verify saved jobs are still there

## Migration Notes

### Old Keys (Deprecated)
- `huntersite_saved_jobs` → Use `JOBSEEKER_SAVED_JOBS`
- `huntersite_applications` → Use `JOBSEEKER_APPLICATIONS`
- `huntersite_profile` → Use `JOBSEEKER_PROFILE` or `EMPLOYER_PROFILE`

### Backward Compatibility
The old keys are still defined in `STORAGE_KEYS` for backward compatibility, but all new code should use the user-type-specific keys.

## File Organization

All storage-related code is now in:
```
/assets/js/core/storage.js
```

This is part of the new JavaScript file organization:
- `core/` - Core functionality (auth, storage, utils, header)
- `employer/` - Employer-specific features
- `job-seeker/` - Job seeker-specific features
- `modules/` - Reusable UI modules

## Next Steps

1. Update all HTML files to use new JS file paths
2. Add logout button to header component
3. Display employer account details in dashboard
4. Test complete data separation with multiple user types
5. Remove deprecated storage keys after full migration
