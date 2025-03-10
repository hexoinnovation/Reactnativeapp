import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {  getFirestore,
  doc,
  setDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  getDoc, } from "firebase/firestore";
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
const storage = getStorage(app); // Firebase Storage
export { app, // Export the app instance
  auth,
  db,
  storage,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getDoc,
  limit,
  orderBy,
  query,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setDoc,
  doc,
  collection,
  deleteDoc,
  getDocs, };