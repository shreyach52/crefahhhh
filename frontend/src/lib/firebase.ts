import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  : {
      apiKey: "mock-api-key",
      authDomain: "mock-auth-domain",
      projectId: "crefah-mock",
      storageBucket: "mock-storage-bucket",
      messagingSenderId: "mock-sender-id",
      appId: "mock-app-id"
    };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
