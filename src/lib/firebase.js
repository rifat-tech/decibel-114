import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const env = import.meta.env;

// Firebase web config is public by design (it only identifies the project);
// access is controlled by firestore.rules. Env vars override it, VITE_DEMO=1 forces demo mode.
const DECIBEL_114 = {
  apiKey: 'AIzaSyCL-AsH4wliraXrGE2zMSOhWsuCM2PThgs',
  authDomain: 'decibel-114.firebaseapp.com',
  projectId: 'decibel-114',
  storageBucket: 'decibel-114.firebasestorage.app',
  messagingSenderId: '200530976366',
  appId: '1:200530976366:web:b7d4bc8ae58ac9025d907f',
};

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || DECIBEL_114.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || DECIBEL_114.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || DECIBEL_114.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || DECIBEL_114.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || DECIBEL_114.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || DECIBEL_114.appId,
};

// Demo mode keeps everything in this browser with sample data (used for previews).
export const DEMO = env.VITE_DEMO === '1';

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
