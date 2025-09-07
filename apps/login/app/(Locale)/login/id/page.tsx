"use client";
import { useRouter, useSearchParams, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import TopBar from "app/_components/TopBar";
import Loading from "login/app/_components/Loading";
import { GP_SIGN_AUTH_CODE, GpSign, GpSignProvider } from "common/cookie";
import { useModal } from "common/modal";
import { useToast } from "common/toast";
import { signIn, getAccountState, withdrawalRevoke } from "../action";

export default function Page() {
  const router = useRouter();
  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { openModal } = useModal();
  const { openToast } = useToast();

  useEffect(() => {
    getCOOKIE();
  }, []);

  console.log(signInfo, "signInfo");

  const getCOOKIE = async () => {
    setIsLoading(true);

    const req = await fetch("/api/cookie/getByProvider", {
      method: "POST",
      body: JSON.stringify({ provider: GpSignProvider.PASSWORD }),
    });

    if (!req.ok) {
      return alert("아토즈 로그인 정보를 가져오는데 실패했습니다");
    }

    const res = await req.json();
    console.log(res, "res");

    setSignInfo(res);
    setIsLoading(false);
  };

  const signInFromCookie = async (gpSign: GpSign) => {
    if (!gpSign) {
      return;
    }

    setIsLoading(true);
    const res = await signIn(gpSign);

    if (res.success) {
      return openToast({
        msg: "로그인 성공",
        type: "success",
      });
    } else {
      switch (res.code) {
        case GP_SIGN_AUTH_CODE.ALREADY_SIGND: {
          const msg = [
            "이미 로그인 되어있습니다.",
            "로그아웃 후 다시 시도하거나",
            "다른 계정으로 로그인 해주세요.",
          ];
          openToast({
            msg: msg[0],
            type: "error",
          });
          break;
        }
        case GP_SIGN_AUTH_CODE.INVALID_TOKEN: {
          // * 아이디 비밀번호 재입력
          const msg = ["재로그인 필요"];
          openModal({
            // locale,
            msg,
            type: "DEFAULT",
            // type: 'ROUTING',
            // routingUrl: `${urlSignInput}?id=${gpSign.id}`,
          });
          break;
        }
        case "STATE_NOT_ACTIVE": {
          const msg = ["삭제된 계정입니다."];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
        case "STATE_WITHDRAWAL": {
          const msg = ["탈퇴한 계정입니다."];
          // return openToast({
          //   msg: msg[0],
          //   type: 'error',
          // });
          return openModal({
            msg,
            type: "ACTION",
            btnText: "탈퇴 취소",
            action: async () => {
              try {
                const accountState = await getAccountState(gpSign.uid!);
                if (!accountState) {
                  openToast({
                    msg: "계정 상태를 확인할 수 없습니다.",
                    type: "error",
                  });
                  return;
                }
                const res = await withdrawalRevoke(accountState.accountId);
                if (!res || !res.success) {
                  throw new Error("탈퇴 취소 실패");
                } else {
                  openToast({
                    msg: "탈퇴 취소 성공",
                    type: "success",
                  });
                }
              } catch (error) {
                openToast({
                  msg: "탈퇴 취소 중 오류가 발생했습니다.",
                  type: "error",
                });
              }
            },
          });
        }
        case "STATE_PAUSE": {
          const msg = ["일시정지된 계정입니다."];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
        case "STATE_DISABLE": {
          const msg = ["영구정지된 계정입니다."];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
        case "STATE_DORMANT": {
          const msg = ["휴면 계정입니다."];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
        case "STATE_NOT_PUBLIC": {
          const msg = ["계정 이용이 제한된 계정입니다."];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
        default: {
          const msg = ["잠시 뒤에 다시 시도해주세요"];
          return openToast({
            msg: msg[0],
            type: "error",
          });
        }
      }
    }
  };

  const removeSign = async (gpSign: GpSign) => {
    const newSignInfo = signInfo.filter((item) => item.uid !== gpSign.uid);
    setSignInfo(newSignInfo);

    await fetch("/api/cookie/removeSign", {
      method: "POST",
      body: JSON.stringify({ gpSign }),
    });
  };

  const otherSign = () => {
    if (signInfo.length >= Number(process.env.NEXT_PUBLIC_STORED_SIGN_LIMIT)) {
      console.log("여기 들어와>??");
      return openModal({
        msg: ["계정은 5개까지 저장 가능합니다."],
        type: "DEFAULT",
      });
    }

    return router.push("/login/id/input");
  };

  if (isLoading) {
    return <Loading />;
  }

  // * 쿠키 없음
  else if (signInfo.length === 0) {
    return redirect(`/login/id/input?id=0`);
  }

  // 쿠키 있음
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
                        onClick={() => signInFromCookie(gpSign)}
                        className="size-full text-left text-sm leading-tight"
                      >
                        {gpSign.id?.replace("@atozgames.net", "")}
                      </button>
                      <button
                        type="button"
                        className="text-sm leading-tight"
                        onClick={() => removeSign(gpSign)}
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
                    onClick={() => otherSign()}
                  >
                    <div className="flex w-full items-center justify-center gap-4">
                      <div className="absolute left-5 top-3 flex items-center justify-center">
                        <Image
                          width={20}
                          height={20}
                          src="/atozImageLogo.png"
                          alt="아토즈 로그인"
                        />
                      </div>
                      <div className="mt-[3px] flex items-center text-left">아토즈 로그인</div>
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
