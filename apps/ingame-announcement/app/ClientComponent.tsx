"use client";
import { useEffect, MouseEvent } from "react";

declare global {
  interface Window {
    uniWebView?: {
      sendMessage: (msg: string) => void;
    };
  }
}
import useWindowSize from "./_components/useWindowSize";

export default function ClientComponent({ announcements }: { announcements: any }) {
  /* -------------------------------------------------- *
   * 1) 최초 마운트 시 글로벌 uniWebView 객체 생성
   * -------------------------------------------------- */
  useEffect(() => {
    if (!window.uniWebView) {
      window.uniWebView = {
        sendMessage: (msg: string) => {
          // React strict-mode 중복 호출 대비 : 실제 변화 없으면 무시
          if (typeof msg === "string" && msg.length > 0) {
            window.location.href = `uniwebview://${msg}`;
          }
        },
      };
    }
  }, []);

  /* -------------------------------------------------- *
   * 2) 버튼 클릭 핸들러
   * -------------------------------------------------- */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 폼 안에 있어도 새로고침 방지
    window.uniWebView?.sendMessage("close");
  };

  const { width, height, ratio } = useWindowSize();
  // const backgroundImageRatio =

  return (
    <main>
      <div>안녕하세요</div>
      <button
        type="button"
        onClick={handleClick}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
      >
        닫기
      </button>
    </main>
  );
}
