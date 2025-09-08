"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import Loading from "login/app/_components/Loading";
import { GP_SIGN_AUTH_CODE, GpSign, GpSignProvider } from "common/cookie";
import { useModal } from "common/modal";
import { useToast } from "common/toast";
import TopBar from "app/_components/TopBar";
import Image from "next/image";
import Link from "next/link";
import { signInWithIDPASSWORD } from "../action";
import { getAccountState, withdrawalRevoke } from "../../action";
import { toUnity } from "lib/unityUtil";

class SignFailError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message);
    this.name = "SignFailError";
    this.code = code;
  }
}

export default function Page() {
  const PASSWORD_FAIL_COUNT = 10; // 비밀번호 입력 실패 횟수 제한
  const router = useRouter();

  const [signInfo, setSignInfo] = useState<GpSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState({ id: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false); // 로그인 프로세스 진행 여부 => 로그인 버튼 활성 여부
  const [passwordErrorCount, setPasswordErrorCount] = useState(0); // 로그인 시도 횟수

  const { openModal } = useModal();
  const { openToast } = useToast();

  const passwordErrorCountModalParam = {
    msg: [
      `비밀번호 입력이 ${PASSWORD_FAIL_COUNT}회 초과하였습니다.`,
      "비밀번호 변경 후 다시 로그인해주세요",
    ],
  };

  // 쿠키에서 로그인 정보 가져오기
  useEffect(() => {
    getCOOKIE();
  }, []);

  useEffect(() => {
    if (passwordErrorCount > 0 && passwordErrorCount <= PASSWORD_FAIL_COUNT) {
      openToast({
        msg: `이메일 또는 비밀번호를 확인해주세요 시도가능 횟수 ${passwordErrorCount}/${PASSWORD_FAIL_COUNT}회`,
        type: "error",
      });
    }

    if (passwordErrorCount > 9) {
      handleLockUser();
      openModal(passwordErrorCountModalParam);
    }
  }, [passwordErrorCount]);

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

    const passwordFailCountReq = await fetch("/api/cookie/getPasswordFailCount", {
      method: "POST",
    });

    if (!passwordFailCountReq) {
      console.error("실패");
    }

    const passwordFailCountRes = await passwordFailCountReq.json();
    console.log(passwordFailCountRes, "RES!!");
    setPasswordErrorCount(passwordFailCountRes.PASSWORD_FAIL_COUNT);

    setIsLoading(false);
  };

  // 로그인
  const signIn = async (e: FormEvent) => {
    e.preventDefault();

    // TODO: 본인인증하는거로 바꿔..??
    // 비밀번호 틀린 횟수 체크
    if (passwordErrorCount >= PASSWORD_FAIL_COUNT) {
      return openModal(passwordErrorCountModalParam);
    }

    // ID, 비밀번호 체크
    if (inputValue.id === "" || inputValue.password === "") {
      return openModal({
        msg: ["아이디와 비밀번호를 입력해주세요"],
      });
    }
    setIsLoggingIn(true);

    const { id, password } = inputValue;
    const signRes = await signInWithIDPASSWORD(id, password);

    if (signRes.success) {
      openModal({
        msg: ["본인 확인이 만료되었습니다", "안전한 이용을 위해 다시 본인 확인을 진행해주세요"],
        type: "ACTION",
        btnText: "본인 확인하기",
        action: async () => {
          const win = window as any;
          const url = `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL}api/mok/mok_std_request`;

          if (win.MOBILEOK) {
            try {
              win.MOBILEOK.process(url, "MWV", "result");
            } catch (error) {
              alert("MOK 인증을 시작하는데 실패했습니다. 팝업이 허용되어 있는지 확인해주세요.");
              return Promise.reject(new Error("MOK 인증을 시작하는데 실패했습니다."));
            }
          } else {
            alert("본인인증 호출에 실패하였습니다");
          }

          return new Promise<void>((ok, no) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).result = async (mokResult: any) => {
              // TODO: from '/api/mok/[...nextPath]/route.ts mok_std_result'
              const data = JSON.parse(mokResult);

              if (data.error) {
                alert(`MOK 인증에 실패했습니다. ${data.error}`);
                return no(new SignFailError("MOK_FAIL", `MOK 인증에 실패했습니다. ${data.error}`));
              }

              openToast({
                msg: "로그인 성공",
                type: "success",
              });
              // console.log(signRes, "signRes");

              return toUnity(
                signRes.res.account_id,
                signRes.res.firebase_uid,
                signRes.res.id_token,
              );
            };
          });
        },
      });
      // return openToast({
      //   msg: "로그인 성공",
      //   type: "success",
      // });
    } else {
      switch (signRes.code) {
        case "ALREADY_SIGND": {
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
        case "INVALID_TOKEN": {
          // * 아이디 비밀번호 재입력
          const msg = ["재로그인 필요"];
          openModal({
            // locale,
            msg,
            type: "ROUTING",
            routingUrl: `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL}signup?id=${inputValue.id}`,
          });
          break;
        }
        // * 계정 상태에 따른 처리
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
        // * Firebase 에러 코드 처리
        case "FB_INVALID_EMAIL": {
          openToast({
            msg: "유효하지 않은 아이디입니다.",
            type: "error",
          });
          break;
        }
        case "FB_WRONG_PASSWORD": {
          const newCount = passwordErrorCount + 1;
          setPasswordErrorCount(newCount);
          const passwordFailCountReq = await fetch("/api/cookie/setPasswordFailCount", {
            method: "POST",
            body: JSON.stringify({ count: newCount }),
          });
          if (passwordErrorCount >= PASSWORD_FAIL_COUNT) {
            // * 비밀번호 입력이 PASSWORD_FAIL_COUNT회 초과 시
            openModal(passwordErrorCountModalParam);
          } else {
            // useEffect 내부에서 대신
            // openToast({
            //   msg: "비밀번호가 일치하지 않습니다.",
            //   type: "error",
            // });
          }
          break;
        }
        case "FB_TOO_MANY_REQUESTS":
        case "FB_UNKNOWN_ERROR":
        default: {
          openToast({
            msg: "잠시 뒤에 다시 시도해주세요",
            type: "error",
          });
          break;
        }
      }
    }

    // FIXME: 풀기!!
    // setIsLoggingIn(false);
  };

  // 로그인 PASSWORD_FAIL_COUNT회 실패 시 잠금
  const handleLockUser = async () => {};

  const findId = async () => {};

  if (isLoading || signInfo === undefined) {
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
                onSubmit={signIn}
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
                    // TODO: findId 함수 처리
                    onClick={() => alert("서비스에 오류가 발생했습니다\n잠시 후 다시 시도해주세요")}
                  >
                    아이디 찾기
                  </button>
                  <span className="mx-1 text-[#B7B7B9]">&nbsp;|&nbsp;</span>
                  <button
                    type="button"
                    className="text-sm font-medium text-[#7C7C9E] hover:text-blue-500"
                    // TODO: findPw함수 처리
                    onClick={() => alert("서비스에 오류가 발생했습니다\n잠시 후 다시 시도해주세요")}
                  >
                    비밀번호찾기
                  </button>
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
