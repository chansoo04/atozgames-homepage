"use client";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Image from "next/image";
import { setCookie, getCookies, getCookie } from "cookies-next";
import { useSearchParams } from "next/navigation";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import useWindowSize from "app/_components/useWindowSize";

import { auth, googleProvider, appleProvider } from "lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";

export default function Page() {
  const searchParams = useSearchParams();
  const { ratio } = useWindowSize();

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
        className="flex flex-col items-center desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
          minHeight: mobileSizeCalc(783, ratio),
          paddingBottom: mobileSizeCalc(40, ratio),
          paddingTop: mobileSizeCalc(92, ratio),
        }}
      >
        <TopBar />
        <h1
          className="font-bold text-gray-700"
          style={{
            fontSize: mobileSizeCalc(18, ratio),
            lineHeight: mobileSizeCalc(26, ratio),
          }}
        >
          로그인
        </h1>

        <div
          className="w-full"
          style={{
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
          }}
        >
          <div
            className="flex flex-col items-center"
            style={{
              marginTop: mobileSizeCalc(80, ratio),
              rowGap: mobileSizeCalc(20, ratio),
            }}
          >
            <Image
              onClick={() =>
                (window.location.href = `/login/atoz?redirect_uri=${searchParams.get("redirect_uri") ?? "/"}`)
              }
              src="/atoz_login.png"
              width={320}
              height={39}
              alt="아토즈 로그인"
              className="cursor-pointer"
              style={{
                width: mobileSizeCalc(320, ratio),
                height: mobileSizeCalc(39, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleGoogle()}
              className="cursor-pointer"
              src="/google_login.png"
              width={320}
              height={39}
              alt="구글 로그인"
              style={{
                width: mobileSizeCalc(320, ratio),
                height: mobileSizeCalc(39, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleApple()}
              className="cursor-pointer"
              src="/apple_login.png"
              width={320}
              height={39}
              alt="애플 로그인"
              style={{
                width: mobileSizeCalc(320, ratio),
                height: mobileSizeCalc(39, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleKakao()}
              src="/kakao_login.png"
              width={320}
              height={39}
              alt="카카오 로그인"
              style={{
                width: mobileSizeCalc(320, ratio),
                height: mobileSizeCalc(39, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleNaver()}
              src="/naver_login.png"
              width={320}
              height={39}
              alt="네이버 로그인"
              style={{
                width: mobileSizeCalc(320, ratio),
                height: mobileSizeCalc(39, ratio),
              }}
              unoptimized
              quality={100}
            />
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop2.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div
          className="desktop:flex desktop:flex-col desktop:items-center"
          style={{
            paddingTop: desktopSizeCalc(240, ratio),
          }}
        >
          <h1
            className="desktop:text-center desktop:font-bold desktop:text-white"
            style={{
              fontSize: desktopSizeCalc(50, ratio),
              lineHeight: desktopSizeCalc(50, ratio),
            }}
          >
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
              style={{
                width: desktopSizeCalc(500, ratio),
                height: desktopSizeCalc(61, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleGoogle()}
              className="desktop:cursor-pointer"
              src="/google_login.png"
              width={500}
              height={61}
              alt="구글 로그인"
              style={{
                width: desktopSizeCalc(500, ratio),
                height: desktopSizeCalc(61, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleApple()}
              className="desktop:cursor-pointer"
              src="/apple_login.png"
              width={500}
              height={61}
              alt="애플 로그인"
              style={{
                width: desktopSizeCalc(500, ratio),
                height: desktopSizeCalc(61, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleKakao()}
              className="desktop:cursor-pointer"
              src="/kakao_login.png"
              width={500}
              height={61}
              alt="카카오 로그인"
              style={{
                width: desktopSizeCalc(500, ratio),
                height: desktopSizeCalc(61, ratio),
              }}
              unoptimized
              quality={100}
            />
            <Image
              onClick={() => handleNaver()}
              className="desktop:cursor-pointer"
              src="/naver_login.png"
              width={500}
              height={61}
              alt="네이버 로그인"
              style={{
                width: desktopSizeCalc(500, ratio),
                height: desktopSizeCalc(61, ratio),
              }}
              unoptimized
              quality={100}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
