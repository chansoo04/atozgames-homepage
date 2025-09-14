"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "login/app/_components/TopBar";
import Image from "next/image";
import Link from "next/link";
import { useModal } from "common/modal";

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("user-id");
  const account = searchParams.get("account-id");

  const [inputs, setInputs] = useState({
    password: "",
    passwordCheck: "",
  });

  const { openModal } = useModal();
  const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+=-]{6,}$/;

  const onResetPassword = async () => {
    if (!inputs.password || !inputs.passwordCheck) {
      return openModal({
        msg: ["비밀번호를 입력해주세요"],
      });
    }

    if (inputs.password !== inputs.passwordCheck) {
      return openModal({
        msg: ["비밀번호가 일치하지 않습니다", "다시 한번 확인해주세요"],
      });
    }

    if (!pwPattern.test(inputs.password)) {
      return openModal({
        msg: ["사용할 수 없는 비밀번호입니다"],
      });
    }

    const params = {
      userId: userId,
      token: token,
      accountId: account,
      password: inputs.password,
    };

    const req = await fetch("/api/auth/resetPassword", {
      method: "POST",
      body: JSON.stringify(params),
    });

    if (!req.ok) {
      return openModal({
        msg: ["비밀번호 변경에 실패했습니다", "잠시 후 다시 시도해주세요"],
      });
    }

    const res = await req.json();
    console.log(res, "RES");

    if (res.success) {
      openModal({
        msg: ["비밀번호가 변경되었습니다", "로그인 페이지로 이동합니다"],
        action: () => {
          window.location.href = "/login/id/input";
        },
      });
    } else {
      return openModal({
        msg: ["비밀번호 변경에 실패했습니다", "잠시 후 다시 시도해주세요"],
      });
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
                {/* 콘텐츠 영역 */}
                <div className="mb-8 flex w-full flex-col gap-6">
                  <div className="relative">
                    <div className="pb-1 pt-4 text-sm font-semibold">비밀번호 *</div>
                    <div className="relative">
                      <input
                        name="password"
                        type="password"
                        value={inputs.password}
                        onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        placeholder="비밀번호를 입력하세요"
                        className="inline-block w-full border-0 border-b border-b-black bg-[#b4bbda] pb-[14px] pl-[16px] pr-[38px] pt-[15px] text-base leading-tight outline-none placeholder:text-base placeholder:font-normal placeholder:text-[#17171c] focus:border-0 focus:border-b focus:border-b-black focus:ring-0"
                      />
                    </div>
                    <div className="px-[16px] pt-[6px] text-sm leading-tight">
                      비밀번호는 6자리 이상으로 영어, 숫자 등이 포함되어야 합니다.
                    </div>
                  </div>
                </div>
                <div className="mb-8 flex w-full flex-col gap-6">
                  <div className="relative">
                    <div className="pb-1 pt-4 text-sm font-semibold">비밀번호 확인 *</div>
                    <div className="relative">
                      <input
                        name="passwordCheck"
                        type="password"
                        value={inputs.passwordCheck}
                        onChange={(e) => setInputs({ ...inputs, passwordCheck: e.target.value })}
                        placeholder="비밀번호를 입력하세요"
                        className="inline-block w-full border-0 border-b border-b-black bg-[#b4bbda] pb-[14px] pl-[16px] pr-[38px] pt-[15px] text-base leading-tight outline-none placeholder:text-base placeholder:font-normal placeholder:text-[#17171c] focus:border-0 focus:border-b focus:border-b-black focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
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
                    onClick={() => onResetPassword()}
                  >
                    <div
                      style={{
                        background: "linear-gradient(180deg, #F1F3FA 0%, #D4DAF6 100%)",
                      }}
                      className="flex h-[32px] w-full items-center justify-center rounded-lg text-[12px] text-black"
                    >
                      비밀번호 변경
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
