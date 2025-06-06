import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Optional

const firebaseConfig = {
  apiKey: "AIzaSyBmFnVgbHhP8B4eKtawQ77i55RUhKRDgbM",
  authDomain: "coffee-aur-code.firebaseapp.com",
  projectId: "coffee-aur-code",
  storageBucket: "coffee-aur-code.appspot.com", // <-- fix typo: should be .appspot.com
  messagingSenderId: "442234220729",
  appId: "1:442234220729:web:1586bc79f1512e212cab68",
  measurementId: "G-D055B6FJ83"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Optional

export const db = getFirestore(app);
export const auth = getAuth(app);
