"use client";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Link from "next/link";
import Image from "next/image";
import { setCookie, getCookies, getCookie } from "cookies-next";
import { useSearchParams } from "next/navigation";

import { auth, googleProvider, appleProvider } from "lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";

export default function Page() {
  const searchParams = useSearchParams();

  const handleGoogle = async () => {
    try {
      const googleAuth = await signInWithPopup(auth, googleProvider);

      // 로그인 성공 후 로직
      const response = await fetch("api/oauth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleAuth),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();

      if (data.result === "success") {
        // TODO: 해당 토큰과 uid를 가지고 서버 요청 발송 전 verify 필요
        // TODO: 해당 uid를 가지고 서버 통신 시 매번 꺼내써야 함
        setCookie("token", data.token);
        setCookie("uid", data.uid);
        setCookie("account_id", data.account_id);

        // 기존 위치로 리다이렉션
        window.location.href = searchParams.get("redirect_uri") ?? "/";
      }
    } catch (err) {
      alert((err as any)?.message ?? "구글 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  const handleApple = async () => {
    try {
      const appleAuth = await signInWithPopup(auth, appleProvider);

      // 로그인 성공 후 로직
      const response = await fetch("api/oauth/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appleAuth),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();

      if (data.result === "success") {
        // TODO: 해당 토큰과 uid를 가지고 서버 요청 발송 전 verify 필요
        // TODO: 해당 uid를 가지고 서버 통신 시 매번 꺼내써야 함
        setCookie("token", data.token);
        setCookie("uid", data.uid);
        setCookie("account_id", data.account_id);

        // 기존 위치로 리다이렉션
        window.location.href = searchParams.get("redirect_uri") ?? "/";
      }
    } catch (err) {
      alert((err as any)?.message ?? "애플 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  const handleKakao = () => {
    window.location.href = "/api/oauth/kakao/login";
  };

  const handleNaver = () => {
    window.location.href = "/api/oauth/naver/login";
  };

  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex min-h-[90vh] flex-col items-center pb-10 pt-[92px] desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <TopBar />
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">로그인</h1>

        <div className="w-full px-5">
          <div className="mt-20 flex flex-col items-center gap-y-5">
            <Image
              onClick={() =>
                (window.location.href = `/login/atoz?redirect_uri=${searchParams.get("redirect_uri") ?? "/"}`)
              }
              src="/atoz_login.png"
              width={400}
              height={61}
              alt="아토즈 로그인"
              className="cursor-pointer"
            />
            <Image
              onClick={() => handleGoogle()}
              className="cursor-pointer"
              src="/google_login.png"
              width={400}
              height={61}
              alt="구글 로그인"
            />
            <Image
              onClick={() => handleApple()}
              className="cursor-pointer"
              src="/apple_login.png"
              width={400}
              height={61}
              alt="애플 로그인"
            />
            <Image
              onClick={() => handleKakao()}
              src="/kakao_login.png"
              width={400}
              height={61}
              alt="카카오 로그인"
            />
            <Image
              onClick={() => handleNaver()}
              src="/naver_login.png"
              width={400}
              height={61}
              alt="네이버 로그인"
            />
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            로그인
          </h1>

          <div className="desktop:mt-20 desktop:flex desktop:flex-col desktop:items-center desktop:gap-y-5">
            <Image
              onClick={() =>
                (window.location.href = `/login/atoz?redirect_uri=${searchParams.get("redirect_uri") ?? "/"}`)
              }
              src="/atoz_login.png"
              width={500}
              height={61}
              alt="아토즈 로그인"
              className="desktop:cursor-pointer"
            />
            <Image
              onClick={() => handleGoogle()}
              className="desktop:cursor-pointer"
              src="/google_login.png"
              width={500}
              height={61}
              alt="구글 로그인"
            />
            <Image
              onClick={() => handleApple()}
              className="desktop:cursor-pointer"
              src="/apple_login.png"
              width={500}
              height={61}
              alt="애플 로그인"
            />
            <Image
              onClick={() => handleKakao()}
              className="desktop:cursor-pointer"
              src="/kakao_login.png"
              width={500}
              height={61}
              alt="카카오 로그인"
            />
            <Image
              onClick={() => handleNaver()}
              className="desktop:cursor-pointer"
              src="/naver_login.png"
              width={500}
              height={61}
              alt="네이버 로그인"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
