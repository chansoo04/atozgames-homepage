"use client";

import { useEffect, useState } from "react";
import TopBar from "app/_components/TopBar";
import Image from "next/image";
import Link from "next/link";
import { useModal } from "common/modal";

// TODO: 본인인증 처리하기
// TODO: 본인인증 완료 후 정보 기입 input 처리하기
// TODO: validator
// TODO: 회원가입 완료 처리

// 약관urls
const urls: { [key: string]: string } = {
  terms: "https://www.atozgames.net/terms", // 이용약관:
  privacy: "https://www.atozgames.net/privacy-policy", //개인정보 처리방침:
  operating: "https://www.atozgames.net/operating-policy", //운영정책
};

// ID, PW 패턴
const idPattern = /^(?=.*[a-z])(?=.*\d)[a-z\d_]{8,16}$/;
const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,}$/;

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
  // 입력값들
  const [inputs, setInputs] = useState({
    id: "",
    password: "",
    passwordCheck: "",
    naem: "",
    phone: "",
  });
  // 이메일 중복체크 여부
  const [emailCheck, setEmailCheck] = useState<boolean>(false);
  // 가입 버튼 활성화 여부
  const [isCheck, setIsCheck] = useState<boolean>(false);

  const { openModal } = useModal();

  const handleAllAgree = (e: any) => {
    if (e.target.checked) {
      setAgrees({ terms: true, privacy: true, operating: true });
    } else {
      setAgrees({ terms: false, privacy: false, operating: false });
    }
  };

  // 본인인증 시작
  const handleIdentity = async () => {
    const win = window as any;
    if (win.MOBILEOK) {
      const callbackUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/mok/mok_std_request";
      win.MOBILEOK.process(callbackUrl, "MVW", "result");
    } else {
      alert("본인인증 호출에 실패하였습니다");
    }
  };

  useEffect(() => {
    // const win = window as any;
    // win.result = async (d: any) => {
    //   console.log(d, "DDD");
    //   console.log(JSON.parse(d), "JSON");
    //   try {
    //     const req = await fetch("/api/user", {
    //       method: "POST",
    //       body: JSON.stringify({ action: "createUser", option: JSON.parse(d) }),
    //     });
    //
    //     if (!req.ok) {
    //       throw new Error(req.statusText);
    //     }
    //
    //     const res = await req.json();
    //     setUserId(res.userId);
    //     console.log(res, "res");
    //   } catch (error) {
    //     alert(JSON.stringify(error));
    //   }
    // };
  }, []);

  // 이메일 중복 확인
  const onCheckEmail = async () => {
    // 패턴 확인
    if (!idPattern.test(inputs.id)) {
      return openModal({
        msg: [
          "아이디는 영어, 숫자를 혼합하여 8~16자로 작성해주세요.",
          "특수문자는 _만 사용 가능합니다",
        ],
      });
    }
    // 아이디 중복 확인
    const email = `${inputs.id}@atozgames.net`;
    const req = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ action: "isExistEmail", email }),
    });

    // resp.isExist
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
                      {/* 전체 동의 */}
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
                      {/* 이용약관 */}
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
                      {/* 개인정보 수집/이용 */}
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
                      {/* 운영정책 */}
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

                      {/* 버튼 래퍼 */}
                      <div className="mb-5 flex w-full items-center justify-center gap-2 pt-3 ">
                        <Link
                          href="/login/id/input"
                          style={{
                            background: "linear-gradient(180deg, #F1F3FA 0%, #D4DAF6 100%)",
                          }}
                          className="flex h-[32px] w-full items-center  justify-center rounded-lg text-[12px] text-black"
                        >
                          취소
                        </Link>
                        <div
                          className="inline-block w-full cursor-pointer"
                          onClick={() =>
                            agrees.privacy && agrees.operating && agrees.terms
                              ? handleIdentity()
                              : alert("모든 약관에 동의해주세요")
                          }
                        >
                          <div
                            style={{
                              background: "linear-gradient(180deg, #F1F3FA 0%, #D4DAF6 100%)",
                            }}
                            className={`flex h-[32px] w-full items-center justify-center rounded-lg text-[12px] ${agrees.privacy && agrees.operating && agrees.terms ? "text-black" : "font-medium uppercase text-[#CCC]"}`}
                          >
                            확인
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="pb-1 pt-4 text-sm font-semibold">아이디 *</div>
                        <div className="relative">
                          <input
                            name="id"
                            type="text"
                            value={inputs.id}
                            onChange={(e) => setInputs({ ...inputs, id: e.target.value })}
                            placeholder="아이디를 입력하세요"
                            className="inline-block w-full border-0 border-b border-b-black bg-[#b4bbda] pb-[14px] pl-[16px] pr-[38px] pt-[15px] text-base leading-tight outline-none placeholder:text-base placeholder:font-normal placeholder:text-[#17171c] focus:border-0 focus:border-b focus:border-b-black focus:ring-0"
                          />
                          {inputs.id && !emailCheck ? (
                            <button
                              type="button"
                              className="absolute right-3 top-[7px] mx-[2px] h-[36px] w-[82px] rounded-[4px] bg-[#2d56ff] text-sm font-semibold text-white"
                              onClick={() => onCheckEmail()}
                            >
                              중복확인
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
