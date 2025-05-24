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
      <TopBar />
      
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-8">
          <img src="/logo.svg" alt="ATOZ" className="h-12" />
        </div>
        
        <div className="w-full max-w-[510px] rounded-[20px] bg-white p-12">
          <textarea 
            className="min-h-[300px] w-full resize-none rounded-lg border border-gray-200 p-4 text-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="문의하기"
          />
        </div>
        
        <button 
          onClick={handleGoogle}
          className="mt-4 w-full max-w-[510px] rounded-lg bg-[#4285F4] px-6 py-3 text-white hover:bg-[#357ABD] transition-colors"
        >
          시작해보기
        </button>
      </div>

      <Footer />
    </main>
  );
}
