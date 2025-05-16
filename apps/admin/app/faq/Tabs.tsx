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
    <main className="w-full">
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
                href={`/faq/${item.id}`}
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
      <section className="tablet:hidden hidden desktop:block">PC</section>

      <Footer />
    </main>
  );
}
