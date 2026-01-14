import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzILHoIr4venYXTi_s79i0kP5CRwpSoyI",
  authDomain: "giay-762b5.firebaseapp.com",
  projectId: "giay-762b5",
  storageBucket: "giay-762b5.appspot.com",
  messagingSenderId: "335242184462",
  appId: "1:335242184462:web:90b980780839ad6ec9795f",
};

// 🔥 Tránh initialize nhiều lần (Expo hot reload)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ Firebase Auth
export const auth = getAuth(app);

// ✅ Firestore
export const db = getFirestore(app);

// ✅ Firebase Storage
export const storage = getStorage(app);
