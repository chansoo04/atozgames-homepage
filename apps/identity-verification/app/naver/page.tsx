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
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirect = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/oauth/naver";

    const apiUrl = [
      `https://nid.naver.com/oauth2.0/authorize`,
      `?response_type=code`,
      `&client_id=${clientId}`,
      `&redirect_uri=${redirect}`,
      `&state=${wv}`,
      `&auth_type=reauthenticate`,
    ].join("");

    window.location.href = apiUrl;
  };

  return <></>;
}
