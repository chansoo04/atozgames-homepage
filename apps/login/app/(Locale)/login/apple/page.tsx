"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import Loading from "login/app/_components/Loading";
import { GpSign, GpSignProvider, GP_SIGN_AUTH_CODE } from "common/cookie";
import TopBar from "app/_components/TopBar";
import { useModal } from "common/modal";
import Image from "next/image";
import { useToast } from "common/toast";

import { signIn, getAccountState, withdrawalRevoke } from "../action";
import { signInWithApple } from "./action";

export default function Page() {
  const searchParams = useSearchParams();
  const count = searchParams.get("count");
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const router = useRouter();
  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);

  const { openModal } = useModal();
  const { openToast } = useToast();

  useEffect(() => {
    // 로그인 정보가 없다면 => 바로 애플 로그인 시도
    if (count === "" || count === "0") {
      signPopup();
    }
    // 로그인 정보가 있다면 => 정보 가져오고 setSignInfo
    else {
      getCOOKIE().then(() => {
        setIsLoading(false);
      });
    }
  }, [count]);

  // callback -> apple 로그인 콜백
  useEffect(() => {
    if (token) {
      signInFromCallback(token);
    }
  }, [token]);

  // callback -> 에러 처리
  useEffect(() => {
    if (error) {
      setIsSigning(false);
      setIsLoading(false);
      openToast({
        msg: "애플 로그인에 실패했습니다.",
        type: "error",
      });
    }
  }, [error]);

  const signPopup = async () => {
    if (isSigning) {
      return;
    }

    // 10초내에 해결 안되면 오류 처리
    setTimeout(() => {
      setIsSigning(false);
      setIsLoading(false);
      openModal({
        msg: ["응답시간 초과"],
      });
    }, 1000 * 10);

    // 애플 로그인 시작
    const redirect = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/oauth/apple";
    // const redirect = "https://login.dev.atozgames.net/api/oauth/apple";
    const state = Math.random().toString(36).substring(2, 15);
    const apiUrl = [
      `https://appleid.apple.com/auth/authorize`,
      `?response_type=code`,
      `&client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_APPLE_CLIENT_ID!)}`,
      `&redirect_uri=${redirect}`,
      `&scope=name email`,
      `&response_mode=form_post`,
      `&state=${state}`,
    ].join("");

    router.replace(apiUrl);
  };

  const getCOOKIE = async () => {
    const req = await fetch("/api/cookie/getByProvider", {
      method: "POST",
      body: JSON.stringify({ provider: GpSignProvider.APPLE }),
    });

    if (!req.ok) {
      return alert("애플 로그인 정보를 가져오는데 실패했습니다");
    }

    const res = await req.json();
    console.log(res, "res");
    setSignInfo(res);
  };

  const signHandler = (signRes: any) => {
    setIsSigning(false);
    setIsLoading(false);
    if (signRes.success) {
      return openToast({
        msg: "로그인 성공",
        type: "success",
      });
    } else {
      switch (signRes.code) {
        // * 로그인 상태 Error
        case GP_SIGN_AUTH_CODE.ALREADY_SIGND: {
          // logger.error("signIn res.code", signRes.code);
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
          // * 3rd 재인증 필요
          // logger.error("signIn res.code", signRes.code);
          const msg = ["재로그인 필요"];
          openModal({
            // locale,
            msg,
            type: "ACTION",
            action: () => {
              signPopup();
            },
          });
          break;
        }
        // * 계정 상태 Error
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
                const accountState = await getAccountState(signRes.uid!);
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
                // logger.error("revokeWithdrawal error", error);
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
        case "STATE_NOT_ACTIVE": {
          const msg = ["삭제된 계정입니다."];
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
        // * Firebase Error
        case "FB_CANCELLED-POPUP-REQUEST":
        case "FB_POPUP_CLOSED_BY_USER": {
          // do nothing, user cancelled the popup
          // logger.warning("signIn res.code", signRes.code);
          setIsLoading(false);
          return;
        }
        case "FB_POPUP_BLOCKED": {
          openToast({
            msg: "팝업이 차단되었습니다.",
            type: "error",
          });
          break;
        }
        case "FB_INVALID_EMAIL": {
          openToast({
            msg: "유효하지 않은 아이디입니다.",
            type: "error",
          });
          break;
        }
        case "FB_USER_DISABLED": {
          openToast({
            msg: "유효하지 않은 계정입니다.",
            type: "error",
          });
          break;
        }
        case "FB_TOO_MANY_REQUESTS":
        case "FB_UNKNOWN_ERROR":
        default:
          return openToast({
            msg: "잠시 뒤에 다시 시도해주세요",
            type: "error",
          });
      }
    }
  };

  // 가지고 있는 쿠키로 로그인
  const signInFromCookie = async (gpSign: GpSign) => {
    setIsSigning(true);
    const res = await signIn(gpSign);
    signHandler(res);
  };

  // 콜백으로 로그인
  const signInFromCallback = async (token: string) => {
    setIsSigning(true);
    const res = await signInWithApple(token);
    signHandler(res);
  };

  const removeSign = async (gpSign: GpSign) => {
    const req = await fetch("/api/cookie/removeSign", {
      method: "POST",
      body: JSON.stringify({ gpSign }),
    });

    if (!req.ok) {
      return alert("오류가 발생했습니다\n잠시 후 다시 시도해주세요");
    }

    const res = await req.json();
    console.log(res, "res");

    const newSignInfo = signInfo.filter((item) => item.uid != gpSign.uid);
    setSignInfo(newSignInfo);
  };

  const otherSign = () => {
    if (signInfo.length >= Number(process.env.NEXT_PUBLIC_STORED_SIGN_LIMIT)) {
      return openModal({
        msg: ["계정은 5개까지 저장 가능합니다."],
        type: "DEFAULT",
      });
    }

    signPopup();
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
                        onClick={() => signInFromCookie(gpSign)}
                        className="size-full text-left text-sm leading-tight"
                      >
                        {gpSign.id}
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
                        <Image width={20} height={20} src="/apple-icon.svg" alt="애플 로그인" />
                      </div>
                      <div className="mt-[3px] flex items-center text-left">애플 로그인</div>
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
