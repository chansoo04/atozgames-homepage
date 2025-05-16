"use client";
import { auth, googleProvider, appleProvider } from "lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";

export default function Page() {
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
    <div className="flex flex-col items-center gap-y-10">
      <button className="bg-black text-white" onClick={handleGoogle}>
        Google 로그인
      </button>
      <button className="bg-black text-white" onClick={handleApple}>
        Apple 로그인
      </button>
      <button className="bg-black text-white" onClick={handleKakao}>
        KAKAO 로그인
      </button>
      <button className="bg-black text-white" onClick={handleNaver}>
        NAVER 로그인
      </button>
    </div>
  );
}
