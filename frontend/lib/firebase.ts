import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const requiredFirebaseValues = {
  NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
};

const missingFirebaseKeys = Object.entries(requiredFirebaseValues)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const isFirebaseConfigured = missingFirebaseKeys.length === 0;

if (!isFirebaseConfigured && process.env.NODE_ENV !== "production") {
  console.warn(
    `Firebase disabled: missing env vars ${missingFirebaseKeys.join(", ")}. Auth features will be unavailable until configured.`
  );
}

// Initialize Firebase only when required env vars are present.
const app = isFirebaseConfigured ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)) : null;

let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (app) {
  try {
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase Auth initialization failed. Verify NEXT_PUBLIC_FIREBASE_API_KEY and related Firebase env vars.", error);
  }
}

// Initialize Analytics securely (only runs in the browser, prevents SSR crashing)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (app && typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

const signInWithGoogle = async (): Promise<boolean> => {
  if (!auth || !googleProvider) {
    console.warn("Firebase Auth is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
    return false;
  }
  await signInWithPopup(auth, googleProvider);
  return true;
};

const signOutUser = async () => {
  if (!auth) {
    return;
  }
  await firebaseSignOut(auth);
};

export { auth, analytics, isFirebaseConfigured, subscribeToAuthChanges, signInWithGoogle, signOutUser };
export type { User };
