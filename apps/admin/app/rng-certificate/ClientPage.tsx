"use client";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

export default function ClientPage() {
  const { ratio } = useWindowSize();

  return (
    <main className="relative w-full">
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
          RNG 인증 및 공정성
        </h1>

        <div
          className="w-full"
          style={{
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
          }}
        >
          <div
            className="w-full rounded-lg bg-gray-400"
            style={{
              marginTop: mobileSizeCalc(20, ratio),
              height: mobileSizeCalc(380, ratio),
            }}
          />
          <div
            className="flex flex-col rounded-2xl bg-white"
            style={{
              marginTop: mobileSizeCalc(30, ratio),
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              paddingBottom: mobileSizeCalc(20, ratio),
              paddingTop: mobileSizeCalc(16, ratio),
            }}
          >
            <div
              className="relative"
              style={{
                paddingBottom: mobileSizeCalc(4, ratio),
                paddingLeft: mobileSizeCalc(4, ratio),
                paddingRight: mobileSizeCalc(8, ratio),
                paddingTop: mobileSizeCalc(6, ratio),
                fontSize: mobileSizeCalc(16, ratio),
              }}
            >
              2ACE 포커는
              <svg
                className="absolute"
                style={{
                  left: 0,
                  top: mobileSizeCalc(4, ratio),
                }}
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
            <div
              className="font-normal text-gray-700"
              style={{
                marginTop: mobileSizeCalc(10, ratio),
                fontSize: mobileSizeCalc(14, ratio),
              }}
            >
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>

          <div
            className="flex flex-col rounded-2xl bg-white"
            style={{
              marginTop: mobileSizeCalc(30, ratio),
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              paddingBottom: mobileSizeCalc(20, ratio),
              paddingTop: mobileSizeCalc(16, ratio),
            }}
          >
            <div
              className="relative"
              style={{
                paddingBottom: mobileSizeCalc(4, ratio),
                paddingLeft: mobileSizeCalc(4, ratio),
                paddingRight: mobileSizeCalc(8, ratio),
                paddingTop: mobileSizeCalc(6, ratio),
                fontSize: mobileSizeCalc(16, ratio),
              }}
            >
              2ACE 포커는
              <svg
                className="absolute"
                style={{
                  left: 0,
                  top: mobileSizeCalc(4, ratio),
                }}
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

            <div
              className="font-normal text-gray-700"
              style={{
                marginTop: mobileSizeCalc(10, ratio),
                fontSize: mobileSizeCalc(14, ratio),
              }}
            >
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>

          <div
            className="flex flex-col rounded-2xl bg-white"
            style={{
              marginTop: mobileSizeCalc(30, ratio),
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              paddingBottom: mobileSizeCalc(20, ratio),
              paddingTop: mobileSizeCalc(16, ratio),
            }}
          >
            <div
              className="relative"
              style={{
                paddingBottom: mobileSizeCalc(4, ratio),
                paddingLeft: mobileSizeCalc(4, ratio),
                paddingRight: mobileSizeCalc(8, ratio),
                paddingTop: mobileSizeCalc(6, ratio),
                fontSize: mobileSizeCalc(16, ratio),
              }}
            >
              2ACE 포커는
              <svg
                className="absolute"
                style={{
                  left: 0,
                  top: mobileSizeCalc(4, ratio),
                }}
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

            <div
              className="font-normal text-gray-700"
              style={{
                marginTop: mobileSizeCalc(10, ratio),
                fontSize: mobileSizeCalc(14, ratio),
              }}
            >
              2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은
              게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를 검증하는 국제
              공식 인증입니다.
            </div>
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2095] desktop:w-full desktop:min-w-[1280px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
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
            RNG 인증 및 공정성
          </h1>

          <div
            className="desktop:flex desktop:rounded-[30px] desktop:bg-[#16172D]/70"
            style={{
              width: desktopSizeCalc(1200, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              columnGap: desktopSizeCalc(50, ratio),
              padding: desktopSizeCalc(70, ratio),
            }}
          >
            <div
              className="bg-white"
              style={{
                minHeight: desktopSizeCalc(810, ratio),
                height: desktopSizeCalc(810, ratio),
                minWidth: desktopSizeCalc(510, ratio),
                width: desktopSizeCalc(510, ratio),
              }}
            />
            <div
              className="desktop:flex desktop:flex-col"
              style={{
                rowGap: desktopSizeCalc(40, ratio),
              }}
            >
              <div>
                <div
                  className="relative font-medium text-primary"
                  style={{
                    fontSize: desktopSizeCalc(30, ratio),
                    lineHeight: desktopSizeCalc(36, ratio),
                    paddingTop: desktopSizeCalc(6, ratio),
                  }}
                >
                  2ACE 포커는
                  <svg
                    className="absolute"
                    style={{
                      left: 0,
                      top: desktopSizeCalc(8, ratio),
                    }}
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
                <div
                  className="whitespace-pre-line font-medium text-white"
                  style={{
                    marginTop: desktopSizeCalc(32, ratio),
                    fontSize: desktopSizeCalc(18, ratio),
                    lineHeight: desktopSizeCalc(28, ratio),
                  }}
                >
                  2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
                  인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
                  검증하는 국제 공식 인증입니다.
                </div>
              </div>

              <div>
                <div
                  className="relative font-medium text-primary"
                  style={{
                    fontSize: desktopSizeCalc(30, ratio),
                    lineHeight: desktopSizeCalc(36, ratio),
                    paddingTop: desktopSizeCalc(6, ratio),
                  }}
                >
                  2ACE 포커는
                  <svg
                    className="absolute"
                    style={{
                      left: 0,
                      top: desktopSizeCalc(8, ratio),
                    }}
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
                <div
                  className="whitespace-pre-line font-medium text-white"
                  style={{
                    marginTop: desktopSizeCalc(32, ratio),
                    fontSize: desktopSizeCalc(18, ratio),
                    lineHeight: desktopSizeCalc(28, ratio),
                  }}
                >
                  2ACE 포커는 BMM Teatlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG
                  인증은 게임의 데이터를 추출하고 분석하여, 인위적인 개입이 없는 공정한 플레이를
                  검증하는 국제 공식 인증입니다.
                </div>
              </div>

              <div>
                <div
                  className="relative font-medium text-primary"
                  style={{
                    fontSize: desktopSizeCalc(30, ratio),
                    lineHeight: desktopSizeCalc(36, ratio),
                    paddingTop: desktopSizeCalc(6, ratio),
                  }}
                >
                  2ACE 포커는
                  <svg
                    className="absolute"
                    style={{
                      left: 0,
                      top: desktopSizeCalc(8, ratio),
                    }}
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
                <div
                  className="whitespace-pre-line font-medium text-white"
                  style={{
                    marginTop: desktopSizeCalc(32, ratio),
                    fontSize: desktopSizeCalc(18, ratio),
                    lineHeight: desktopSizeCalc(28, ratio),
                  }}
                >
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
  );
}
