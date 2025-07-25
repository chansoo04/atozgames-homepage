"use client";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import TopBar from "app/_components/TopBar";
import Link from "next/link";
import Image from "next/image";
import Footer from "app/_components/Footer";

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

export default function ClientPage({ announcements }: { announcements: any }) {
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
          공지사항
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
              padding: mobileSizeCalc(20, ratio),
            }}
          >
            {(announcements as any)?.map((item: any) => (
              <Link
                key={item.id.toString()}
                className="flex w-full flex-col border-b border-gray-200"
                href={`/announcement/${item.id}`}
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
                    className={`flex items-center rounded-full font-semibold ${item.category === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
                    style={{
                      paddingLeft: mobileSizeCalc(10, ratio),
                      paddingRight: mobileSizeCalc(10, ratio),
                      fontSize: mobileSizeCalc(14, ratio),
                      lineHeight: mobileSizeCalc(14, ratio),
                      height: mobileSizeCalc(20, ratio),
                    }}
                  >
                    {item.category}
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
            공지사항
          </h1>

          <div
            className="desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70"
            style={{
              width: desktopSizeCalc(1200, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              marginBottom: desktopSizeCalc(80, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
              paddingTop: desktopSizeCalc(20, ratio),
              paddingBottom: desktopSizeCalc(20, ratio),
            }}
          >
            <div
              className="desktop:flex desktop:flex-col"
              style={{
                minHeight: desktopSizeCalc(1150, ratio),
              }}
            >
              {announcements.map((announcement: any) => (
                <Link
                  key={announcement.id.toString()}
                  href={`/announcement/${announcement.id}`}
                  className="flex w-full justify-between border-b border-gray-600"
                  style={{
                    paddingTop: desktopSizeCalc(40, ratio),
                    paddingBottom: desktopSizeCalc(40, ratio),
                  }}
                >
                  <div
                    className="flex items-center"
                    style={{
                      columnGap: desktopSizeCalc(20, ratio),
                    }}
                  >
                    <div
                      className={`flex items-center justify-center rounded-full font-medium ${announcement.category === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
                      style={{
                        height: desktopSizeCalc(30, ratio),
                        width: desktopSizeCalc(64, ratio),
                        fontSize: desktopSizeCalc(18, ratio),
                        lineHeight: desktopSizeCalc(26, ratio),
                      }}
                    >
                      {announcement.category}
                    </div>
                    <div
                      className="truncate font-medium text-white"
                      style={{
                        width: desktopSizeCalc(500, ratio),
                        fontSize: desktopSizeCalc(18, ratio),
                        lineHeight: desktopSizeCalc(26, ratio),
                      }}
                    >
                      {announcement.title}
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
                      {changeDate(announcement.created_at)}
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
