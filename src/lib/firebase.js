import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// No keys → the whole site runs on sample data stored in this browser.
export const DEMO = !firebaseConfig.apiKey || !firebaseConfig.projectId;

export const app = DEMO ? null : initializeApp(firebaseConfig);
export const auth = DEMO ? null : getAuth(app);
// Local cache means repeat visits re-use documents instead of spending free reads.
export const fs = DEMO
  ? null
  : initializeFirestore(app, { ignoreUndefinedProperties: true, localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });

// A throwaway second Firebase app lets an admin create someone else's login
// without being signed out of their own session (works on the free Spark plan).
export async function withSecondaryAuth(fn) {
  const secondary = initializeApp(firebaseConfig, 'secondary-' + Date.now());
  try {
    return await fn(getAuth(secondary));
  } finally {
    await deleteApp(secondary).catch(() => {});
  }
}
