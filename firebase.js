// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKcLM6p24mnCipDcM5IApUlBL5el1Z5sQ",
  authDomain: "compi-bb145.firebaseapp.com",
  projectId: "compi-bb145",
  storageBucket: "compi-bb145.firebasestorage.app",
  messagingSenderId: "523083153005",
  appId: "1:523083153005:web:b941017125ca57464ac964",
  measurementId: "G-T1WZTY910L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);