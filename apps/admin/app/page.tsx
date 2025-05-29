"use client";
import { useState, useEffect } from "react";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export default function Page() {
  const images = {
    mobile: ["/bg_mobile1.png", "/bg_mobile2.png"],
    desktop: ["/bg_desktop1.png", "/bg_desktop2.png"],
  };

  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    // 3. 일정 주기마다 인덱스 업데이트
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.mobile.length);
    }, 3000); // 10초마다 변경

    // 4. 클린업
    return () => clearInterval(interval);
  }, [images.mobile.length]);

  // 5. 동적 URL 선택 (화면 크기에 따라)
  const mobileBg = images.mobile[index];
  const desktopBg = images.desktop[index];

  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="relative aspect-[1440/3040] w-full flex-col items-center bg-[length:100%_auto] bg-top bg-repeat-y pb-10 pt-[92px] transition-all duration-1000 ease-in-out desktop:hidden"
        style={{ backgroundImage: `url(${mobileBg})` }}
      >
        <TopBar />
        <h1 className="text-center text-lg font-bold leading-relaxed  text-white">
          사전예약 모집 준비중입니다
        </h1>
        <div className="w-full px-5">
          <div className="mt-5 flex w-full flex-col whitespace-pre-line rounded-[20px] bg-gray-100 p-5 text-sm font-normal leading-tight text-gray-700">
            잠시만 기다려주세요
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section
        className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y desktop:transition-all desktop:duration-1000 desktop:ease-in-out"
        style={{ backgroundImage: `url(${desktopBg})` }}
      >
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            사전예약 모집 준비중입니다
          </h1>
          <div className="max-w-[1200px] desktop:mb-52 desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            <div className="whitespace-pre-line pb-20 pt-10 text-lg font-normal text-white">
              잠시만 기다려주세요
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
