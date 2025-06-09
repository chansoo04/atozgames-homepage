"use client";
import "./topbar.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Transition } from "@headlessui/react";
import { usePathname } from "next/navigation";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

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
  const { ratio } = useWindowSize();

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
        <nav
          className="absolute top-0 flex w-full items-center bg-white desktop:hidden"
          style={{
            height: mobileSizeCalc(60, ratio),
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
            paddingTop: mobileSizeCalc(15, ratio),
            paddingBottom: mobileSizeCalc(15, ratio),
            columnGap: mobileSizeCalc(10, ratio),
          }}
        >
          <button type="button" onClick={() => setIsOpen(true)}>
            <Image
              src="/menu.png"
              alt="메뉴"
              width={30}
              height={30}
              style={{
                width: mobileSizeCalc(30, ratio),
                height: mobileSizeCalc(30, ratio),
              }}
            />
          </button>
          <Link href="/">
            <Image
              src="/logo_black.png"
              alt="카피바라 로고"
              width={91}
              height={35}
              style={{
                width: mobileSizeCalc(91, ratio),
                height: mobileSizeCalc(35, ratio),
              }}
            />
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
          <div
            className="flex w-full items-center justify-center"
            style={{
              height: mobileSizeCalc(60, ratio),
              paddingLeft: mobileSizeCalc(20, ratio),
              paddingRight: mobileSizeCalc(20, ratio),
            }}
          >
            <Image
              src="/logo_black.png"
              alt="카피바라 로고"
              width={91}
              height={35}
              style={{
                width: mobileSizeCalc(91, ratio),
                height: mobileSizeCalc(35, ratio),
              }}
            />
            <button type="button" onClick={() => setIsOpen(false)}>
              <Image
                src="/close.png"
                alt="닫기"
                width={30}
                height={30}
                className="absolute"
                style={{
                  left: mobileSizeCalc(20, ratio),
                  top: mobileSizeCalc(15, ratio),
                  width: mobileSizeCalc(30, ratio),
                  height: mobileSizeCalc(30, ratio),
                }}
              />
            </button>
          </div>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary
              className="flex w-full items-center justify-between"
              style={{
                height: mobileSizeCalc(50, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                paddingRight: mobileSizeCalc(20, ratio),
                paddingTop: mobileSizeCalc(15, ratio),
                paddingBottom: mobileSizeCalc(15, ratio),
              }}
            >
              <span
                className="font-semibold leading-relaxed text-gray-600"
                style={{
                  fontSize: mobileSizeCalc(14, ratio),
                  lineHeight: mobileSizeCalc(26, ratio),
                }}
              >
                게임소개
              </span>
              <Image
                src="/dropdown.png"
                className="icon"
                width={16}
                height={16}
                style={{
                  width: mobileSizeCalc(16, ratio),
                  height: mobileSizeCalc(16, ratio),
                }}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/rng-certificate"
              className="flex w-full items-center font-semibold text-gray-600"
              style={{
                height: mobileSizeCalc(50, ratio),
                paddingLeft: mobileSizeCalc(40, ratio),
                fontSize: mobileSizeCalc(14, ratio),
                lineHeight: mobileSizeCalc(26, ratio),
              }}
            >
              RNG 인증 및 공정성
            </Link>
          </details>
          <Link
            href="/announcement"
            className="flex w-full items-center border-b-[0.5px] border-gray-300 font-semibold text-gray-600"
            style={{
              height: mobileSizeCalc(50, ratio),
              paddingLeft: mobileSizeCalc(20, ratio),
              fontSize: mobileSizeCalc(14, ratio),
              lineHeight: mobileSizeCalc(26, ratio),
            }}
          >
            공지사항
          </Link>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary
              className="flex w-full items-center justify-between"
              style={{
                height: mobileSizeCalc(50, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                paddingRight: mobileSizeCalc(20, ratio),
                paddingTop: mobileSizeCalc(15, ratio),
                paddingBottom: mobileSizeCalc(15, ratio),
              }}
            >
              <span
                className="font-semibold text-gray-600"
                style={{
                  fontSize: mobileSizeCalc(14, ratio),
                  lineHeight: mobileSizeCalc(26, ratio),
                }}
              >
                문의하기
              </span>
              <Image
                src="/dropdown.png"
                className="icon"
                width={16}
                height={16}
                style={{
                  width: mobileSizeCalc(16, ratio),
                  height: mobileSizeCalc(16, ratio),
                }}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/faq"
              className="flex w-full items-center border-b-[0.5px] border-gray-300 font-semibold text-gray-600"
              style={{
                height: mobileSizeCalc(50, ratio),
                marginLeft: mobileSizeCalc(20, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                fontSize: mobileSizeCalc(14, ratio),
                lineHeight: mobileSizeCalc(26, ratio),
              }}
            >
              자주 묻는 질문
            </Link>
            <Link
              href="/inquiry"
              className="flex w-full items-center font-semibold text-gray-600"
              style={{
                height: mobileSizeCalc(50, ratio),
                marginLeft: mobileSizeCalc(20, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                fontSize: mobileSizeCalc(14, ratio),
                lineHeight: mobileSizeCalc(26, ratio),
              }}
            >
              1:1 문의
            </Link>
          </details>
          <div
            className="absolute flex w-full justify-center"
            style={{
              bottom: mobileSizeCalc(40, ratio),
            }}
          >
            <Link
              href={`/login?redirect_uri=${pathname ?? "/"}`}
              className="text-base font-normal text-gray-500 underline"
              style={{
                fontSize: mobileSizeCalc(16, ratio),
              }}
            >
              로그인
            </Link>
          </div>
        </div>
      </Transition>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <nav className="hidden desktop:absolute desktop:top-0 desktop:flex desktop:w-full desktop:flex-col desktop:items-center desktop:bg-transparent">
        <div className="desktop:flex desktop:w-full desktop:flex-col desktop:items-center desktop:border-b desktop:border-b-white/20">
          <div
            className="desktop:mx-auto desktop:flex desktop:items-center "
            style={{
              height: desktopSizeCalc(120, ratio),
              minWidth: desktopSizeCalc(1200, ratio),
            }}
          >
            <Link href="/">
              <Image
                src="/logo_white.png"
                alt="카피바라 로고"
                width={181}
                height={70}
                style={{
                  width: desktopSizeCalc(181, ratio),
                  height: desktopSizeCalc(70, ratio),
                }}
              />
            </Link>
            <div
              className="desktop:grid desktop:grid-cols-3 "
              style={{
                marginLeft: desktopSizeCalc(120, ratio),
                columnGap: desktopSizeCalc(40, ratio),
              }}
            >
              {tabs.map((tab) => (
                <div key={tab} className="relative">
                  {tab === "공지사항" ? (
                    <Link
                      href="/announcement"
                      className={`desktop:flex desktop:items-center desktop:justify-center desktop:font-medium  ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : "desktop:text-white/60"}`}
                      style={{
                        height: desktopSizeCalc(120, ratio),
                        width: desktopSizeCalc(220, ratio),
                        fontSize: desktopSizeCalc(28, ratio),
                      }}
                    >
                      {tab}
                    </Link>
                  ) : (
                    <button
                      className={`desktop:font-medium ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : " desktop:text-white/60"}`}
                      style={{
                        height: desktopSizeCalc(120, ratio),
                        width: desktopSizeCalc(220, ratio),
                        fontSize: desktopSizeCalc(28, ratio),
                      }}
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
                          <feGaussianBlur
                            stdDeviation="15"
                            result="effect1_foregroundBlur_99_313"
                          />
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
          <div
            className="desktop:mx-auto desktop:flex"
            style={{
              paddingLeft: desktopSizeCalc(301, ratio),
              minWidth: desktopSizeCalc(1200, ratio),
              columnGap: desktopSizeCalc(40, ratio),
            }}
          >
            {tabs.map((tab) => (
              <div key={tab} className="relative" style={{ width: desktopSizeCalc(220, ratio) }}>
                {tab === "공지사항" ? (
                  <div
                    style={{
                      height: desktopSizeCalc(120, ratio),
                      width: desktopSizeCalc(220, ratio),
                    }}
                  />
                ) : (
                  <div
                    className="desktop:flex desktop:flex-col"
                    style={{
                      width: desktopSizeCalc(220, ratio),
                      marginTop: desktopSizeCalc(11, ratio),
                    }}
                  >
                    {subTabs[tab]?.map((subTab) => (
                      <Link
                        key={subTab.text}
                        href={subTab.url}
                        className={`leading-none text-white desktop:text-center desktop:font-medium`}
                        style={{
                          height: desktopSizeCalc(50, ratio),
                          paddingTop: desktopSizeCalc(11, ratio),
                          paddingBottom: desktopSizeCalc(11, ratio),
                          fontSize: desktopSizeCalc(20, ratio),
                        }}
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
