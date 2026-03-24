/**
 * Firebase Storage Utility
 * Reusable functions for uploading, downloading, and deleting files
 */

import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from "firebase/storage";
import { storage } from "./config.js";

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'users/userId/resumes/filename.pdf')
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with download URL
 */
export const uploadFile = async (file, path, options = {}) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (default 10MB limit)
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Validate file type if provided
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }

    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Add metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: options.uploadedBy || 'anonymous',
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        ...options.metadata
      }
    };

    console.log(`📤 Uploading file: ${file.name} to ${path}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Get file metadata
    const fileMetadata = await getMetadata(snapshot.ref);
    
    const result = {
      success: true,
      downloadURL,
      path: snapshot.ref.fullPath,
      name: snapshot.ref.name,
      size: fileMetadata.size,
      type: fileMetadata.contentType,
      metadata: fileMetadata.customMetadata,
      uploadedAt: new Date().toISOString()
    };

    console.log('✅ File uploaded successfully:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Download a file from Firebase Storage
 * @param {string} path - The storage path
 * @returns {Promise<string>} - Download URL
 */
export const downloadFile = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log(`📥 File download URL generated for: ${path}`);
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw new Error(`Download failed: ${error.message}`);
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The storage path
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    console.log(`🗑️ File deleted successfully: ${path}`);
    return true;
    
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * List all files in a directory
 * @param {string} path - The directory path
 * @returns {Promise<Array>} - Array of file references
 */
export const listFiles = async (path) => {
  try {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized');
    }

    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            size: metadata.size,
            type: metadata.contentType,
            downloadURL,
            metadata: metadata.customMetadata,
            uploadedAt: metadata.timeCreated
          };
        } catch (error) {
          console.error(`Error getting metadata for ${itemRef.name}:`, error);
          return null;
        }
      })
    );

    const validFiles = files.filter(file => file !== null);
    console.log(`📁 Found ${validFiles.length} files in ${path}`);
    
    return validFiles;
    
  } catch (error) {
    console.error('❌ List files failed:', error);
    throw new Error(`List files failed: ${error.message}`);
  }
};

/**
 * Upload a user profile picture
 * @param {File} file - The image file
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Upload result
 */
export const uploadProfilePicture = async (file, userId) => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `profile_${Date.now()}.${fileExtension}`;
  const path = `users/${userId}/profile/${fileName}`;
  
  return uploadFile(file, path, {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    metadata: {
      type: 'profile_picture'
    }
  });
};

/**
 * Upload a resume file
 * @param {File} file - The resume file
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Upload result
 */
export const uploadResume = async (file, userId) => {
  const fileName = `resume_${Date.now()}_${file.name}`;
  const path = `users/${userId}/resumes/${fileName}`;
  
  return uploadFile(file, path, {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    metadata: {
      type: 'resume'
    }
  });
};

/**
 * Upload a company logo
 * @param {File} file - The image file
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} - Upload result
 */
export const uploadCompanyLogo = async (file, companyId) => {
  const fileExtension = file.name.split('.').pop();
  const fileName = `logo_${Date.now()}.${fileExtension}`;
  const path = `companies/${companyId}/logo/${fileName}`;
  
  return uploadFile(file, path, {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSize: 2 * 1024 * 1024, // 2MB
    metadata: {
      type: 'company_logo'
    }
  });
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Human readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if Firebase Storage is available
 * @returns {boolean} - Storage availability
 */
export const isStorageAvailable = () => {
  return storage !== null;
};

// Export all functions
export default {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  uploadProfilePicture,
  uploadResume,
  uploadCompanyLogo,
  formatFileSize,
  isStorageAvailable
};
