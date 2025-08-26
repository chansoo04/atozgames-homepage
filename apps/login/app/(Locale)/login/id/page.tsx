"use client";
import { useState, useEffect } from "react";
import Loading from "login/app/_components/Loading";
import { GpSign, GpSignProvider } from "common/cookie";
import { redirect } from "next/navigation";

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [signInfo, setSignInfo] = useState<GpSign[]>([]);

  const getCOOKIE = async () => {
    setIsLoading(true);
    const req = await fetch("/api/cookie", {
      method: "POST",
      body: JSON.stringify({ action: "getByProvider", provider: GpSignProvider.PASSWORD }),
    });
    if (req.ok) {
      return await req.json();
    }
    throw new Error("알 수 없는 이유로 통신이 실패");
  };

  useEffect(() => {
    // PASSWORD PROVIDER로 가져옴
    getCOOKIE()
      .then((cookie) => {
        setSignInfo(cookie);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  console.log(signInfo, "signInfo");

  if (isLoading) {
    return <Loading />;
  }

  // 쿠키 없다면 => 로그인으로 이동
  else if (signInfo.length === 0) {
    return redirect("/login/id/input");
  }

  // 쿠키 있다면 => 로그인 선택
  // TOP BAR 뒤로가기
}
