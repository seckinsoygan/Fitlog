// FitLog - Firebase Configuration (Compat Mode for Expo)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Initialize services
export const auth = firebase.auth();
export const db = firebase.firestore();

export default firebase;
