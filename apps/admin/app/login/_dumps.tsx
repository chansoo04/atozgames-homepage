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
        setCookie("token", data.token);
        setCookie("uid", data.uid);

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
        setCookie("token", data.token);
        setCookie("uid", data.uid);

        // 기존 위치로 리다이렉션
        window.location.href = searchParams.get("redirect_uri") ?? "/";
      }
    } catch (err) {
      alert((err as any)?.message ?? "애플 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  return (
    <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop2.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">로그인</h1>

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
          <Image src="/kakao_login.png" width={400} height={61} alt="카카오 로그인" />
          <Image src="/naver_login.png" width={400} height={61} alt="네이버 로그인" />
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1 ">
        <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[1200px] desktop:flex-col">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            로그인
          </h1>

          <div className="desktop:mt-20 desktop:flex desktop:flex-col desktop:items-center desktop:gap-y-5">
            <Image
              onClick={() => (window.location.href = "/login/atoz")}
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
            <Image src="/apple_login.png" width={500} height={61} alt="애플 로그인" />
            <Image src="/kakao_login.png" width={500} height={61} alt="카카오 로그인" />
            <Image src="/naver_login.png" width={500} height={61} alt="네이버 로그인" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
