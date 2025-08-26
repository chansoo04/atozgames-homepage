"use client";
import { useCallback, useEffect, useState, FormEvent } from "react";
import Loading from "login/app/_components/Loading";
import { GpSign, GpSignProvider } from "common/cookie";
import TopBar from "app/_components/TopBar";
import Image from "next/image";
import Link from "next/link";
import { useModal } from "common/modal";
import { useToast } from "common/toast";
import { auth } from "lib/firebaseClient";
import { UserCredential, signInWithEmailAndPassword } from "firebase/auth";

export default function Page() {
  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState({ id: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false); // 로그인 프로세스 진행 여부 => 로그인 버튼 활성 여부
  const { openModal } = useModal();
  const { openToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (inputValue.id === "" || inputValue.password === "") {
      return openModal({
        msg: ["아이디와 비밀번호를 입력해주세요"],
      });
    }
    setIsLoggingIn(true);

    let { id } = inputValue;
    const { password } = inputValue;

    // STEP 1. id에 @를 포함하지 않으면 추가
    if (!id.includes("@")) {
      id = `${id}@atozgames.net`;
    }

    try {
      // STEP 2. 파이어베이스
      const credential: UserCredential = await signInWithEmailAndPassword(auth, id, password);
      const req = await fetch("/api/auth/signWithCredential", {
        method: "POST",
        body: JSON.stringify({ id, credential, provider: GpSignProvider.PASSWORD }),
      });

      if (!req.ok) {
        throw new Error(req.statusText);
      }

      const res = await req.json();

      if (res.succcess) {
      }
      console.log(res, "res");
    } catch (error) {
      console.log(error, "error");
      setIsLoggingIn(false);
    }

    console.log(id, "id");

    openToast({
      msg: "홀리몰리",
      type: "error",
      displayTime: 5000,
    });

    setIsLoggingIn(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {/* 상단 x버튼 영역 */}
      <TopBar visible={true} type="BACK" actionUrl="/login" />
      {/* TODO: SignToast, SignModal?? */}
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
              {/* 로그인 영역 */}
              <form
                className="flex w-full max-w-[580px] flex-col items-center justify-center rounded-lg bg-[#b9c2e2] p-8"
                onSubmit={handleSubmit}
              >
                <div className="mb-3 flex w-full flex-col gap-6">
                  <div className="relative">
                    <div className="pb-1 pt-4 text-sm font-semibold">아이디</div>
                    <input
                      name="id"
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={inputValue.id}
                      onChange={(e) => setInputValue({ ...inputValue, id: e.target.value })}
                      className="inline-block w-full border-0 border-b border-b-black bg-[#b4bbda] pb-[14px] pl-[16px] pr-[38px] pt-[15px] text-base leading-tight outline-none placeholder:text-base placeholder:font-normal placeholder:text-[#17171c] focus:border-0 focus:border-b focus:border-b-black focus:ring-0"
                    />
                    {inputValue.id.length > 0 ? (
                      <button
                        type="button"
                        className="absolute right-3 top-[52px] flex size-[28px] items-center justify-center"
                        onClick={() => setInputValue({ ...inputValue, id: "" })}
                      >
                        <Image width={16} height={16} alt="아이디 값 삭제" src="/close.svg" />
                      </button>
                    ) : null}
                  </div>
                  <div className="relative">
                    <div className="pb-1 pt-4 text-sm font-semibold">비밀번호</div>
                    <input
                      name="password"
                      type={passwordVisible ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      value={inputValue.password}
                      onChange={(e) => setInputValue({ ...inputValue, password: e.target.value })}
                      className="inline-block w-full border-0 border-b border-b-black bg-[#b4bbda] pb-[14px] pl-[16px] pr-[38px] pt-[15px] text-base leading-tight outline-none placeholder:text-base placeholder:font-normal placeholder:text-[#17171c] focus:border-0 focus:border-b focus:border-b-black focus:ring-0"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[52px] flex size-[28px] items-center justify-center"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Image
                        width={16}
                        height={16}
                        alt="비밀번호 보기"
                        src={passwordVisible ? "/eye-open.svg" : "/eye-close.svg"}
                      />
                    </button>
                    {inputValue.password.length > 0 ? (
                      <button
                        type="button"
                        className="absolute right-10 top-[52px] flex size-[28px] items-center justify-center"
                        onClick={() => setInputValue({ ...inputValue, password: "" })}
                      >
                        <Image width={16} height={16} alt="아이디 값 삭제" src="/close.svg" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="mb-5 flex w-full items-center justify-center gap-2 px-0 pt-3">
                  <button
                    disabled={isLoggingIn}
                    type="submit"
                    className="h-12 w-full rounded-sm bg-[#2D56FF] text-sm font-bold tracking-wider text-white hover:bg-[#3642C6] disabled:bg-[#e5e5e5] disabled:text-[#cfd0d0]"
                  >
                    로그인
                  </button>
                </div>
                <div className="mt-4 flex w-full items-center justify-center text-[#7C7C9E]">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#7C7C9E] hover:text-blue-500"
                    onClick={() => alert("핸드폰번호 인증으로 이동!! ")}
                  >
                    아이디 찾기
                  </button>
                  <span className="mx-1 text-[#B7B7B9]">&nbsp;|&nbsp;</span>
                  <Link
                    href="/find-pw"
                    className="text-sm font-medium text-[#7C7C9E] hover:text-blue-500"
                  >
                    비밀번호찾기
                  </Link>
                  <span className="mx-1 text-sm text-[#B7B7B9]">&nbsp;|&nbsp;</span>
                  <Link
                    href="/signup"
                    className="text-sm font-medium text-[#7C7C9E] hover:text-blue-500"
                  >
                    회원가입
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
