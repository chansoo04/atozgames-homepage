"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const wv = searchParams.get("wv");

  useEffect(() => {
    const win = window as any;
    if (win.MOBILEOK) {
      setReady(true);
    } else {
      setTimeout(() => {
        const win = window as any;
        if (win.MOBILEOK) {
          setReady(true);
        } else {
          alert("본인인증 시작을 실패했습니다");
          setShow(true);
        }
      }, 1500);
    }
  }, []);

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
    if (ready) {
      identityVerify();
    }
  }, [ready]);

  const identityVerify = async () => {
    const win = window as any;
    const url = `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL}api/mok/mok_std_request`;

    if (win.MOBILEOK) {
      try {
        win.MOBILEOK.process(url, "MWV", "result");
      } catch (error) {
        alert("MOK 인증을 시작하는데 실패했습니다. 팝업이 허용되어 있는지 확인해주세요.");
        setShow(true);
        return Promise.reject(new Error("MOK 인증을 시작하는데 실패했습니다."));
      }
    } else {
      setShow(true);
      alert("MOK 인증을 시작하는데 실패했습니다");
    }

    return new Promise<void>((ok, no) => {
      (window as any).result = async (mokResult: any) => {
        const data = JSON.parse(mokResult);
        data.auth = JSON.parse(data.auth);
        const payload = JSON.stringify({ ...data, wv });
        (window as any).uniWebView.sendMessage("identify", { payload });
        alert(`보낸 데이터: ${payload}`);
      };
    });
  };

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
