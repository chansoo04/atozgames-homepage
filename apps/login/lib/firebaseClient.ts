// lib/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// 1) .env에서 가져온 설정으로 초기화
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig); // Firebase App 초기화 :contentReference[oaicite:3]{index=3}
const auth = getAuth(app); // Auth 인스턴스 생성 :contentReference[oaicite:4]{index=4}

// Google, Apple 제공자 설정
const googleProvider = new GoogleAuthProvider(); // Google OAuth :contentReference[oaicite:5]{index=5}
const appleProvider = new OAuthProvider("apple.com"); // Apple OAuth :contentReference[oaicite:6]{index=6}

export { auth, googleProvider, appleProvider };
