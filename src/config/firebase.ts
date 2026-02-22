// FitLog - Firebase Configuration (Hybrid: Modern Auth + Compat Firestore)
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
    Auth
} from 'firebase/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPHM7qg-5us2Cy6GEyDMV-E0yipfpDWcw",
    authDomain: "fitlog-6eda3.firebaseapp.com",
    projectId: "fitlog-6eda3",
    storageBucket: "fitlog-6eda3.firebasestorage.app",
    messagingSenderId: "437866890244",
    appId: "1:437866890244:web:2f7bffb95a0d5a3b01e151",
    measurementId: "G-KKNDVKNRFR"
};

// Initialize Firebase App (Modern SDK)
let app;
let auth: Auth;

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);

    // Initialize Auth with React Native persistence
    if (Platform.OS !== 'web') {
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    } else {
        auth = getAuth(app);
    }
} else {
    app = getApp();
    auth = getAuth(app);
}

// Initialize Compat Firebase for Firestore (other stores use this)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Compat Firestore for existing stores
const db = firebase.firestore();

// Export both modern auth and compat firestore
export { auth, db };
export { firebase }; // For stores that need firebase.firestore.FieldValue
export default app;
