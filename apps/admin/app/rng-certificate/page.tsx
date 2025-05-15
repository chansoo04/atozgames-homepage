import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export default async function Page() {
  return (
    <main className="w-full">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="mt-[60px] flex flex-col items-center px-5 pb-10 pt-8 tablet:hidden desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">RNG 인증 및 공정성</h1>
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
      </section>

      {/* 태블릿(≥640 & <1024)에서만 보임 */}
      <footer className="hidden tablet:block desktop:hidden">태블릿</footer>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer className="hidden tablet:hidden desktop:block">PC</footer>

      <Footer />
    </main>
  );
}
