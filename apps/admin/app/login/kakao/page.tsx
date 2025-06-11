"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "lib/firebaseClient";
import { setCookie, getCookies, getCookie } from "cookies-next";

export default function Page() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const custom_token = searchParams.get("custom_token");
    if (custom_token) {
      finishKakaoLogin(custom_token);
    }
  }, [searchParams]);

  const finishKakaoLogin = async (custom_token: string) => {
    try {
      const kakaoAuth = await signInWithCustomToken(auth, custom_token);

      // 로그인 성공 후 로직
      const response = await fetch("/api/oauth/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kakaoAuth),
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
      console.error(err, "err");
      alert((err as any)?.message ?? "카카오 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div></div>
    </>
  );
}
