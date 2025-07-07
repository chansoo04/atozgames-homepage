"use client";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import TopBar from "app/_components/TopBar";
import Image from "next/image";
import Footer from "app/_components/Footer";

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

export default function ClientPage({ faq }: { faq: any }) {
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
            className="w-full rounded-[20px] bg-gray-100"
            style={{
              marginTop: mobileSizeCalc(20, ratio),
              paddingLeft: mobileSizeCalc(20, ratio),
              paddingRight: mobileSizeCalc(20, ratio),
              paddingBottom: mobileSizeCalc(30, ratio),
              paddingTop: mobileSizeCalc(20, ratio),
            }}
          >
            <div
              className=""
              style={{
                paddingTop: mobileSizeCalc(15, ratio),
                paddingBottom: mobileSizeCalc(15, ratio),
              }}
            >
              <div
                className={`flex items-center rounded-full font-semibold ${faq.subcategory === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
                style={{
                  paddingLeft: mobileSizeCalc(10, ratio),
                  paddingRight: mobileSizeCalc(10, ratio),
                  fontSize: mobileSizeCalc(14, ratio),
                  lineHeight: mobileSizeCalc(14, ratio),
                  width: mobileSizeCalc(45, ratio),
                  height: mobileSizeCalc(20, ratio),
                }}
              >
                {faq.subcategory}
              </div>
              <div
                className="whitespace-pre-line font-medium text-gray-700"
                style={{
                  marginTop: mobileSizeCalc(10, ratio),
                  fontSize: mobileSizeCalc(16, ratio),
                  lineHeight: mobileSizeCalc(22, ratio),
                }}
              >
                {faq.title}
              </div>
              <div
                className="flex items-center"
                style={{
                  marginTop: mobileSizeCalc(15, ratio),
                  columnGap: mobileSizeCalc(4, ratio),
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
                  {changeDate(faq.created_at)}
                </div>
              </div>
            </div>
            <div
              className="whitespace-pre-line font-normal text-gray-700"
              style={{
                paddingTop: mobileSizeCalc(20, ratio),
                paddingBottom: mobileSizeCalc(20, ratio),
                fontSize: mobileSizeCalc(14, ratio),
                lineHeight: mobileSizeCalc(20, ratio),
              }}
            >
              {faq.content}
            </div>
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative mx-auto hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:min-w-[1920px] desktop:max-w-[1920px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
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
              marginTop: desktopSizeCalc(80, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
              paddingTop: desktopSizeCalc(20, ratio),
              paddingBottom: desktopSizeCalc(20, ratio),
            }}
          >
            <div
              className="flex justify-between"
              style={{
                paddingTop: desktopSizeCalc(40, ratio),
              }}
            >
              <div
                className={`flex items-center justify-center rounded-full font-medium ${faq.category === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
                style={{
                  height: desktopSizeCalc(30, ratio),
                  width: desktopSizeCalc(62, ratio),
                  fontSize: desktopSizeCalc(18, ratio),
                  lineHeight: desktopSizeCalc(26, ratio),
                }}
              >
                {faq.subcategory}
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
                  {changeDate(faq.created_at)}
                </div>
              </div>
            </div>
            <h3
              className="border-b border-gray-600 font-bold text-white"
              style={{
                marginTop: desktopSizeCalc(15, ratio),
                paddingBottom: desktopSizeCalc(40, ratio),
                fontSize: desktopSizeCalc(20, ratio),
                lineHeight: desktopSizeCalc(30, ratio),
              }}
            >
              {faq.title}
            </h3>

            <div
              className="whitespace-pre-line font-normal text-white"
              style={{
                marginTop: desktopSizeCalc(35, ratio),
                paddingBottom: desktopSizeCalc(320, ratio),
                fontSize: desktopSizeCalc(18, ratio),
                lineHeight: desktopSizeCalc(34, ratio),
              }}
            >
              {faq.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
