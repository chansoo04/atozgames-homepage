"use client";
import { useEffect, useState, MouseEvent } from "react";
import useWindowSize from "app/_components/useWindowSize";
import Floating from "app/_components/Floating";

export default function ClientComponent({ inquiries }: { inquiries: any }) {
  const [selectedInquiry, setSelectedInquiry] = useState(inquiries[0] ?? {});
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
        <div className="text-white">문의 내역</div>
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
          {inquiries?.map((inquiry: any, index: number) => (
            <div
              key={index.toString()}
              onClick={() => setSelectedInquiry(inquiry)}
              className="rounded border border-gray-50 p-1"
            >
              <div>{inquiry?.title}</div>
              <div>문의 일자</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <div>{selectedInquiry?.title}</div>
          <div>{selectedInquiry?.content}</div>
        </div>
      </div>
      <Floating />
    </main>
  );
}
