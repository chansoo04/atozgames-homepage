"use client";
import { useState } from "react";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Link from "next/link";
import Image from "next/image";

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

const tabs = ["게임문의", "유료/결제", "계정"] as const;
export default function Tabs({ faqs }: { faqs: any }) {
  const [active, setActive] = useState<(typeof tabs)[number]>("게임문의");

  return (
    <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop2.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">자주 묻는 질문</h1>

        <div className="mt-5 flex w-full flex-col rounded-[20px] bg-gray-100 px-5 pb-5 pt-2.5">
          <nav className="grid grid-cols-3 gap-x-[5px]">
            {tabs.map((tab) => (
              <div key={tab} className="relative">
                <button
                  onClick={() => setActive(tab)}
                  className={`w-full py-3 text-center ${active === tab ? "text-base font-semibold text-primary" : "text-base font-normal text-gray-400"}`}
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
                        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_99_2124" />
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
                className="flex w-full flex-col gap-y-2.5 border-b border-gray-200 py-[15px]"
                href={`/apps/admin/app/(Web)/faq/${item.id}`}
              >
                <div className="grid grid-cols-[45px_1fr] items-center gap-x-2.5">
                  <div
                    className={`rounded-full px-2.5 text-sm font-semibold ${item.subcategory === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
                  >
                    {item.subcategory}
                  </div>
                  <div className="truncate text-base font-medium leading-tight text-gray-700">
                    {item.title}
                  </div>
                </div>
                <div className="flex items-center gap-x-[5px]">
                  <Image src="/clock.png" alt="작성일" width={14} height={14} />
                  <div className="text-sm font-normal text-gray-500">
                    {changeDate(item.created_at)}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1 ">
        <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[1200px] desktop:flex-col">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            자주 묻는 질문
          </h1>
          <div className="mb-20 min-h-[1150px] desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:pb-5 desktop:pt-[30px]">
            <nav className="desktop:flex">
              {tabs.map((tab) => (
                <div key={tab} className="relative">
                  <button
                    onClick={() => setActive(tab)}
                    className={`flex h-[100px] w-[200px] items-center justify-center text-3xl font-medium ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : "text-white/60"}`}
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
            <div className="mb-20 desktop:mt-5 desktop:flex desktop:flex-col">
              {faqs
                ?.filter((faq: any) => faq.category === active)
                ?.map((item: any) => (
                  <Link
                    key={item.id.toString()}
                    href={`/apps/admin/app/(Web)/faq/${item.id}`}
                    className="flex w-full justify-between border-b border-gray-600 py-10"
                  >
                    <div className="flex items-center gap-x-4">
                      <div
                        className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${item.subcategory === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
                      >
                        {item.subcategory}
                      </div>
                      <div className="w-[500px] truncate text-lg font-medium text-white">
                        {item.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <Image src="/clock.png" alt="작성일" width={20} height={20} />
                      <div className="text-lg font-medium text-gray-400">
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
