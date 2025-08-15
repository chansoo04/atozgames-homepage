"use client";
import useSWR from "swr";
import { useEffect, useState, MouseEvent } from "react";
import Floating from "app/_components/Floating";
import useWindowSize from "app/_components/useWindowSize";
import csr from "lib/fetcher/csr";
import { setCookie, getCookie } from "cookies-next";

// testfId: y4YcqsZDrXgl65bUM8JgV3H3O963
async function firebaseIdMsg(fbId: any) {
  // fbId = "cmakjiwdy015y7unrngkl7dol";
  const req = await csr
    .get(`auth/validate-firebase?uid=${fbId}`)
    .then(async (response) => {
      const res: any = await response.json();
      setCookie("uid", res?.account?.firebase_uid);
      setCookie("account_id", res?.account?.account_id);
    })
    .catch((err) => {
      alert("오류 발생!!");
    });
}

export default function Page() {
  const { data, mutate } = useSWR<{ result: string; inquiry: any[] }>("inquiry");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(
    data?.inquiry ? data?.inquiry[0] : ({} as any),
  );

  /* -------------------------------------------------- *
   * 1) 최초 마운트 시 글로벌 uniWebView 객체 생성
   * -------------------------------------------------- */
  useEffect(() => {
    const send = (msg: string) => {
      window.location.href = `uniwebview://${msg}`;
    };

    // TODO: uid를 가지고
    // firebaseIdMsg(123);

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
    mutate();
  }, []);

  /* -------------------------------------------------- *
   * 2) 버튼 클릭 핸들러
   * -------------------------------------------------- */
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // 쿠키가 들어갔나..?
    const uid = getCookie("uid");
    const account_id = getCookie("account_id");
    alert("uid: " + uid + "|||| account_id=" + account_id);

    // window.uniWebView?.sendMessage("close");
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

  // TODO: api 연결하기

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
          {data?.inquiry?.map((inquiry: any, index: number) => (
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
        <div className="flex flex-col overflow-y-hidden">
          <div>{selectedInquiry?.title ?? ""}</div>
          <div className="h-full overflow-y-scroll">{selectedInquiry?.content ?? ""}</div>
        </div>
      </div>
      <Floating />
    </main>
  );
}
