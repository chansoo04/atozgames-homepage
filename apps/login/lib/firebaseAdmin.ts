import "server-only"; // 이 모듈은 서버에서만 로드되도록 보장 (Next.js)
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"); // ← Vercel 줄바꿈 복원
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

if (!projectId || !clientEmail || !privateKey) {
  // 배포 전 필수 체크(로그/에러 처리)
  console.warn(
    "[firebase-admin] Missing required env. Check FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY",
  );
}

function initAdminApp(): App {
  const apps = getApps();
  if (apps.length) return apps[0];
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket, // 옵션
  });
}

const adminApp = initAdminApp();

// 서비스 핸들들 export
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminBucket = getStorage(adminApp).bucket();
