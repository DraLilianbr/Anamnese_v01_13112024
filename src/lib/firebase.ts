import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBm8Fy6gUZoBsgitN_-qK6kAZVJwjwQnGM",
  authDomain: "video-avaliacao.firebaseapp.com",
  projectId: "video-avaliacao",
  storageBucket: "video-avaliacao.firebasestorage.app",
  messagingSenderId: "806826686196",
  appId: "1:806826686196:web:3899b7d6a986e49b5c50a1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);