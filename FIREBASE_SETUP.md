# 🔥 Firebase Storage Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install firebase
```

### 2. Environment Configuration
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase credentials
```

### 3. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable **Storage** for your project
4. Go to **Project Settings** → **General** → **Your apps**
5. Click **Web app** to get your configuration
6. Copy the values to your `.env` file (add `VITE_` prefix)

### 4. Storage Security Rules
In Firebase Console → Storage → Rules, add:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public files (like company logos) can be read by anyone
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Company files - only company members can access
    match /companies/{companyId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.companyId == companyId;
    }
  }
}
```

## Usage Examples

### Import Firebase Storage
```javascript
import { 
  uploadFile, 
  downloadFile, 
  deleteFile, 
  uploadProfilePicture,
  uploadResume 
} from '../assets/js/firebase/storage.js';
```

### Upload a Profile Picture
```javascript
const handleProfileUpload = async (file, userId) => {
  try {
    const result = await uploadProfilePicture(file, userId);
    console.log('Profile picture uploaded:', result.downloadURL);
    
    // Save the URL to user profile
    await updateUserProfile(userId, { 
      profilePicture: result.downloadURL 
    });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload profile picture');
  }
};
```

### Upload a Resume
```javascript
const handleResumeUpload = async (file, userId) => {
  try {
    const result = await uploadResume(file, userId);
    console.log('Resume uploaded:', result);
    
    // Save resume info to user profile
    await updateUserProfile(userId, {
      resume: {
        url: result.downloadURL,
        name: result.name,
        size: result.size,
        uploadedAt: result.uploadedAt
      }
    });
  } catch (error) {
    console.error('Resume upload failed:', error);
    alert('Failed to upload resume');
  }
};
```

### Download and Display a File
```javascript
const displayUserResume = async (userId, resumePath) => {
  try {
    const downloadURL = await downloadFile(resumePath);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = 'resume.pdf';
    link.textContent = 'Download Resume';
    document.body.appendChild(link);
    
  } catch (error) {
    console.error('Failed to download resume:', error);
  }
};
```

### Delete a File
```javascript
const deleteProfilePicture = async (userId, picturePath) => {
  try {
    await deleteFile(picturePath);
    
    // Update user profile to remove picture
    await updateUserProfile(userId, { profilePicture: null });
    
    console.log('Profile picture deleted successfully');
  } catch (error) {
    console.error('Failed to delete profile picture:', error);
  }
};
```

### List User Files
```javascript
const listUserResumes = async (userId) => {
  try {
    const resumes = await listFiles(`users/${userId}/resumes/`);
    console.log('User resumes:', resumes);
    
    // Display resumes in UI
    resumes.forEach(resume => {
      console.log(`${resume.name} (${formatFileSize(resume.size)})`);
    });
    
    return resumes;
  } catch (error) {
    console.error('Failed to list resumes:', error);
    return [];
  }
};
```

## File Upload Form Example

```html
<form id="profile-upload-form">
  <div class="mb-3">
    <label for="profile-picture" class="form-label">Profile Picture</label>
    <input type="file" class="form-control" id="profile-picture" 
           accept="image/jpeg,image/png,image/webp">
    <div class="form-text">Max size: 5MB. Formats: JPG, PNG, WebP</div>
  </div>
  
  <div class="mb-3">
    <label for="resume" class="form-label">Resume</label>
    <input type="file" class="form-control" id="resume" 
           accept=".pdf,.doc,.docx">
    <div class="form-text">Max size: 10MB. Formats: PDF, DOC, DOCX</div>
  </div>
  
  <button type="submit" class="btn btn-primary">Upload Files</button>
</form>

<div id="upload-progress" class="d-none">
  <div class="progress">
    <div class="progress-bar" role="progressbar"></div>
  </div>
</div>
```

```javascript
document.getElementById('profile-upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const profilePic = document.getElementById('profile-picture').files[0];
  const resume = document.getElementById('resume').files[0];
  const userId = getCurrentUser().id; // Get from your auth system
  
  try {
    if (profilePic) {
      await uploadProfilePicture(profilePic, userId);
    }
    
    if (resume) {
      await uploadResume(resume, userId);
    }
    
    alert('Files uploaded successfully!');
    e.target.reset();
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload files. Please try again.');
  }
});
```

## Features Included

✅ **File Upload** with validation and metadata
✅ **File Download** with URL generation
✅ **File Deletion** with error handling
✅ **Directory Listing** for user files
✅ **Specialized Upload Functions**:
   - Profile pictures (images only, 5MB max)
   - Resumes (PDF/DOC only, 10MB max)
   - Company logos (images only, 2MB max)
✅ **Security Rules** for access control
✅ **Error Handling** and logging
✅ **File Size Formatting** utilities
✅ **Environment Variable Support**

## Security Best Practices

1. **Never expose** your Firebase credentials in frontend code
2. **Use security rules** to control access
3. **Validate file types** and sizes on upload
4. **Use user IDs** in file paths for isolation
5. **Set appropriate CORS rules** in Firebase Console
6. **Monitor storage usage** and set alerts

## Production Checklist

- [ ] Configure proper security rules
- [ ] Set up storage usage alerts
- [ ] Enable backup for important files
- [ ] Test file upload/download thoroughly
- [ ] Set up CDN if needed for performance
- [ ] Monitor for abuse and unusual activity

Your Firebase Storage is now ready to use! 🚀
