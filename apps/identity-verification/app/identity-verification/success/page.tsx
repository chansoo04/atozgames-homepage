"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const wv = searchParams.get("wv");
  const comType = searchParams.get("comType");
  const data = searchParams.get("data");

  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const send = (path: string, params: Record<string, string> = {}) => {
      const usp = new URLSearchParams(params);
      window.location.href = `uniwebview://${path}?${usp.toString()}`;
    };

    // uniWebView 객체가 이미 있더라도 덮어쓰기
    if ((window as any).uniWebView) {
      (window as any).uniWebView.sendMessage = send;
    } else {
      (window as any).uniWebView = { sendMessage: send };
    }
  }, []);

  useEffect(() => {
    if (wv && comType && data) {
      const payload = JSON.stringify({ auth: { data, comType }, wv });
      (window as any).uniWebView.sendMessage("identify", { payload });

      setTimeout(() => {
        setShow(true);
      }, 3000);
    }
  }, [wv, comType, data]);

  const closeWeb = () => {
    (window as any).uniWebView?.sendMessage("close");
  };

  return (
    <>
      {show ? (
        <button type="button" onClick={() => closeWeb()}>
          게임으로 돌아가기
        </button>
      ) : null}
    </>
  );
}
