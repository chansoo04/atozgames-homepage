"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const win = window as any;
    if (win.MOBILEOK) {
      setReady(true);
    } else {
      setTimeout(() => {
        const win = window as any;
        if (win.MOBILEOK) {
          setReady(true);
        } else {
          alert("본인인증 시작을 실패했습니다");
        }
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      identityVerify();
    }
  }, [ready]);

  const identityVerify = async () => {
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
      alert("MOK 인증을 시작하는데 실패했습니다");
    }

    return new Promise<void>((ok, no) => {
      (window as any).result = async (mokResult: any) => {
        const data = JSON.parse(mokResult);
        data.auth = JSON.parse(data.auth);
        console.log(data, "DATA!!");
      };
    });
  };

  return (
    <>
      <div>asfasdfasdf</div>
    </>
  );
}
