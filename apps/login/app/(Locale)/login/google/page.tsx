"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import TopBar from "app/_components/TopBar";
import Loading from "login/app/_components/Loading";
import Image from "next/image";
import { useModal } from "common/modal";
import { GpSign, GpSignProvider } from "common/cookie";
import { auth, googleProvider } from "lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";
import { signUpIdentity } from "app/(Locale)/login/action";

export default function Page() {
  const searchParams = useSearchParams();
  const count = searchParams.get("count");

  const { openModal } = useModal();

  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (gpSign?: GpSign) => {
    setIsLoading(true);

    let signRes: any;
    console.log(gpSign, "gpSign");
    // 이미 로그인 되어있다면 => 기존거로 로그인
    if (gpSign) {
      // TODO:signRes = await
    }

    // 최초라면 => 구글 최초 로그인 시도
    else {
      console.log("여기로오는거아니야??");
      try {
        // 구글 로그인 시도
        const credential = await signInWithPopup(auth, googleProvider).catch((err) => {
          throw err;
        });
        const user = credential.user;
        const firebaseUid = user.uid;

        // 회원가입된 계정 있는지 확인
        const req = await fetch("/api/user/isExistAccount", {
          method: "POST",
          body: JSON.stringify({ action: "isExistAccount", options: { firebaseUid } }),
        });

        if (!req.ok) {
          throw new Error(req.statusText);
        }

        const res = await req.json();
        console.log(res, "res");

        // 계정 없다면 -> 회원가입
        if (!res.is_exist) {
          await signUpIdentity(credential, GpSignProvider.GOOGLE);
          signRes = { success: true };
        }
        // 계정 있다면 ->
        else {
          // return await signWithCredential(credential, GpSignProvider.GOOGLE);
        }
      } catch (error) {
        console.error(error);
      }
    }

    // if signRes.success ?
  };

  const otherSign = () => {
    const limit = Number(process.env.NEXT_PUBLIC_STORED_SIGN_LIMIT as string);
    console.log(limit, "limit");
    if (signInfo.length >= limit) {
      return openModal({
        msg: ["계정은 5개까지 저장 가능합니다."],
      });
    }
    signIn();
  };

  if (isLoading) {
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
                <div className="flex w-full flex-col gap-4">
                  {signInfo.map((gpSign) => (
                    <div
                      key={gpSign.id}
                      className="flex w-full items-center justify-between rounded-md border border-black  p-5"
                    >
                      <button
                        type="button"
                        onClick={() => alert("개발 필요!!")}
                        className="text-md size-full text-left"
                      >
                        {gpSign.id}
                      </button>
                      <button type="button" onClick={() => alert("REMOVE SIGN!!! 개발 필요!!")}>
                        X
                      </button>
                    </div>
                  ))}
                  {signInfo.length === 0 ? (
                    <></>
                  ) : (
                    <div className="mt-4 flex items-center">
                      <div className="grow border-b-2 border-slate-300"></div>
                      <span className="mx-2 text-slate-400">또는</span>
                      <div className="grow border-b-2 border-slate-300"></div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="relative flex w-full rounded-md border border-gray-300 bg-[#e5e9f9] p-3 text-sm leading-tight"
                    onClick={() => otherSign()}
                  >
                    <div className="flex w-full items-center justify-center gap-4">
                      <div className="absolute left-5 top-3 flex items-center justify-center">
                        <Image width={20} height={20} src="/google-icon.svg" alt="구글 로그인" />
                      </div>
                      <div className="mt-[3px] flex items-center text-left">구글 로그인</div>
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
