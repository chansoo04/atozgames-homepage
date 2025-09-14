"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Loading from "login/app/_components/Loading";
import TopBar from "login/app/_components/TopBar";
import { GpSignProvider, GpSignProviderConverter } from "common/cookie";

const getAccountType = (account_type: string) => {
  switch (account_type) {
    case GpSignProvider.ID:
    case GpSignProviderConverter.ID:
    case GpSignProvider.PASSWORD:
    case GpSignProviderConverter.PASSWORD:
      return "아토즈";
    case GpSignProvider.GOOGLE:
    case GpSignProviderConverter.GOOGLE:
      return "구글";
    case GpSignProvider.KAKAO:
    case GpSignProviderConverter.KAKAO:
      return "카카오";
    case GpSignProvider.NAVER:
    case GpSignProviderConverter.NAVER:
      return "네이버";
    case GpSignProvider.APPLE:
    case GpSignProviderConverter.APPLE:
      return "애플";

    default:
      return "추가";
  }
};

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");
  const isFindPW = searchParams.get("pw");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountLists, setAccountLists] = useState<any>([]);

  useEffect(() => {
    setIsLoading(true);
    if (token && userId) {
      getAllAccount().then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token, userId]);

  const getAllAccount = async () => {
    const req = await fetch("/api/user/getAllAccount", {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    });

    if (!req.ok) {
      alert("계정 정보를 가져올 수 없습니다");
      return (window.location.href = "/login/id/input");
    }

    const res = await req.json();
    console.log(res, "RES!!");

    if (!res.success) {
      alert("계정 정보를 가져올 수 없습니다");
      return (window.location.href = "/login/id/input");
    } else if (res.account.length === 0) {
      alert("가입된 계정이 존재하지 않습니다");
      return (window.location.href = "/login/id/input");
    } else {
      setAccountLists(res.account);
    }
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
          {/* 로고 영역 */}
          <div className={`mb-8 flex w-full items-center justify-center`}>
            <Image width={110} height={138} src="/atozImageLogoWithText.png" alt="logo" />
          </div>
          <div className="flex size-full items-baseline justify-center bg-[#b9c2e2]">
            <div className="flex w-full flex-col items-center justify-center bg-[#b9c2e2]">
              <div className="flex w-full max-w-[580px] flex-col items-center justify-center rounded-lg bg-[#b9c2e2] p-8">
                <div className="mb-3  flex w-full flex-col gap-4">
                  {/* 콘텐츠 영역 */}
                  {accountLists.length === 0 && <div>가입된 계정을 찾을 수 없습니다!</div>}

                  {/* 아이디 찾기 */}
                  {!isFindPW && accountLists.length > 0 && (
                    <>
                      {accountLists.map((account: any) => (
                        <div
                          key={account.nickname}
                          className="flex w-full items-center justify-between rounded-md border border-black p-5"
                        >
                          {["ID", "PASSWORD"].includes(account.account_type)
                            ? account.account_name.replace("@atozgames.net", "")
                            : account.nickname}{" "}
                          ({getAccountType(account.account_type)})
                        </div>
                      ))}
                      <Link href="/login" className="py-5 text-center">
                        로그인하러가기
                      </Link>
                    </>
                  )}

                  {/* 비밀번호 찾기 */}
                  {isFindPW &&
                    accountLists.length > 0 &&
                    accountLists
                      ?.filter((account: any) => ["ID", "PASSWORD"].includes(account.account_type))
                      ?.map((account: any) => (
                        <div
                          key={account.nickname}
                          className="flex w-full items-center justify-between rounded-md border border-black p-5"
                        >
                          <div>
                            {account.account_name.replace("@atozgames.net", "")} (
                            {getAccountType(account.account_type)})
                          </div>
                          <Link
                            href={`/find-pw?token=${token}&user-id=${userId}&account-id=${account.account_id}`}
                            className="text-[#7C7C9E]"
                          >
                            비밀번호 찾기
                          </Link>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
