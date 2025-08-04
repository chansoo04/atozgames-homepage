"use client";
import { useEffect, useState, MouseEvent } from "react";

declare global {
  interface Window {
    uniWebView?: {
      sendMessage: (msg: string) => void;
    };
  }
}
import useWindowSize from "./_components/useWindowSize";

export default function ClientComponent({ announcements }: { announcements: any }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(announcements[0] ?? {});
  /* -------------------------------------------------- *
   * 1) 최초 마운트 시 글로벌 uniWebView 객체 생성
   * -------------------------------------------------- */
  useEffect(() => {
    const send = (msg: string) => {
      window.location.href = `uniwebview://${msg}`;
    };

    // uniWebView 객체가 이미 있더라도 덮어쓰기
    if (window.uniWebView) {
      window.uniWebView.sendMessage = send;
    } else {
      window.uniWebView = { sendMessage: send };
    }
  }, []);

  /* -------------------------------------------------- *
   * 2) 버튼 클릭 핸들러
   * -------------------------------------------------- */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // e.preventDefault(); // 폼 안에 있어도 새로고침 방지
    // alert(JSON.stringify(window.uniWebView));
    window.uniWebView?.sendMessage("close");
  };

  const { width, height, ratio } = useWindowSize();
  const 상단마진 = ratio > 1080 / 2340 ? (height - (1080 / 2340) * width) / 2 : 0;

  return (
    <main
      style={{
        marginTop: `${상단마진}px`,
        height: `${(1080 / 2340) * width}px`,
      }}
      className="flex flex-col py-5 pl-16 pr-12"
    >
      <div className="flex items-center justify-between">
        <div className="text-white">공지사항</div>
        <button
          type="button"
          onClick={handleClick}
          className="rounded bg-blue-600/80 px-4 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
        >
          닫기
        </button>
      </div>
      <div className="grid h-full grid-cols-[220px_1fr] gap-x-5 overflow-y-hidden text-white">
        <div className="flex flex-col gap-y-2.5 overflow-y-scroll">
          {announcements?.map((announcement: any, index: number) => (
            <div key={index.toString()} onClick={() => setSelectedAnnouncement(announcement)}>
              <div>{announcement?.title}</div>
              <div>공지사항 일자</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <div>{selectedAnnouncement?.title}</div>
          <div>{selectedAnnouncement?.content}</div>
        </div>
      </div>
    </main>
  );
}
