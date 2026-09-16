import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqWg4r46rvhwLnSFOKKx6a-qd5YsciVQU",
  authDomain: "kongshan-carpool.firebaseapp.com",
  projectId: "kongshan-carpool",
  storageBucket: "kongshan-carpool.firebasestorage.app",
  messagingSenderId: "659701250002",
  appId: "1:659701250002:web:68f21e6a5c1ce684813a0b",
  measurementId: "G-SFFFPNKHPX"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
