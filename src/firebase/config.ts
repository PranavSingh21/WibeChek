// Firebase configuration
// Replace with your actual Firebase config object
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDighpgMZjMI07zPLOB-Te3FB08H0Kt1o0",
  authDomain: "wibechek-43749.firebaseapp.com",
  projectId: "wibechek-43749",
  storageBucket: "wibechek-43749.firebasestorage.app",
  messagingSenderId: "167404750504",
  appId: "1:167404750504:web:6cbe9c8498b9c5c652e49d",
  measurementId: "G-BNDHV7K72B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;