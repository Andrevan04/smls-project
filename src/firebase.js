// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXtb6yA_KwOtB737LbJN2tD43z_CzPQlg",
  authDomain: "smartlibrary-f2e3c.firebaseapp.com",
  projectId: "smartlibrary-f2e3c",
  storageBucket: "smartlibrary-f2e3c.appspot.com",
  messagingSenderId: "956799755564",
  appId: "1:956799755564:web:c6f5075081dbb42cdb7889"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);