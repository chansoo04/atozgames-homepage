"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "app/_components/TopBar";
import Loading from "login/app/_components/Loading";
import Image from "next/image";

export default function Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");
  const isFindPW = searchParams.get("pw");
  const [isLoading, setIsLoading] = useState(true);
  const [accountLists, setAccountLists] = useState<Account[]>([]);

  const getAllAccount = async () => {
    try {
      const req = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ action: "getAllAccount", options: { userId, token } }),
      });

      if (!req.ok) {
        throw new Error(req.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    if (token && userId) {
      getAllAccount().then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

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
                <div className="mb-3  flex w-full flex-col gap-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
