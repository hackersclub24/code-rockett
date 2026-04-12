import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBjYoazLxWbaMyjMR0M9e2ua3BhbiyvkbE",
  authDomain: "coding-rockett.firebaseapp.com",
  projectId: "coding-rockett",
  storageBucket: "coding-rockett.firebasestorage.app",
  messagingSenderId: "242633591199",
  appId: "1:242633591199:web:7438a21b8fdb76e0b555aa",
  measurementId: "G-8BKSL83X64",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
