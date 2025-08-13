"use client";
import { MouseEvent, useEffect, useState } from "react";
import useWindowSize from "app/_components/useWindowSize";
import Floating from "app/_components/Floating";
import type { FAQ } from "./page";

export default function ClientComponent({ faqs }: { faqs: FAQ[] }) {
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ>({} as FAQ);
  /* -------------------------------------------------- *
   * 1) 최초 마운트 시 글로벌 uniWebView 객체 생성
   * -------------------------------------------------- */
  useEffect(() => {
    const send = (msg: string) => {
      window.location.href = `uniwebview://${msg}`;
    };

    const firebaseIdMsg = function (fbId: any) {
      console.log("Unity에서 온 FBID:", fbId);
      // 여기서 원하는 처리 수행
      // ex) 서버로 전송, 쿠키/로컬스토리지 저장 등
      // localStorage.setItem("fbid", fbId);
      // C# 쪽 payload.data로 돌아갈 문자열을 반환할 수 있음
      alert("received:" + fbId);
      return fbId;
    };

    // uniWebView 객체가 이미 있더라도 덮어쓰기
    if (window.uniWebView === undefined) {
      window.uniWebView = {
        sendMessage: send,
      };
      window.OnFirebaseIdMsg = firebaseIdMsg;
    } else {
      window.uniWebView = { sendMessage: send };
      window.OnFirebaseIdMsg = firebaseIdMsg;
    }
  }, []);

  useEffect(() => {
    if (faqs.length > 0) {
      setSelectedFAQ(faqs[0]);
    }
  }, [faqs]);

  /* -------------------------------------------------- *
   * 2) 버튼 클릭 핸들러
   * -------------------------------------------------- */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // e.preventDefault(); // 폼 안에 있어도 새로고침 방지
    // alert(JSON.stringify(window.uniWebView));
    window.uniWebView?.sendMessage("close");
  };

  const { width, height, ratio } = useWindowSize();
  const [상단마진, set상단마진] = useState(0);
  const [높이, set높이] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      set상단마진(ratio > 1080 / 2340 ? (height - (1080 / 2340) * width) / 2 : 0);
      set높이((1080 / 2340) * width);
    };

    handleResize(); // 첫 마운트 시 값 동기화
  }, [ratio]);

  return (
    <main
      style={{
        marginTop: `${상단마진}px`,
        height: `${높이}px`,
      }}
      className="relative flex w-full flex-col py-5 pl-16 pr-12"
    >
      <div className="flex items-center justify-between">
        <div className="text-white">FAQ</div>
        <button
          type="button"
          onClick={handleClick}
          className="rounded bg-blue-600/80 px-4 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
        >
          닫기
        </button>
      </div>
      <div className="grid h-full grid-cols-[220px_1fr] gap-x-5 overflow-y-hidden text-white">
        <div className="scrollbar-hide flex flex-col gap-y-2.5 overflow-y-scroll">
          {faqs?.map((faq: any, index: number) => (
            <div
              key={index.toString()}
              onClick={() => setSelectedFAQ(faq)}
              className="rounded border border-gray-50 p-1"
            >
              <div className="truncate">{faq?.title}</div>
              <div>{faq?.created_at}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col overflow-y-hidden">
          <div>{selectedFAQ?.question ?? ""}</div>
          <div className="h-full overflow-y-scroll">{selectedFAQ?.answer ?? ""}</div>
        </div>
      </div>
      <Floating />
    </main>
  );
}
