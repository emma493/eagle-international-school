import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

export { app, auth };
export type { User };

export { signInWithEmailAndPassword, createUserWithEmailAndPassword };

export function normalizeLoginIdentifier(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  // Ghanaian phone normalization: 024XXXXXXX -> 23324XXXXXXX@school.local
  const digits = trimmed.replace(/\D/g, "");
  let normalized = digits;
  if (normalized.startsWith("0")) {
    normalized = "233" + normalized.slice(1);
  } else if (!normalized.startsWith("233")) {
    normalized = "233" + normalized;
  }
  return `${normalized}@school.local`;
}
