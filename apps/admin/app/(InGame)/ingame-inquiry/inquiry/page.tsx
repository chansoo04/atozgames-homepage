"use client";
import { useEffect, useState, MouseEvent, FormEvent, useContext } from "react";
import useWindowSize from "app/_components/useWindowSize";
import Floating from "app/_components/Floating";
import { AuthContext } from "app/AuthProvider";

export default function Page() {
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

    if (window.uniWebView === undefined) {
      window.uniWebView = {
        sendMessage: send,
        OnFirebaseIdMsg: firebaseIdMsg,
      };
    }

    // window.uniWebView.sendMessage = send;

    // uniWebView 객체가 이미 있더라도 덮어쓰기
    // if (window.uniWebView) {
    //   window.uniWebView.sendMessage = send;
    // } else {
    //   window.uniWebView = { sendMessage: send };
    // }
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

  /* -------------------------------------------------- *
   * 3) 상태값 관리
   * -------------------------------------------------- */
  const context = useContext(AuthContext);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [appendFile, setAppendFile] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content || !context.user) return; // 빈 값 보호, 비로그인 유저 처리

    // TODO: 제출하기 만들기
  };

  useEffect(() => {
    // console.log(window?.uniWebView?.OnFirebaseIdMsg);
    // alert(JSON.stringify(window.uniWebView.OnFirebaseIdMsg(1) ?? "없음"));
  }, [title]);

  return (
    <main
      style={{
        marginTop: `${상단마진}px`,
        height: `${높이}px`,
      }}
      className="relative flex w-full flex-col py-5 pl-16 pr-12"
    >
      <div className="flex items-center justify-between">
        <div className="text-white">문의 하기</div>
        <button
          type="button"
          onClick={handleClick}
          className="rounded bg-blue-600/80 px-4 py-2 text-white hover:bg-blue-700 active:bg-blue-800"
        >
          닫기
        </button>
      </div>
      <form
        className="flex h-full flex-col gap-y-2.5 overflow-y-hidden text-white"
        onSubmit={handleSubmit}
      >
        <div>질문내역 작성하기</div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-black"
          placeholder="제목을 작성해주세요"
        />
        <textarea
          placeholder="문의 내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-black"
        />
        <div>첨부파일(작업 예정)</div>
        <div>
          <button
            type="submit"
            disabled={!title || !content}
            className="bg-white px-4 py-2 text-black"
          >
            등록하기
          </button>
        </div>
      </form>
      <Floating />
    </main>
  );
}
