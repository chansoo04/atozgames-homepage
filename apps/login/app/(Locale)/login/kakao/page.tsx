"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Loading from "login/app/_components/Loading";
import { GpSign } from "common/cookie";
import TopBar from "app/_components/TopBar";
import Image from "next/image";

export default function Page() {
  const searchParams = useSearchParams();
  const count = searchParams.get("count");
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const router = useRouter();
  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    if (count === "" || count === "0") {
      signPopup();
    } else {
      console.log("SHIT");
    }
  }, []);

  const signPopup = async () => {
    if (isSigning) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const redirect = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/oauth/kakao";

    const apiUrl = [
      `https://kauth.kakao.com/oauth/authorize`,
      `?client_id=${clientId}`,
      `&redirect_uri=${redirect}`,
      "&prompt=login", // 로그인 프롬프트
      `&response_type=code`,
    ].join("");

    router.replace(apiUrl);
  };

  if (isLoading || isSigning) {
    return <Loading />;
  }

  return (
    <>
      {/* 상단 x버튼 영역 */}
      <TopBar visible={true} type="BACK" actionUrl="" />
      <div
        className="flex w-full items-center justify-center bg-[#b9c2e2] pb-4"
        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
      >
        <div className="flex w-full flex-col items-center justify-center bg-[#b9c2e2]">
          <div className={`mb-8 flex w-full items-center justify-center`}>
            <Image width={110} height={138} src="/atozImageLogoWithText.png" alt="logo" />
          </div>
          <div className="flex size-full items-baseline justify-center bg-[#b9c2e2]">
            <div className="flex w-full flex-col items-center justify-center bg-[#b9c2e2]">
              <div className="flex w-full max-w-[580px] flex-col items-center justify-center rounded-lg bg-[#b9c2e2] p-8">
                {/* 버튼 영역 */}
                <div className="flex w-1/2 flex-col gap-4">
                  {signInfo.map((gpSign) => (
                    <div
                      key={gpSign.id}
                      className="flex w-full items-center justify-between rounded-md border border-black p-5"
                    >
                      <button
                        type="button"
                        // TODO:  onClick={() => signInFromCookie(gpSign)}
                        className="size-full text-left text-sm leading-tight"
                      >
                        {gpSign.id}
                      </button>
                      <button
                        type="button"
                        className="text-sm leading-tight"
                        // TODO:  onClick={() => removeSign(gpSign)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                  {signInfo.length === 0 ? (
                    <></>
                  ) : (
                    <div className="mt-4 flex items-center">
                      <div className="grow border-b-2 border-slate-300"></div>
                      <span className="mx-2 text-sm text-slate-400">또는</span>
                      <div className="grow border-b-2 border-slate-300"></div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="relative flex w-full rounded-md border border-gray-300 bg-[#e5e9f9] p-3 text-sm leading-tight"
                    // TODO:  onClick={() => otherSign()}
                  >
                    <div className="flex w-full items-center justify-center gap-4">
                      <div className="absolute left-5 top-3 flex items-center justify-center">
                        <Image width={20} height={20} src="/kakao-icon.svg" alt="카카오 로그인" />
                      </div>
                      <div className="mt-[3px] flex items-center text-left">카카오 로그인</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
