import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAig5NZUSZQBpvc3mQk4TfuCOfVr2DfaUE",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokeronlinev2"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokeronlinev2",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "pokeronlinev2"}.firebasestorage.app`,
  messagingSenderId: "550772836623",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:550772836623:web:96ebcf43ade04b9aa8967a",
  measurementId: "G-Z8HC47ZFGM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail(email: string, password: string, username: string) {
  // Check if username is unique
  const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
  const usernameSnapshot = await getDocs(usernameQuery);
  
  if (!usernameSnapshot.empty) {
    throw new Error('Username already exists');
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create user document in Firestore
  const userData = {
    username,
    email,
    firebaseUid: credential.user.uid,
    currentRank: "Bronze I",
    mmr: 800,
    level: 1,
    totalWins: 0,
    totalGames: 0,
    seasonWins: 0,
    placementMatches: 0,
    highestRank: "Bronze I",
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), userData);
  
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  
  // Check if user document exists
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  
  if (!userDoc.exists()) {
    // New Google user, need to get username
    return { user: result.user, needsUsername: true };
  }
  
  return { user: result.user, needsUsername: false };
}

export async function createGoogleUserProfile(user: FirebaseUser, username: string) {
  // Check if username is unique
  const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
  const usernameSnapshot = await getDocs(usernameQuery);
  
  if (!usernameSnapshot.empty) {
    throw new Error('Username already exists');
  }

  const userData = {
    username,
    email: user.email || undefined,
    firebaseUid: user.uid,
    currentRank: "Bronze I",
    mmr: 800,
    level: 1,
    totalWins: 0,
    totalGames: 0,
    seasonWins: 0,
    placementMatches: 0,
    highestRank: "Bronze I",
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);
}

export async function getUserData(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
}
