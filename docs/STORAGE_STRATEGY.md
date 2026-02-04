# Storage Strategy Documentation

## Overview

This application uses a hybrid storage approach combining **static JSON files** (read-only defaults) with **localStorage** (user-specific dynamic data).

## Architecture

### 1. Static JSON Files (Read-Only Defaults)

Located in `assets/data/`:

- **`profile.json`**: Complete sample profile with realistic data (Ruby Grace Jasper example)
- **`jobs.json`**: Job listings, categories (updated by system/admin)
- **`user-data-template.json`**: Template showing user-specific data structure

**Purpose**: Provide complete sample data for first-time users and serve as template structure. Contains realistic profile data with skills, experience, education, and completed todo items.

### 2. LocalStorage (User-Specific Dynamic Data)

Stored in browser's localStorage with prefix `huntersite_`:

- **`huntersite_user`**: Current logged-in user info
- **`huntersite_user_profile`**: Complete user profile (overrides profile.json)
- **`huntersite_saved_jobs`**: Jobs saved by user
- **`huntersite_applications`**: Job applications submitted
- **`huntersite_search_history`**: Recent searches (max 10)
- **`huntersite_profile_metadata`**: Timestamps, version, data source tracking

**Purpose**: Persist user-specific changes across sessions.

---

## Data Flow

```
┌─────────────────┐
│   Page Load     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Check localStorage      │
│ for user data?          │
└────┬────────────┬───────┘
     │            │
     │ YES        │ NO
     ▼            ▼
┌─────────┐  ┌──────────────────┐
│ Use     │  │ Load from JSON   │
│ Local   │  │ (first time)     │
│ Storage │  │                  │
└────┬────┘  └────┬─────────────┘
     │            │
     │            ▼
     │       ┌──────────────────┐
     │       │ Save to          │
     │       │ localStorage     │
     │       └────┬─────────────┘
     │            │
     └────────┬───┘
              ▼
     ┌─────────────────┐
     │ Render UI       │
     └─────────────────┘

User Action (edit, save, apply)
              │
              ▼
     ┌─────────────────┐
     │ Update          │
     │ localStorage    │
     └────────┬────────┘
              │
              ▼
     ┌─────────────────┐
     │ Update UI       │
     │ immediately     │
     └─────────────────┘
```

---

## Implementation Guide

### For First-Time Page Load

```javascript
// In profile page or any page needing profile data
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // This automatically checks localStorage first,
    // then loads from JSON if needed
    const profile = await window.StorageManager.loadProfileData();
    
    // Render the profile
    renderProfile(profile);
  } catch (error) {
    console.error('Error loading profile:', error);
  }
});
```

### For Updating User Profile

```javascript
// Full profile update (replaces everything)
function saveCompleteProfile(profileData) {
  const result = window.StorageManager.saveUserProfile(profileData, false);
  
  if (result.success) {
    console.log('Profile saved!');
    updateUI(profileData);
  }
}

// Partial profile update (merges with existing data)
function updateBasicInfo(basicInfoData) {
  const result = window.StorageManager.saveUserProfile(
    { basicInfo: basicInfoData },
    true  // isPartialUpdate = true
  );
  
  if (result.success) {
    console.log('Basic info updated!');
    updateBasicInfoUI(basicInfoData);
  }
}
```

### For Saving Jobs

```javascript
function saveJobForLater(jobData) {
  const result = window.StorageManager.saveJob({
    id: jobData.id,
    title: jobData.title,
    company: jobData.company,
    location: jobData.location,
    salary: jobData.salary,
    type: jobData.type
  });
  
  if (result.success) {
    alert('Job saved!');
    updateSaveButton(jobData.id, true);
  } else {
    alert(result.message); // e.g., "Job already saved"
  }
}
```

### For Job Applications

```javascript
function applyToJob(jobId, jobTitle, company, coverLetter) {
  const result = window.StorageManager.saveApplication(
    jobId,
    jobTitle,
    company
  );
  
  if (result.success) {
    alert('Application submitted!');
    disableApplyButton(jobId);
  } else {
    alert(result.message); // e.g., "You already applied to this job"
  }
}
```

### For Loading Jobs

```javascript
// Jobs are always loaded from JSON (system data)
document.addEventListener('DOMContentLoaded', async () => {
  const jobsData = await window.StorageManager.loadJobsData();
  
  renderJobs(jobsData.jobs);
  renderCategories(jobsData.categories);
  
  // Then check which jobs user has saved/applied to
  const savedJobs = window.StorageManager.getSavedJobs();
  const applications = window.StorageManager.getUserApplications();
  
  markSavedJobs(savedJobs);
  markAppliedJobs(applications);
});
```

---

## Edge Cases & Conflict Resolution

### 1. First-Time User (No localStorage)
**Scenario**: User visits site for first time
**Resolution**: 
- Load default data from `profile.json`
- Save to localStorage for future visits
- User can then modify from this baseline

```javascript
// Handled automatically by loadProfileData()
const profile = await window.StorageManager.loadProfileData();
// First call: loads from JSON, saves to localStorage
// Subsequent calls: loads from localStorage
```

### 2. Conflicting Data (localStorage vs JSON)
**Scenario**: localStorage has old data, JSON has been updated
**Resolution**: 
- **LocalStorage ALWAYS wins** (user data priority)
- User modifications take precedence over system defaults
- JSON only used when localStorage is empty

**Example**: If user edited their name in profile, that edit persists even if `profile.json` changes.

### 3. Corrupted localStorage Data
**Scenario**: localStorage data is malformed/corrupted
**Resolution**:
```javascript
// storage.js handles this automatically
function getFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Corrupted data for ${key}, returning null`);
    return null; // Falls back to JSON defaults
  }
}
```

### 4. Storage Quota Exceeded
**Scenario**: localStorage is full (5-10MB limit)
**Resolution**:
```javascript
// Automatic detection and user notification
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      alert('Storage is full. Please clear some saved data.');
      // Show UI to let user delete old saved jobs/applications
      showStorageManagementModal();
    }
    return false;
  }
}
```

### 5. Partial Profile Updates
**Scenario**: User updates only one section (e.g., basic info)
**Resolution**: Use partial update mode to merge, not replace
```javascript
// Only update basic info, keep everything else
window.StorageManager.saveUserProfile(
  { basicInfo: newBasicInfo },
  true  // isPartialUpdate flag
);
```

### 6. Multiple Browser Tabs
**Scenario**: User has multiple tabs open, edits in one tab
**Resolution**: 
- Each tab reads from localStorage
- Changes in one tab are saved to localStorage
- Other tabs can listen for storage events:

```javascript
// Optional: sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'huntersite_user_profile') {
    console.log('Profile updated in another tab');
    // Reload profile data
    const updatedProfile = window.StorageManager.getUserProfile();
    renderProfile(updatedProfile);
  }
});
```

### 7. User Logs Out
**Scenario**: User logs out, all data should be cleared
**Resolution**:
```javascript
function handleLogout() {
  // Clear all user data
  window.StorageManager.clearAllData();
  
  // Redirect to login
  window.location.href = '/login/login.html';
}
```

### 8. Data Migration (Future Version Changes)
**Scenario**: Storage structure changes in future updates
**Resolution**: Version tracking for migration
```javascript
// storage.js tracks version
const STORAGE_VERSION = "1.0.0";

// Future: check version and migrate if needed
function migrateDataIfNeeded() {
  const storedVersion = localStorage.getItem('huntersite_storage_version');
  
  if (storedVersion !== STORAGE_VERSION) {
    console.log('Migrating data from', storedVersion, 'to', STORAGE_VERSION);
    // Perform migration logic
    migrateFromV1toV2();
  }
}
```

---

## Storage Keys Reference

All keys use prefix `huntersite_` to avoid conflicts:

| Key | Purpose | Type | Max Size |
|-----|---------|------|----------|
| `huntersite_user` | Logged-in user info | Object | ~500 bytes |
| `huntersite_user_profile` | Complete profile data | Object | ~10-50KB |
| `huntersite_saved_jobs` | Saved job listings | Array | ~1-5KB per job |
| `huntersite_applications` | Job applications | Array | ~1-2KB per application |
| `huntersite_search_history` | Recent searches | Array (max 10) | ~2KB |
| `huntersite_profile_metadata` | Update tracking | Object | ~200 bytes |

**Total typical usage**: ~50-100KB for active user

---

## Testing Checklist

### Test Case 1: First-Time User
- [ ] Clear localStorage
- [ ] Visit profile page
- [ ] Verify data loads from JSON
- [ ] Verify data is saved to localStorage
- [ ] Refresh page
- [ ] Verify data loads from localStorage (not JSON)

### Test Case 2: Profile Update
- [ ] Load profile
- [ ] Edit basic info
- [ ] Save
- [ ] Verify localStorage updated
- [ ] Refresh page
- [ ] Verify changes persist

### Test Case 3: Save Job
- [ ] Browse jobs
- [ ] Click "Save Job"
- [ ] Check saved jobs list
- [ ] Verify job appears
- [ ] Refresh page
- [ ] Verify job still saved

### Test Case 4: Apply to Job
- [ ] Open job details
- [ ] Click "Apply"
- [ ] Submit application
- [ ] Check applications list
- [ ] Verify application recorded
- [ ] Try applying again
- [ ] Verify duplicate prevention

### Test Case 5: Storage Full
- [ ] Fill localStorage with dummy data
- [ ] Try saving new data
- [ ] Verify error message shown
- [ ] Clear old data
- [ ] Verify save works

### Test Case 6: Corrupted Data
- [ ] Manually corrupt localStorage data
- [ ] Reload page
- [ ] Verify fallback to JSON defaults
- [ ] Verify no errors thrown

---

## Best Practices

1. **Always use StorageManager API**: Don't directly access localStorage
2. **Check return values**: All save operations return success/failure
3. **Use async for first load**: `loadProfileData()` and `loadJobsData()` are async
4. **Prefer partial updates**: Use `isPartialUpdate` flag when updating sections
5. **Show user feedback**: Always notify user of save success/failure
6. **Handle errors gracefully**: Use try-catch and fallbacks
7. **Keep data minimal**: Only store what's necessary
8. **Validate before save**: Check data structure before persisting

---

## Debug Commands

Open browser console and try:

```javascript
// View storage info
console.table(window.StorageManager.getStorageInfo());

// View saved jobs
console.table(window.StorageManager.getSavedJobs());

// View profile
console.log(window.StorageManager.getUserProfile());

// Clear all data (use with caution!)
window.StorageManager.clearAllData();

// Check if logged in
window.StorageManager.isLoggedIn();

// Get storage keys
console.log(window.StorageManager.STORAGE_KEYS);
```

---

## File Structure

```
hunters.ph.com/
├── assets/
│   ├── data/
│   │   ├── profile.json              # Default profile template
│   │   ├── jobs.json                 # Job listings (system data)
│   │   └── user-data-template.json   # User data structure reference
│   └── js/
│       ├── storage.js                # Storage Manager (this handles everything)
│       ├── profile.js                # Uses StorageManager for profile operations
│       └── jobs.js                   # Uses StorageManager for job operations
├── profile/
│   ├── profile.html                  # Profile edit page
│   └── preview.html                  # Profile preview page
└── STORAGE_STRATEGY.md               # This documentation
```

---

## Summary

**Key Principle**: LocalStorage is the source of truth for user data. JSON files are defaults/templates.

**Data Priority**: `localStorage` > `JSON files` > `default structures`

**When to use what**:
- **First load**: Use `loadProfileData()` or `loadJobsData()`
- **Subsequent reads**: Use `getUserProfile()` or `getSavedJobs()`
- **Updates**: Use `saveUserProfile()`, `saveJob()`, etc.
- **Full reset**: Use `clearAllData()`

This strategy ensures:
✅ Fast performance (localStorage is instant)
✅ Offline capability (data cached locally)
✅ User data persistence (survives page refresh)
✅ Graceful degradation (JSON fallbacks)
✅ Conflict resolution (user data wins)
✅ Easy debugging (clear structure)
