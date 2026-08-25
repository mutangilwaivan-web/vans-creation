import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with custom database ID if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth with Local Storage Persistence
export const auth = getAuth(app);

// Set persistent auth so users are remembered across sessions without repetitive logins
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('Firebase auth persistence setting notice:', err);
  });
} catch (e) {
  console.warn('Firebase setPersistence fallback:', e);
}

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signInAnonymously, 
  signOut, 
  onAuthStateChanged 
};
export type { User };

// Graceful connection check
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'studio_settings'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase is operating in local/offline mode.');
    }
    return false;
  }
}

export default app;

