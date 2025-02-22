import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvT9acoho-_8eLwm0g3SSTL3awzN1Sohc",
  authDomain: "sample-react-native-d4ee8.firebaseapp.com",
  projectId: "sample-react-native-d4ee8",
  storageBucket: "sample-react-native-d4ee8.appspot.com", // ✅ Fixed this
  messagingSenderId: "419975509168",
  appId: "1:419975509168:web:0f9c229c573f98ba043775",
  measurementId: "G-MGRQEJ0V6Y", // ✅ This is optional, can be removed for React Native
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, setDoc, doc };