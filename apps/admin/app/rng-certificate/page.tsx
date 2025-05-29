import type { Metadata } from "next";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atozgames.net/rng-certificate"),
  title: "아토즈포커 - 빠르고 스릴있는 포커게임",
  openGraph: {
    type: "website",
    title: "아토즈포커 - 빠르고 스릴있는 포커게임",
    description:
      "아토즈포커는 BMM TestLabs로부터 RNG 인증을 받았습니다. 공정한 게임 진행을 보장합니다",
    url: "https://www.atozgames.net/rng-certificate",
    siteName: "아토즈포커",
    // images: "https://storage.googleapis.com/static.carepet.io/cvsc/cvsc_opengraph.png",
    // TODO: 이미지 제작 후 받기
  },
  category: "game",
  keywords: ["아토즈포커", "모바일포커", "텍사스홀덤", "로우바둑이"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description:
    "아토즈포커는 BMM TestLabs로부터 RNG 인증을 받았습니다. 공정한 게임 진행을 보장합니다",
};

export default async function Page() {
  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex min-h-[90vh] flex-col items-center pb-10 pt-[92px] desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <TopBar />
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">RNG 인증 및 공정성</h1>
        <div className="w-full px-5">
          <div className="mt-5 h-[380px] w-full rounded-lg bg-gray-400" />
          <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
            <div className="relative pb-1 pl-1 pr-2 pt-1.5">
              2ACE 포커는
              <svg
                className="absolute left-0 top-1"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="30"
                viewBox="0 0 100 30"
                fill="none"
              >
                <g opacity="0.21">
                  <mask
                    id="mask0_48_5571"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="100"
                    height="30"
                  >
                    <rect width="100" height="30" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_48_5571)">
                    <g filter="url(#filter0_f_48_5571)">
                      <ellipse
                        cx="50"
                        cy="34.2002"
                        rx="30.5556"
                        ry="16.5"
                        fill="#2398FF"
                        fillOpacity="0.59"
                      />
                    </g>
                  </g>
                </g>
                <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
                <defs>
                  <filter
                    id="filter0_f_48_5571"
                    x="-10.5555"
                    y="-12.2998"
                    width="121.111"
                    height="93"
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
                    <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
                  </filter>
                  <linearGradient
                    id="paint0_linear_48_5571"
                    x1="0"
                    y1="29.5"
                    x2="100"
                    y2="29.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2398FF" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#2398FF" />
                    <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-2.5 text-sm font-normal text-gray-700">
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>

          <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
            <div className="relative pb-1 pl-1 pr-2 pt-1.5">
              2ACE 포커는
              <svg
                className="absolute left-0 top-1"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="30"
                viewBox="0 0 100 30"
                fill="none"
              >
                <g opacity="0.21">
                  <mask
                    id="mask0_48_5571"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="100"
                    height="30"
                  >
                    <rect width="100" height="30" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_48_5571)">
                    <g filter="url(#filter0_f_48_5571)">
                      <ellipse
                        cx="50"
                        cy="34.2002"
                        rx="30.5556"
                        ry="16.5"
                        fill="#2398FF"
                        fillOpacity="0.59"
                      />
                    </g>
                  </g>
                </g>
                <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
                <defs>
                  <filter
                    id="filter0_f_48_5571"
                    x="-10.5555"
                    y="-12.2998"
                    width="121.111"
                    height="93"
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
                    <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
                  </filter>
                  <linearGradient
                    id="paint0_linear_48_5571"
                    x1="0"
                    y1="29.5"
                    x2="100"
                    y2="29.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2398FF" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#2398FF" />
                    <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-2.5 text-sm font-normal text-gray-700">
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>

          <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
            <div className="relative pb-1 pl-1 pr-2 pt-1.5">
              2ACE 포커는
              <svg
                className="absolute left-0 top-1"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="30"
                viewBox="0 0 100 30"
                fill="none"
              >
                <g opacity="0.21">
                  <mask
                    id="mask0_48_5571"
                    style={{ maskType: "alpha" }}
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="100"
                    height="30"
                  >
                    <rect width="100" height="30" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_48_5571)">
                    <g filter="url(#filter0_f_48_5571)">
                      <ellipse
                        cx="50"
                        cy="34.2002"
                        rx="30.5556"
                        ry="16.5"
                        fill="#2398FF"
                        fillOpacity="0.59"
                      />
                    </g>
                  </g>
                </g>
                <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
                <defs>
                  <filter
                    id="filter0_f_48_5571"
                    x="-10.5555"
                    y="-12.2998"
                    width="121.111"
                    height="93"
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
                    <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
                  </filter>
                  <linearGradient
                    id="paint0_linear_48_5571"
                    x1="0"
                    y1="29.5"
                    x2="100"
                    y2="29.5"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#2398FF" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#2398FF" />
                    <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-2.5 text-sm font-normal text-gray-700">
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            RNG 인증 및 공정성
          </h1>

          <div className="max-w-[1200px] desktop:mt-[142px] desktop:flex desktop:gap-x-[50px] desktop:rounded-[30px] desktop:bg-[#16172D]/70 desktop:p-[70px]">
            <div className="bg-white desktop:max-h-[810px] desktop:min-h-[810px] desktop:min-w-[510px] desktop:max-w-[510px]" />
            <div className="gap-y-10 desktop:flex desktop:flex-col">
              <div>
                <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
                  2ACE 포커는
                  <svg
                    className="absolute left-0 top-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="160"
                    height="45"
                    viewBox="0 0 160 45"
                    fill="none"
                  >
                    <g opacity="0.21">
                      <mask
                        id="mask0_43_1439"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="160"
                        height="45"
                      >
                        <rect width="160" height="44.9984" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_43_1439)">
                        <g filter="url(#filter0_f_43_1439)">
                          <ellipse
                            cx="80"
                            cy="51.2982"
                            rx="48.8889"
                            ry="24.7491"
                            fill="#23FFE3"
                            fillOpacity="0.59"
                          />
                        </g>
                      </g>
                    </g>
                    <rect
                      y="44.2485"
                      width="160"
                      height="0.751505"
                      fill="url(#paint0_linear_43_1439)"
                    />
                    <defs>
                      <filter
                        id="filter0_f_43_1439"
                        x="1.11108"
                        y="-3.45093"
                        width="157.778"
                        height="109.498"
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
                        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
                      </filter>
                      <linearGradient
                        id="paint0_linear_43_1439"
                        x1="0"
                        y1="44.6243"
                        x2="160"
                        y2="44.6243"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#23FFE3" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#23FFE3" />
                        <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
                  2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
                  인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
                  검증하는 국제 공식 인증입니다.
                </div>
              </div>
              <div>
                <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
                  2ACE 포커는
                  <svg
                    className="absolute left-0 top-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="160"
                    height="45"
                    viewBox="0 0 160 45"
                    fill="none"
                  >
                    <g opacity="0.21">
                      <mask
                        id="mask0_43_1439"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="160"
                        height="45"
                      >
                        <rect width="160" height="44.9984" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_43_1439)">
                        <g filter="url(#filter0_f_43_1439)">
                          <ellipse
                            cx="80"
                            cy="51.2982"
                            rx="48.8889"
                            ry="24.7491"
                            fill="#23FFE3"
                            fillOpacity="0.59"
                          />
                        </g>
                      </g>
                    </g>
                    <rect
                      y="44.2485"
                      width="160"
                      height="0.751505"
                      fill="url(#paint0_linear_43_1439)"
                    />
                    <defs>
                      <filter
                        id="filter0_f_43_1439"
                        x="1.11108"
                        y="-3.45093"
                        width="157.778"
                        height="109.498"
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
                        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
                      </filter>
                      <linearGradient
                        id="paint0_linear_43_1439"
                        x1="0"
                        y1="44.6243"
                        x2="160"
                        y2="44.6243"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#23FFE3" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#23FFE3" />
                        <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
                  2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
                  인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
                  검증하는 국제 공식 인증입니다.
                </div>
              </div>
              <div>
                <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
                  2ACE 포커는
                  <svg
                    className="absolute left-0 top-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="160"
                    height="45"
                    viewBox="0 0 160 45"
                    fill="none"
                  >
                    <g opacity="0.21">
                      <mask
                        id="mask0_43_1439"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="160"
                        height="45"
                      >
                        <rect width="160" height="44.9984" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_43_1439)">
                        <g filter="url(#filter0_f_43_1439)">
                          <ellipse
                            cx="80"
                            cy="51.2982"
                            rx="48.8889"
                            ry="24.7491"
                            fill="#23FFE3"
                            fillOpacity="0.59"
                          />
                        </g>
                      </g>
                    </g>
                    <rect
                      y="44.2485"
                      width="160"
                      height="0.751505"
                      fill="url(#paint0_linear_43_1439)"
                    />
                    <defs>
                      <filter
                        id="filter0_f_43_1439"
                        x="1.11108"
                        y="-3.45093"
                        width="157.778"
                        height="109.498"
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
                        <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
                      </filter>
                      <linearGradient
                        id="paint0_linear_43_1439"
                        x1="0"
                        y1="44.6243"
                        x2="160"
                        y2="44.6243"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#23FFE3" stopOpacity="0" />
                        <stop offset="0.5" stopColor="#23FFE3" />
                        <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
                  2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
                  인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
                  검증하는 국제 공식 인증입니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
    // <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop1.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
    //   <TopBar />
    //
    //   {/* 모바일(<640)에서만 보임 */}
    //   <section
    //     className="mt-[60px] flex flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
    //     style={{
    //       background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
    //     }}
    //   >
    //     <h1 className="text-lg font-bold leading-relaxed text-gray-700">RNG 인증 및 공정성</h1>
    //     <div className="mt-5 h-[380px] w-full rounded-lg bg-gray-400" />
    //     <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
    //       <div className="relative pb-1 pl-1 pr-2 pt-1.5">
    //         2ACE 포커는
    //         <svg
    //           className="absolute left-0 top-1"
    //           xmlns="http://www.w3.org/2000/svg"
    //           width="100"
    //           height="30"
    //           viewBox="0 0 100 30"
    //           fill="none"
    //         >
    //           <g opacity="0.21">
    //             <mask
    //               id="mask0_48_5571"
    //               style={{ maskType: "alpha" }}
    //               maskUnits="userSpaceOnUse"
    //               x="0"
    //               y="0"
    //               width="100"
    //               height="30"
    //             >
    //               <rect width="100" height="30" fill="#D9D9D9" />
    //             </mask>
    //             <g mask="url(#mask0_48_5571)">
    //               <g filter="url(#filter0_f_48_5571)">
    //                 <ellipse
    //                   cx="50"
    //                   cy="34.2002"
    //                   rx="30.5556"
    //                   ry="16.5"
    //                   fill="#2398FF"
    //                   fillOpacity="0.59"
    //                 />
    //               </g>
    //             </g>
    //           </g>
    //           <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
    //           <defs>
    //             <filter
    //               id="filter0_f_48_5571"
    //               x="-10.5555"
    //               y="-12.2998"
    //               width="121.111"
    //               height="93"
    //               filterUnits="userSpaceOnUse"
    //               colorInterpolationFilters="sRGB"
    //             >
    //               <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //               <feBlend
    //                 mode="normal"
    //                 in="SourceGraphic"
    //                 in2="BackgroundImageFix"
    //                 result="shape"
    //               />
    //               <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
    //             </filter>
    //             <linearGradient
    //               id="paint0_linear_48_5571"
    //               x1="0"
    //               y1="29.5"
    //               x2="100"
    //               y2="29.5"
    //               gradientUnits="userSpaceOnUse"
    //             >
    //               <stop stopColor="#2398FF" stopOpacity="0" />
    //               <stop offset="0.5" stopColor="#2398FF" />
    //               <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
    //             </linearGradient>
    //           </defs>
    //         </svg>
    //       </div>
    //
    //       <div className="mt-2.5 text-sm font-normal text-gray-700">
    //         2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
    //         게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
    //         공식 인증입니다.
    //       </div>
    //     </div>
    //
    //     <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
    //       <div className="relative pb-1 pl-1 pr-2 pt-1.5">
    //         2ACE 포커는
    //         <svg
    //           className="absolute left-0 top-1"
    //           xmlns="http://www.w3.org/2000/svg"
    //           width="100"
    //           height="30"
    //           viewBox="0 0 100 30"
    //           fill="none"
    //         >
    //           <g opacity="0.21">
    //             <mask
    //               id="mask0_48_5571"
    //               style={{ maskType: "alpha" }}
    //               maskUnits="userSpaceOnUse"
    //               x="0"
    //               y="0"
    //               width="100"
    //               height="30"
    //             >
    //               <rect width="100" height="30" fill="#D9D9D9" />
    //             </mask>
    //             <g mask="url(#mask0_48_5571)">
    //               <g filter="url(#filter0_f_48_5571)">
    //                 <ellipse
    //                   cx="50"
    //                   cy="34.2002"
    //                   rx="30.5556"
    //                   ry="16.5"
    //                   fill="#2398FF"
    //                   fillOpacity="0.59"
    //                 />
    //               </g>
    //             </g>
    //           </g>
    //           <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
    //           <defs>
    //             <filter
    //               id="filter0_f_48_5571"
    //               x="-10.5555"
    //               y="-12.2998"
    //               width="121.111"
    //               height="93"
    //               filterUnits="userSpaceOnUse"
    //               colorInterpolationFilters="sRGB"
    //             >
    //               <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //               <feBlend
    //                 mode="normal"
    //                 in="SourceGraphic"
    //                 in2="BackgroundImageFix"
    //                 result="shape"
    //               />
    //               <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
    //             </filter>
    //             <linearGradient
    //               id="paint0_linear_48_5571"
    //               x1="0"
    //               y1="29.5"
    //               x2="100"
    //               y2="29.5"
    //               gradientUnits="userSpaceOnUse"
    //             >
    //               <stop stopColor="#2398FF" stopOpacity="0" />
    //               <stop offset="0.5" stopColor="#2398FF" />
    //               <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
    //             </linearGradient>
    //           </defs>
    //         </svg>
    //       </div>
    //
    //       <div className="mt-2.5 text-sm font-normal text-gray-700">
    //         2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
    //         게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
    //         공식 인증입니다.
    //       </div>
    //     </div>
    //
    //     <div className="mt-[30px] flex flex-col rounded-2xl bg-white px-4 pb-5 pt-4">
    //       <div className="relative pb-1 pl-1 pr-2 pt-1.5">
    //         2ACE 포커는
    //         <svg
    //           className="absolute left-0 top-1"
    //           xmlns="http://www.w3.org/2000/svg"
    //           width="100"
    //           height="30"
    //           viewBox="0 0 100 30"
    //           fill="none"
    //         >
    //           <g opacity="0.21">
    //             <mask
    //               id="mask0_48_5571"
    //               style={{ maskType: "alpha" }}
    //               maskUnits="userSpaceOnUse"
    //               x="0"
    //               y="0"
    //               width="100"
    //               height="30"
    //             >
    //               <rect width="100" height="30" fill="#D9D9D9" />
    //             </mask>
    //             <g mask="url(#mask0_48_5571)">
    //               <g filter="url(#filter0_f_48_5571)">
    //                 <ellipse
    //                   cx="50"
    //                   cy="34.2002"
    //                   rx="30.5556"
    //                   ry="16.5"
    //                   fill="#2398FF"
    //                   fillOpacity="0.59"
    //                 />
    //               </g>
    //             </g>
    //           </g>
    //           <rect y="29" width="100" height="1" fill="url(#paint0_linear_48_5571)" />
    //           <defs>
    //             <filter
    //               id="filter0_f_48_5571"
    //               x="-10.5555"
    //               y="-12.2998"
    //               width="121.111"
    //               height="93"
    //               filterUnits="userSpaceOnUse"
    //               colorInterpolationFilters="sRGB"
    //             >
    //               <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //               <feBlend
    //                 mode="normal"
    //                 in="SourceGraphic"
    //                 in2="BackgroundImageFix"
    //                 result="shape"
    //               />
    //               <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_48_5571" />
    //             </filter>
    //             <linearGradient
    //               id="paint0_linear_48_5571"
    //               x1="0"
    //               y1="29.5"
    //               x2="100"
    //               y2="29.5"
    //               gradientUnits="userSpaceOnUse"
    //             >
    //               <stop stopColor="#2398FF" stopOpacity="0" />
    //               <stop offset="0.5" stopColor="#2398FF" />
    //               <stop offset="1" stopColor="#2398FF" stopOpacity="0" />
    //             </linearGradient>
    //           </defs>
    //         </svg>
    //       </div>
    //
    //       <div className="mt-2.5 text-sm font-normal text-gray-700">
    //         2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
    //         게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
    //         공식 인증입니다.
    //       </div>
    //     </div>
    //   </section>
    //
    //   {/* 데스크탑(≥1024)에서만 보임 */}
    //   <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1 ">
    //     <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[1200px] desktop:flex-col">
    //       <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
    //         RNG 인증 및 공정성
    //       </h1>
    //       <div className="desktop:mt-[142px] desktop:flex desktop:gap-x-[50px] desktop:rounded-[30px] desktop:bg-[#16172D]/70 desktop:p-[70px]">
    //         <div className="bg-white desktop:max-h-[810px] desktop:min-h-[810px] desktop:min-w-[510px] desktop:max-w-[510px]" />
    //         <div className="gap-y-10 desktop:flex desktop:flex-col">
    //           <div>
    //             <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
    //               2ACE 포커는
    //               <svg
    //                 className="absolute left-0 top-2"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="160"
    //                 height="45"
    //                 viewBox="0 0 160 45"
    //                 fill="none"
    //               >
    //                 <g opacity="0.21">
    //                   <mask
    //                     id="mask0_43_1439"
    //                     style={{ maskType: "alpha" }}
    //                     maskUnits="userSpaceOnUse"
    //                     x="0"
    //                     y="0"
    //                     width="160"
    //                     height="45"
    //                   >
    //                     <rect width="160" height="44.9984" fill="#D9D9D9" />
    //                   </mask>
    //                   <g mask="url(#mask0_43_1439)">
    //                     <g filter="url(#filter0_f_43_1439)">
    //                       <ellipse
    //                         cx="80"
    //                         cy="51.2982"
    //                         rx="48.8889"
    //                         ry="24.7491"
    //                         fill="#23FFE3"
    //                         fillOpacity="0.59"
    //                       />
    //                     </g>
    //                   </g>
    //                 </g>
    //                 <rect
    //                   y="44.2485"
    //                   width="160"
    //                   height="0.751505"
    //                   fill="url(#paint0_linear_43_1439)"
    //                 />
    //                 <defs>
    //                   <filter
    //                     id="filter0_f_43_1439"
    //                     x="1.11108"
    //                     y="-3.45093"
    //                     width="157.778"
    //                     height="109.498"
    //                     filterUnits="userSpaceOnUse"
    //                     colorInterpolationFilters="sRGB"
    //                   >
    //                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //                     <feBlend
    //                       mode="normal"
    //                       in="SourceGraphic"
    //                       in2="BackgroundImageFix"
    //                       result="shape"
    //                     />
    //                     <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
    //                   </filter>
    //                   <linearGradient
    //                     id="paint0_linear_43_1439"
    //                     x1="0"
    //                     y1="44.6243"
    //                     x2="160"
    //                     y2="44.6243"
    //                     gradientUnits="userSpaceOnUse"
    //                   >
    //                     <stop stopColor="#23FFE3" stopOpacity="0" />
    //                     <stop offset="0.5" stopColor="#23FFE3" />
    //                     <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
    //                   </linearGradient>
    //                 </defs>
    //               </svg>
    //             </div>
    //             <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
    //               2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
    //               인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
    //               검증하는 국제 공식 인증입니다.
    //             </div>
    //           </div>
    //           <div>
    //             <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
    //               2ACE 포커는
    //               <svg
    //                 className="absolute left-0 top-2"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="160"
    //                 height="45"
    //                 viewBox="0 0 160 45"
    //                 fill="none"
    //               >
    //                 <g opacity="0.21">
    //                   <mask
    //                     id="mask0_43_1439"
    //                     style={{ maskType: "alpha" }}
    //                     maskUnits="userSpaceOnUse"
    //                     x="0"
    //                     y="0"
    //                     width="160"
    //                     height="45"
    //                   >
    //                     <rect width="160" height="44.9984" fill="#D9D9D9" />
    //                   </mask>
    //                   <g mask="url(#mask0_43_1439)">
    //                     <g filter="url(#filter0_f_43_1439)">
    //                       <ellipse
    //                         cx="80"
    //                         cy="51.2982"
    //                         rx="48.8889"
    //                         ry="24.7491"
    //                         fill="#23FFE3"
    //                         fillOpacity="0.59"
    //                       />
    //                     </g>
    //                   </g>
    //                 </g>
    //                 <rect
    //                   y="44.2485"
    //                   width="160"
    //                   height="0.751505"
    //                   fill="url(#paint0_linear_43_1439)"
    //                 />
    //                 <defs>
    //                   <filter
    //                     id="filter0_f_43_1439"
    //                     x="1.11108"
    //                     y="-3.45093"
    //                     width="157.778"
    //                     height="109.498"
    //                     filterUnits="userSpaceOnUse"
    //                     colorInterpolationFilters="sRGB"
    //                   >
    //                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //                     <feBlend
    //                       mode="normal"
    //                       in="SourceGraphic"
    //                       in2="BackgroundImageFix"
    //                       result="shape"
    //                     />
    //                     <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
    //                   </filter>
    //                   <linearGradient
    //                     id="paint0_linear_43_1439"
    //                     x1="0"
    //                     y1="44.6243"
    //                     x2="160"
    //                     y2="44.6243"
    //                     gradientUnits="userSpaceOnUse"
    //                   >
    //                     <stop stopColor="#23FFE3" stopOpacity="0" />
    //                     <stop offset="0.5" stopColor="#23FFE3" />
    //                     <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
    //                   </linearGradient>
    //                 </defs>
    //               </svg>
    //             </div>
    //             <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
    //               2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
    //               인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
    //               검증하는 국제 공식 인증입니다.
    //             </div>
    //           </div>
    //           <div>
    //             <div className="px-x relative pt-1.5 text-3xl font-medium text-primary">
    //               2ACE 포커는
    //               <svg
    //                 className="absolute left-0 top-2"
    //                 xmlns="http://www.w3.org/2000/svg"
    //                 width="160"
    //                 height="45"
    //                 viewBox="0 0 160 45"
    //                 fill="none"
    //               >
    //                 <g opacity="0.21">
    //                   <mask
    //                     id="mask0_43_1439"
    //                     style={{ maskType: "alpha" }}
    //                     maskUnits="userSpaceOnUse"
    //                     x="0"
    //                     y="0"
    //                     width="160"
    //                     height="45"
    //                   >
    //                     <rect width="160" height="44.9984" fill="#D9D9D9" />
    //                   </mask>
    //                   <g mask="url(#mask0_43_1439)">
    //                     <g filter="url(#filter0_f_43_1439)">
    //                       <ellipse
    //                         cx="80"
    //                         cy="51.2982"
    //                         rx="48.8889"
    //                         ry="24.7491"
    //                         fill="#23FFE3"
    //                         fillOpacity="0.59"
    //                       />
    //                     </g>
    //                   </g>
    //                 </g>
    //                 <rect
    //                   y="44.2485"
    //                   width="160"
    //                   height="0.751505"
    //                   fill="url(#paint0_linear_43_1439)"
    //                 />
    //                 <defs>
    //                   <filter
    //                     id="filter0_f_43_1439"
    //                     x="1.11108"
    //                     y="-3.45093"
    //                     width="157.778"
    //                     height="109.498"
    //                     filterUnits="userSpaceOnUse"
    //                     colorInterpolationFilters="sRGB"
    //                   >
    //                     <feFlood floodOpacity="0" result="BackgroundImageFix" />
    //                     <feBlend
    //                       mode="normal"
    //                       in="SourceGraphic"
    //                       in2="BackgroundImageFix"
    //                       result="shape"
    //                     />
    //                     <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_43_1439" />
    //                   </filter>
    //                   <linearGradient
    //                     id="paint0_linear_43_1439"
    //                     x1="0"
    //                     y1="44.6243"
    //                     x2="160"
    //                     y2="44.6243"
    //                     gradientUnits="userSpaceOnUse"
    //                   >
    //                     <stop stopColor="#23FFE3" stopOpacity="0" />
    //                     <stop offset="0.5" stopColor="#23FFE3" />
    //                     <stop offset="1" stopColor="#23FFE3" stopOpacity="0" />
    //                   </linearGradient>
    //                 </defs>
    //               </svg>
    //             </div>
    //             <div className="mt-8 whitespace-pre-line text-lg font-medium text-white">
    //               2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
    //               인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
    //               검증하는 국제 공식 인증입니다.
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </section>
    //
    //   <Footer />
    // </main>
  );
}
