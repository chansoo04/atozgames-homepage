"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "app/_components/TopBar";
import Image from "next/image";

// 약관urls
const urls: { [key: string]: string } = {
  terms: "https://www.atozgames.net/terms", // 이용약관:
  privacy: "https://www.atozgames.net/privacy-policy", //개인정보 처리방침:
  operating: "https://www.atozgames.net/operating-policy", //운영정책
};

export default function Page() {
  // 본인인증 결과값
  const [userId, setUserId] = useState("");
  // 약관 동의
  const [agrees, setAgrees] = useState({
    terms: false,
    privacy: false,
    operating: false,
  });
  // kind - atoz 이용약관, 개인정보처리방침 : Terms, Privacy,
  const [isTermsOpen, setIsTermsOpen] = useState({ state: false, kind: "" });

  const handleAllAgree = (e: any) => {
    if (e.target.checked) {
      setAgrees({ terms: true, privacy: true, operating: true });
    } else {
      setAgrees({ terms: false, privacy: false, operating: false });
    }
  };

  return (
    <>
      {/* 상단 x버튼 영역 */}
      <TopBar visible={true} type="BACK" actionUrl="/login/id/input" />
      <div
        className="flex w-full items-center justify-center bg-[#b9c2e2] pb-4"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <div className="flex w-full flex-col items-center justify-center bg-[#b9c2e2]">
          {/* 로고 영역 */}
          <div className={`mb-8 flex w-full items-center justify-center`}>
            <Image width={110} height={138} src="/atozImageLogoWithText.png" alt="logo" />
          </div>
          <div className="flex size-full items-baseline justify-center bg-[#b9c2e2]">
            <div className="flex w-full flex-col items-center justify-center bg-[#b9c2e2]">
              <div className="flex w-full max-w-[580px] flex-col items-center justify-center rounded-lg bg-[#b9c2e2] p-8">
                <div className="mb-8 flex w-full flex-col gap-6">
                  {userId === "" ? (
                    <>
                      {isTermsOpen.state && (
                        <div className="fixed left-0 top-0 h-screen w-full bg-white">
                          <div className="relative flex h-[45px] items-center justify-center border-b">
                            {isTermsOpen.kind === "terms" && "이용약관"}
                            {isTermsOpen.kind === "privacy" && "개인정보 처리방침"}
                            {isTermsOpen.kind === "operating" && "운영정책"}
                            <button
                              className="absolute inset-y-0 right-5 text-gray-500 hover:text-gray-700 "
                              onClick={() => setIsTermsOpen({ state: false, kind: "" })}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          <iframe width="100%" height="100%" src={urls[isTermsOpen.kind]} />
                        </div>
                      )}
                      <div className="rounded-md bg-[rgba(222,226,243,0.4)] p-[8px] pl-[12px] text-[14px]">
                        <div key="allAgree" className="flex items-center justify-start gap-3">
                          <input
                            type="checkbox"
                            id="allAgree"
                            className="size-[18px] rounded-sm border-[#7d7d96] ring-0 checked:border-0 checked:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                            checked={agrees.terms && agrees.privacy && agrees.operating}
                            onChange={(e) => handleAllAgree(e)}
                            value=""
                          />
                          <label
                            htmlFor="allAgree"
                            className="flex h-full items-center justify-center text-sm leading-tight"
                          >
                            아래 내용에 모두 동의합니다
                          </label>
                        </div>
                      </div>
                      <div className="flex w-full flex-row justify-between pl-[12px]">
                        <div key="terms" className="flex items-center justify-start gap-3">
                          <input
                            type="checkbox"
                            id="terms"
                            className="size-[18px] rounded-sm border-[#7d7d96] ring-0 checked:border-0 checked:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                            checked={agrees.terms}
                            onChange={(e) => setAgrees({ ...agrees, terms: e.target.checked })}
                            value=""
                          />
                          <label
                            htmlFor="terms"
                            className="flex h-full items-center justify-center text-sm leading-tight"
                          >
                            아토즈 이용약관(필수)
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen({ state: true, kind: "terms" })}
                          className="text-sm font-normal leading-tight"
                        >
                          [보기]
                        </button>
                      </div>
                      <div className="flex w-full flex-row justify-between pl-[12px]">
                        <div key="privacy" className="flex items-center justify-start gap-3">
                          <input
                            type="checkbox"
                            id="privacy"
                            className="size-[18px] rounded-sm border-[#7d7d96] ring-0 checked:border-0 checked:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                            checked={agrees.privacy}
                            onChange={(e) => setAgrees({ ...agrees, privacy: e.target.checked })}
                            value=""
                          />
                          <label
                            htmlFor="privacy"
                            className="flex h-full items-center justify-center text-sm leading-tight"
                          >
                            개인정보 수집/이용(필수)
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen({ state: true, kind: "privacy" })}
                          className="text-sm font-normal leading-tight"
                        >
                          [보기]
                        </button>
                      </div>
                      <div className="flex w-full flex-row justify-between pl-[12px]">
                        <div key="operating" className="flex items-center justify-start gap-3">
                          <input
                            type="checkbox"
                            id="operating"
                            className="size-[18px] rounded-sm border-[#7d7d96] ring-0 checked:border-0 checked:outline-none focus:outline-none focus:ring-0 focus:ring-offset-0"
                            checked={agrees.operating}
                            onChange={(e) => setAgrees({ ...agrees, operating: e.target.checked })}
                            value=""
                          />
                          <label
                            htmlFor="operating"
                            className="flex h-full items-center justify-center text-sm leading-tight"
                          >
                            운영정책
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTermsOpen({ state: true, kind: "operating" })}
                          className="text-sm font-normal leading-tight"
                        >
                          [보기]
                        </button>
                      </div>
                      {/*  TODO: 버튼 넣기!! */}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
