import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

let authPromise: Promise<User> | null = null;

export function ensureAnonymousAuth(): Promise<User> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  if (!authPromise) {
    authPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            unsubscribe();
            resolve(cred.user);
          } catch (err) {
            unsubscribe();
            // Don't keep broken promise forever
            authPromise = null;
            reject(err);
          }
        }
      });
    });
  }
  return authPromise;
}

// Test initial connection per guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firestore connection check: offline or connecting");
    }
  }
}
