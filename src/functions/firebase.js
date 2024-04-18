// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const getUserType = async () => {
  if (!auth.currentUser) {
    // console.log("User not logged in");
    return;
  }
  const userRef = collection(db, "user");
  const q = query(userRef, where("userID", "==", auth.currentUser.uid));
  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    // console.log(doc.data().type);
    return doc.data().type;
  }
};

const firebaseConfig = {
  apiKey: "AIzaSyD2xL5ppcxerqW2Y5KGmjvGHZbAp6odpPA",
  authDomain: "earnnlearn-3a069.firebaseapp.com",
  projectId: "earnnlearn-3a069",
  storageBucket: "earnnlearn-3a069.appspot.com",
  messagingSenderId: "724990203918",
  appId: "1:724990203918:web:aae64e36623777af84845f",
  measurementId: "G-FT308BT96G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const secondApp = initializeApp(firebaseConfig, "Secondary");
export const auth = getAuth(app);
export const profileAuth = getAuth(secondApp);
export const db = getFirestore(app);
