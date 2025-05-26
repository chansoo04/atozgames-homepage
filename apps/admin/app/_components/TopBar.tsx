"use client";
import "./topbar.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Transition } from "@headlessui/react";
import { usePathname } from "next/navigation";

const tabs = ["게임소개", "공지사항", "문의하기"] as const;
const subTabs = {
  게임소개: [
    {
      text: "RNG 인증 및 공정성",
      url: "/rng-certificate",
    },
  ],
  문의하기: [
    { text: "자주 묻는 질문", url: "/faq" },
    { text: "1:1문의", url: "/inquiry" },
  ],
};
export default function TopBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [active, setActive] = useState<(typeof tabs)[number] | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.location.pathname === "/" || window.location.pathname.includes("/rng-certificate")) {
      setActive("게임소개");
    }
    if (window.location.pathname.includes("/announcement")) {
      setActive("공지사항");
    }
    if (
      window.location.pathname.includes("/faq") ||
      window.location.pathname.includes("/inquiry")
    ) {
      setActive("문의하기");
    }
  }, []);

  return (
    <>
      <Transition
        show={!isOpen}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="w-full desktop:hidden"
      >
        <nav className="absolute top-0 flex h-[60px] w-full items-center gap-x-2.5 bg-white px-5 py-3 desktop:hidden">
          <button type="button" onClick={() => setIsOpen(true)}>
            <Image src="/menu.png" alt="메뉴" width={30} height={30} />
          </button>
          <Link href="/">
            <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />
          </Link>
        </nav>
      </Transition>

      <Transition
        show={isOpen}
        enter="transition transform duration-300 ease-out"
        enterFrom="-translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition transform duration-200 ease-in"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-full opacity-0"
        className="desktop:hidden"
      >
        <div className="absolute inset-0 z-50 flex h-screen flex-col overflow-x-hidden bg-white desktop:hidden">
          <div className="flex h-[60px] w-full items-center justify-center px-5">
            <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />
            <button type="button" onClick={() => setIsOpen(false)}>
              <Image
                src="/close.png"
                alt="닫기"
                width={30}
                height={30}
                className="absolute left-5 top-[15px]"
              />
            </button>
          </div>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">
              <span className="text-sm font-semibold leading-relaxed text-gray-600">게임소개</span>
              <Image
                src="/dropdown.png"
                className="icon size-4"
                width={16}
                height={16}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/rng-certificate"
              className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"
            >
              RNG 인증 및 공정성
            </Link>
          </details>
          <Link
            href="/announcement"
            className="flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"
          >
            공지사항
          </Link>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">
              <span className="text-sm font-semibold leading-relaxed text-gray-600">문의하기</span>
              <Image
                src="/dropdown.png"
                className="icon size-4"
                width={16}
                height={16}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/faq"
              className="ml-5 flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"
            >
              자주 묻는 질문
            </Link>
            <Link
              href="/inquiry"
              className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"
            >
              1:1 문의
            </Link>
          </details>
          <div className="absolute bottom-10 flex w-full justify-center">
            <Link
              href={`/login?redirect_uri=${pathname ?? "/"}`}
              className="text-base font-normal text-gray-500 underline"
            >
              로그인
            </Link>
          </div>
        </div>
      </Transition>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <nav className="hidden desktop:absolute desktop:top-0 desktop:flex desktop:w-full desktop:flex-col desktop:items-center desktop:border-b desktop:border-b-white/20 desktop:bg-transparent">
        <div className="desktop:mx-auto desktop:flex desktop:h-[120px] desktop:min-w-[1200px] desktop:items-center ">
          <Link href="/">
            <Image src="/logo_white.png" alt="카피바라 로고" width={181} height={70} />
          </Link>
          <div className="desktop:ml-[120px] desktop:grid desktop:grid-cols-3 desktop:gap-x-10">
            {tabs.map((tab) => (
              <div key={tab} className="relative">
                {tab === "공지사항" ? (
                  <Link
                    href="/announcement"
                    className={`desktop:flex desktop:h-[120px] desktop:w-[220px] desktop:items-center desktop:justify-center desktop:text-3xl desktop:font-medium  ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : "desktop:text-white/60"}`}
                  >
                    {tab}
                  </Link>
                ) : (
                  <button
                    className={`desktop:h-[120px] desktop:w-[220px] desktop:text-3xl desktop:font-medium ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : " desktop:text-white/60"}`}
                    onClick={() => setIsOpen((oldState) => !oldState)}
                  >
                    {tab}
                  </button>
                )}
                {active === tab ? (
                  <svg
                    onClick={() => setIsOpen((oldState) => !oldState)}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="220"
                    height="120"
                    viewBox="0 0 220 120"
                    fill="none"
                  >
                    <g opacity="0.21">
                      <mask
                        id="mask0_99_313"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="220"
                        height="120"
                      >
                        <rect width="220" height="120" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_99_313)">
                        <g filter="url(#filter0_f_99_313)">
                          <ellipse
                            cx="110"
                            cy="136.8"
                            rx="67.2222"
                            ry="66"
                            fill="#2398FF"
                            fillOpacity="0.59"
                          />
                        </g>
                      </g>
                    </g>
                    <rect y="118.8" width="220" height="1.2" fill="url(#paint0_linear_99_313)" />
                    <defs>
                      <filter
                        id="filter0_f_99_313"
                        x="12.7778"
                        y="40.8"
                        width="194.444"
                        height="192"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_99_313" />
                      </filter>
                      <linearGradient
                        id="paint0_linear_99_313"
                        x1="0"
                        y1="119.4"
                        x2="220"
                        y2="119.4"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#2398FF" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#2398FF" />
                        <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <Transition
          show={isOpen}
          enter="transition transform duration-300 ease-out"
          enterFrom="-translate-y-full opacity-0"
          enterTo="translate-y-0 opacity-100"
          leave="transition transform duration-200 ease-in"
          leaveFrom="translate-y-0 opacity-100"
          leaveTo="-translate-y-full opacity-0"
          className="hidden desktop:flex desktop:w-full "
        >
          <div className="pl-[301px] desktop:mx-auto desktop:flex desktop:min-w-[1200px] desktop:gap-x-10">
            {tabs.map((tab) => (
              <div key={tab} className="relative">
                {tab === "공지사항" ? (
                  <div className="desktop:h-[120px] desktop:w-[220px]" />
                ) : (
                  <div className="desktop:flex desktop:w-[220px] desktop:flex-col">
                    {subTabs[tab]?.map((subTab) => (
                      <Link
                        key={subTab.text}
                        href={subTab.url}
                        className={`text-white desktop:h-[50px] desktop:py-2.5 desktop:text-center desktop:text-xl desktop:font-medium`}
                      >
                        {subTab.text}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Transition>
      </nav>
    </>
  );
}
