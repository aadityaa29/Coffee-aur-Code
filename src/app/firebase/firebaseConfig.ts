import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Optional

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "coffee-aur-code",
  storageBucket: "coffee-aur-code.appspot.com", // <-- fix typo: should be .appspot.com
  messagingSenderId: "442234220729",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-D055B6FJ83"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Optional

export const db = getFirestore(app);
export const auth = getAuth(app);
