"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const wv = searchParams.get("wv");
  const code = searchParams.get("code");

  useEffect(() => {
    const send = (msg: string) => {
      window.location.href = `uniwebview://${msg}`;
    };

    // uniWebView 객체가 이미 있더라도 덮어쓰기
    if ((window as any).uniWebView) {
      (window as any).uniWebView.sendMessage = send;
    } else {
      (window as any).uniWebView = { sendMessage: send };
    }
  }, []);

  useEffect(() => {
    if (code) {
      (window as any).uniWebView.sendMessage(JSON.stringify({ code, wv }));
    } else {
      signPopup();
    }
  }, [code, wv]);

  const signPopup = () => {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const redirect = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + `api/oauth/kakao`;

    const apiUrl = [
      `https://kauth.kakao.com/oauth/authorize`,
      `?client_id=${clientId}`,
      `&redirect_uri=${redirect}`,
      "&prompt=login", // 로그인 프롬프트
      `&response_type=code`,
      `&state=${wv}`,
    ].join("");

    window.location.href = apiUrl;
  };

  return <></>;
}
