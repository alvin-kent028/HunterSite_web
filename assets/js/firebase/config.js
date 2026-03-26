/**
 * Firebase Configuration
 * Initialize Firebase with environment variables
 */

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration missing:', missingFields);
    console.error('Please check your .env file and ensure all required Firebase environment variables are set.');
    return false;
  }

  console.log('✅ Firebase configuration validated successfully');
  return true;
};

// Initialize Firebase
let app;
let storage;
let auth;
let db;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('🔥 Firebase initialized successfully');
  } else {
    throw new Error('Firebase configuration is invalid');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  // In development, provide a mock storage for testing
  if (import.meta.env.DEV) {
    console.warn('⚠️ Running in development mode with mock Firebase');
    storage = null;
    auth = null;
    db = null;
  }
}

export { app, storage, auth, db };
export default app;
