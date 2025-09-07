"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import TopBar from "login/app/_components/TopBar";
import IconButton from "login/app/_components/IconButton";
import Loading from "login/app/_components/Loading";
import { GpCookie, GpSign } from "common/cookie";

export default function Page() {
  const [signInfo, setSignInfo] = useState<GpCookie>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 화면 크기 조정
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  const setScreenSize = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  useEffect(() => {
    setVh();
    setScreenSize();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  // 쿠키에서 로그인 정보 가져오기
  const getLoginInfo = async () => {
    const req = await fetch("/api/cookie/getAll", {
      method: "POST",
    });
    if (req.ok) {
      return await req.json();
    }
    console.error(await req.json());
    return null;
  };

  const updateNickname = async (signs: GpCookie) => {
    setIsLoading(true);
    try {
      const req = await fetch("/api/cookie/getAll", {
        method: "POST",
      });

      if (!req.ok) {
        // 통신 오류
        throw new Error(req.statusText);
      }

      const res = await req.json();
      setSignInfo(res);

      const uid = Object.values(res)
        .map((provider: any) => provider.list.map((sign: GpSign) => sign.uid))
        .flat();

      const getNickReq = await fetch("/api/user/getNickByFirebaseUid", {
        method: "POST",
        body: JSON.stringify({ firebaseUid: uid }),
      });

      if (!getNickReq.ok) {
        // 통신 오류
        throw new Error(req.statusText);
      }

      const getNickRes = await getNickReq.json();
      console.log(getNickRes, "getNickRes");
      const getNick = getNickRes.account as {
        firebaseUid: string;
        nickname: string;
      }[];

      if (getNick.length > 0) {
        for (const provider of Object.values(signs)) {
          for (const sign of provider.list as GpSign[]) {
            const nickData = getNick.find((data: any) => data.firebase_uid === sign.uid);
            if (nickData) {
              sign.id = nickData.nickname;

              await fetch("/api/cookie/setSign", {
                method: "POST",
                body: JSON.stringify({ sign }),
              });
            }
          }
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Unknown error: ", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getLoginInfo()
      .then(async (signs: GpCookie) => {
        console.log(signs, "response");
        setSignInfo(signs);
        await updateNickname(signs);
      })
      .catch((error) => {
        console.log(error);
        alert("알 수 없는 이유로 로그인이 실패했습니다\n잠시 후 다시 시도해주세요");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {/* 상단 x버튼 영역 */}
      <TopBar visible={true} type="CLOSE" actionUrl="" />
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
              <div className="flex w-full max-w-[580px] flex-col items-center justify-center rounded-lg bg-[#b9c2e2] p-8">
                {/* 버튼 영역 */}
                <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 text-sm leading-tight">
                  {/* TODO: count query 처리 */}
                  <IconButton
                    link={`/login/id?count=${signInfo.PASSWORD?.list?.length || 0}`}
                    // link="/login/id?count=0"
                    text="아토즈 로그인"
                    icon="/atozImageLogo.png"
                  />
                  <IconButton
                    link={`/login/google?count=${signInfo.GOOGLE?.list?.length || 0}`}
                    text="구글 로그인"
                    icon="/google-icon.svg"
                  />
                  <IconButton
                    link={`/login/apple?count=${signInfo.APPLE?.list?.length || 0}`}
                    text="애플 로그인"
                    icon="/apple-icon.svg"
                  />
                  <IconButton
                    link={`/login/kakao?count=${signInfo.KAKAO?.list?.length || 0}`}
                    // link={"/login/kakao?count=0"}
                    text="카카오 로그인"
                    icon="/kakao-icon.svg"
                  />
                  <IconButton
                    link={`/login/naver?count=${signInfo.NAVER?.list?.length || 0}`}
                    // link="/login/naver?count=0"
                    text="네이버 로그인"
                    icon="/naver-icon.svg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
