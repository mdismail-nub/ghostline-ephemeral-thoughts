import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously, type User } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

let authPromise: Promise<User | null> | null = null;

/**
 * Attempts anonymous authentication non-blockingly if supported by project.
 * Unsaid works seamlessly with client-stored anonymous creator tokens so it
 * does not block Firestore operations if anonymous auth is restricted.
 */
export async function ensureAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (!authPromise) {
    authPromise = (async () => {
      try {
        const cred = await signInAnonymously(auth);
        return cred.user;
      } catch (err) {
        // Project may have anonymous auth restricted; graceful fallback
        return null;
      }
    })();
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
