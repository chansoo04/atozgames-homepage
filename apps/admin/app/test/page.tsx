"use client";
import { useEffect, useContext } from "react";
import { AuthContext } from "app/AuthProvider";
import { auth, googleProvider, appleProvider } from "lib/firebaseClient";
import { signInWithPopup, signOut } from "firebase/auth";
import Footer from "app/_components/Footer";
import TopBar from "app/_components/TopBar";

export default function Page() {
  const context = useContext(AuthContext);

  useEffect(() => {
    // console.log(context, "context");
    signOut(auth);
  }, [context]);

  const handleGoogle = async () => {
    try {
      const hi = await signInWithPopup(auth, googleProvider);
      console.log(hi, "google"); // -> 이거를 문회님 서버로 보내면 됨
      // 로그인 성공 후 로직
    } catch (err) {
      console.error("Google 로그인 실패:", err);
    }
  };

  const handleApple = async () => {
    try {
      const hi = await signInWithPopup(auth, appleProvider);
      console.log(hi, "apple");
      // 로그인 성공 후 로직
    } catch (err) {
      console.error("Apple 로그인 실패:", err);
    }
  };

  const handleKakao = () => {
    window.location.href = "/api/oauth/kakao/login";
  };

  const handleNaver = () => {
    window.location.href = "/api/oauth/naver/login";
  };

  return (
    <main className="relative min-h-screen w-full bg-[url('/bg_desktop.png')] bg-cover bg-center">
      <div>TEST</div>
    </main>
  );
}
