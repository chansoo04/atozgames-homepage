"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const wv = searchParams.get("wv");
  const code = searchParams.get("code");
  const [show, setShow] = useState<boolean>(false);

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
    console.log("CODE: ", code);
    console.log("WV: ", wv);
    if (code && wv) {
      (window as any).uniWebView.sendMessage("identity", JSON.stringify({ code, wv }));
    } else {
      alert("올바르지 않은 접근입니다");
      // 웹 닫기
      (window as any).uniWebView?.sendMessage("close");
    }
    setTimeout(() => {
      setShow(true);
    }, 3000);
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

  const closeWeb = () => {
    (window as any).uniWebView?.sendMessage("close");
  };

  // TODO: 디자인 필요
  return (
    <div className="flex w-full items-center justify-center">
      {show ? (
        <button type="button" onClick={() => closeWeb()}>
          게임으로 돌아가기
        </button>
      ) : null}
    </div>
  );
}
