"use client";
import { useState } from "react";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Link from "next/link";
import Image from "next/image";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

// TODO: 페이지네이션 만들기

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

const tabs = ["게임문의", "유료/결제", "계정"] as const;
export default function Tabs({ faqs }: { faqs: any }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("게임문의");
  const { ratio } = useWindowSize();

  return (
    <main className="relative w-full desktop:bg-black">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex flex-col items-center desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
          minHeight: mobileSizeCalc(783, ratio),
          paddingBottom: mobileSizeCalc(40, ratio),
          paddingTop: mobileSizeCalc(92, ratio),
        }}
      >
        <TopBar />
        <h1
          className="font-bold text-gray-700"
          style={{
            fontSize: mobileSizeCalc(18, ratio),
            lineHeight: mobileSizeCalc(26, ratio),
          }}
        >
          자주 묻는 질문
        </h1>

        <div
          className="w-full"
          style={{
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
          }}
        >
          <div
            className="flex w-full flex-col rounded-[20px] bg-gray-100"
            style={{
              marginTop: mobileSizeCalc(20, ratio),
              paddingLeft: mobileSizeCalc(20, ratio),
              paddingRight: mobileSizeCalc(20, ratio),
              paddingBottom: mobileSizeCalc(20, ratio),
              paddingTop: mobileSizeCalc(10, ratio),
            }}
          >
            <nav
              className="grid grid-cols-3"
              style={{
                columnGap: mobileSizeCalc(5, ratio),
              }}
            >
              {tabs.map((tab) => (
                <div key={tab} className="relative">
                  <button
                    onClick={() => setActive(tab)}
                    className={`w-full text-center ${active === tab ? "font-semibold text-primary" : "font-normal text-gray-400"}`}
                    style={{
                      paddingTop: mobileSizeCalc(12, ratio),
                      paddingBottom: mobileSizeCalc(12, ratio),
                      fontSize: mobileSizeCalc(16, ratio),
                      lineHeight: mobileSizeCalc(26, ratio),
                    }}
                  >
                    {tab}
                  </button>
                  {active === tab ? (
                    <svg
                      onClick={() => setActive(tab)}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="90"
                      height="50"
                      viewBox="0 0 90 50"
                      fill="none"
                    >
                      <g opacity="0.21">
                        <mask
                          id="mask0_99_2124"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="90"
                          height="50"
                        >
                          <rect width="90" height="50" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_99_2124)">
                          <g filter="url(#filter0_f_99_2124)">
                            <ellipse
                              cx="45"
                              cy="57"
                              rx="27.5"
                              ry="27.5"
                              fill="#2398FF"
                              fillOpacity="0.59"
                            />
                          </g>
                        </g>
                      </g>
                      <rect
                        y="49.1665"
                        width="90"
                        height="0.833333"
                        fill="url(#paint0_linear_99_2124)"
                      />
                      <defs>
                        <filter
                          id="filter0_f_99_2124"
                          x="-12.5"
                          y="-0.5"
                          width="115"
                          height="115"
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
                            result="effect1_foregroundBlur_99_2124"
                          />
                        </filter>
                        <linearGradient
                          id="paint0_linear_99_2124"
                          x1="0"
                          y1="49.5832"
                          x2="90"
                          y2="49.5832"
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
            </nav>

            {faqs
              ?.filter((faq: any) => faq.category === active)
              ?.map((item: any) => (
                <Link
                  key={item.id.toString()}
                  className="flex w-full flex-col border-b border-gray-200"
                  href={`/apps/admin/app/(Web)/faq/${item.id}`}
                  style={{
                    rowGap: mobileSizeCalc(10, ratio),
                    paddingTop: mobileSizeCalc(15, ratio),
                    paddingBottom: mobileSizeCalc(15, ratio),
                  }}
                >
                  <div
                    className="grid items-center"
                    style={{
                      columnGap: mobileSizeCalc(10, ratio),
                      gridTemplateColumns: `${mobileSizeCalc(45, ratio)} 1fr`,
                    }}
                  >
                    <div
                      className={`flex items-center rounded-full font-semibold ${item.subcategory === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
                      style={{
                        paddingLeft: mobileSizeCalc(10, ratio),
                        paddingRight: mobileSizeCalc(10, ratio),
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(14, ratio),
                        width: mobileSizeCalc(45, ratio),
                        height: mobileSizeCalc(20, ratio),
                      }}
                    >
                      {item.subcategory}
                    </div>
                    <div
                      className="truncate font-medium text-gray-700"
                      style={{
                        fontSize: mobileSizeCalc(16, ratio),
                        lineHeight: mobileSizeCalc(22, ratio),
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                  <div
                    className="flex items-center"
                    style={{
                      columnGap: mobileSizeCalc(5, ratio),
                    }}
                  >
                    <Image
                      src="/clock.png"
                      alt="작성일"
                      width={14}
                      height={14}
                      style={{
                        width: mobileSizeCalc(14, ratio),
                        height: mobileSizeCalc(14, ratio),
                      }}
                    />
                    <div
                      className="font-normal text-gray-500"
                      style={{
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      {changeDate(item.created_at)}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative mx-auto hidden desktop:block desktop:aspect-[1920/2086] desktop:w-[1920px] desktop:min-w-[1920px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div
          className="desktop:flex desktop:flex-col desktop:items-center"
          style={{
            paddingTop: desktopSizeCalc(240, ratio),
          }}
        >
          <h1
            className="desktop:text-center desktop:font-bold desktop:text-white"
            style={{
              fontSize: desktopSizeCalc(50, ratio),
              lineHeight: desktopSizeCalc(50, ratio),
            }}
          >
            자주 묻는 질문
          </h1>

          <div
            className="desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70"
            style={{
              width: desktopSizeCalc(1200, ratio),
              minHeight: desktopSizeCalc(1150, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              marginBottom: desktopSizeCalc(80, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
              paddingTop: desktopSizeCalc(20, ratio),
              paddingBottom: desktopSizeCalc(20, ratio),
            }}
          >
            <nav className="desktop:flex">
              {tabs.map((tab) => (
                <div key={tab} className="relative">
                  <button
                    onClick={() => setActive(tab)}
                    className={`flex items-center justify-center font-medium ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : "text-white/60"}`}
                    style={{
                      height: desktopSizeCalc(100, ratio),
                      width: desktopSizeCalc(200, ratio),
                      fontSize: desktopSizeCalc(28, ratio),
                      lineHeight: desktopSizeCalc(28, ratio),
                    }}
                  >
                    {tab}
                  </button>
                  {active === tab ? (
                    <svg
                      onClick={() => setActive(tab)}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2"
                      xmlns="http://www.w3.org/2000/svg"
                      width="200"
                      height="100"
                      viewBox="0 0 200 100"
                      fill="none"
                    >
                      <g opacity="0.21">
                        <mask
                          id="mask0_99_623"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="200"
                          height="100"
                        >
                          <rect width="200" height="100" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_99_623)">
                          <g filter="url(#filter0_f_99_623)">
                            <ellipse
                              cx="99.9998"
                              cy="114"
                              rx="61.1111"
                              ry="55"
                              fill="#2398FF"
                              fillOpacity="0.59"
                            />
                          </g>
                        </g>
                      </g>
                      <rect y="99" width="200" height="1" fill="url(#paint0_linear_99_623)" />
                      <defs>
                        <filter
                          id="filter0_f_99_623"
                          x="8.88867"
                          y="29"
                          width="182.223"
                          height="170"
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
                            result="effect1_foregroundBlur_99_623"
                          />
                        </filter>
                        <linearGradient
                          id="paint0_linear_99_623"
                          x1="0"
                          y1="99.5"
                          x2="200"
                          y2="99.5"
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
            </nav>
            <div
              className="desktop:flex desktop:flex-col"
              style={{
                marginBottom: desktopSizeCalc(80, ratio),
                marginTop: desktopSizeCalc(20, ratio),
              }}
            >
              {faqs
                ?.filter((faq: any) => faq.category === active)
                ?.map((item: any) => (
                  <Link
                    key={item.id.toString()}
                    href={`/apps/admin/app/(Web)/faq/${item.id}`}
                    className="flex w-full justify-between border-b border-gray-600"
                    style={{
                      paddingBottom: desktopSizeCalc(40, ratio),
                      paddingTop: desktopSizeCalc(40, ratio),
                    }}
                  >
                    <div
                      className="flex items-center"
                      style={{
                        columnGap: desktopSizeCalc(16, ratio),
                      }}
                    >
                      <div
                        className={`flex items-center justify-center rounded-full font-medium ${item.subcategory === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
                        style={{
                          height: desktopSizeCalc(30, ratio),
                          width: desktopSizeCalc(64, ratio),
                          fontSize: desktopSizeCalc(18, ratio),
                          lineHeight: desktopSizeCalc(18, ratio),
                        }}
                      >
                        {item.subcategory}
                      </div>
                      <div
                        className="truncate font-medium text-white"
                        style={{
                          width: desktopSizeCalc(500, ratio),
                          fontSize: desktopSizeCalc(18, ratio),
                          lineHeight: desktopSizeCalc(26, ratio),
                        }}
                      >
                        {item.title}
                      </div>
                    </div>
                    <div
                      className="flex items-center"
                      style={{
                        columnGap: desktopSizeCalc(4, ratio),
                      }}
                    >
                      <Image
                        src="/clock.png"
                        alt="작성일"
                        width={20}
                        height={20}
                        style={{
                          width: desktopSizeCalc(20, ratio),
                          height: desktopSizeCalc(20, ratio),
                        }}
                      />
                      <div
                        className="font-medium text-gray-400"
                        style={{
                          fontSize: desktopSizeCalc(18, ratio),
                          lineHeight: desktopSizeCalc(26, ratio),
                        }}
                      >
                        {changeDate(item.created_at)}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
