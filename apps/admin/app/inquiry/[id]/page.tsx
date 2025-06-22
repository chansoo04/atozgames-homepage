"use client";
import { AuthContext } from "app/AuthProvider";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { useContext, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import axios from "lib/axios";
import Image from "next/image";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myInquiry, setMyInquiry] = useState<any>({});
  const context = useContext(AuthContext);
  const { ratio } = useWindowSize();

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !context.user) {
      redirect("/login?redirect_uri=inquiry");
    } else {
      getMyInquiry();
    }
  }, [isLoading, context.user]);

  const getMyInquiry = async () => {
    const id = window.location.pathname.split("/")[2];
    const resp = await axios({
      method: "get",
      url: `api/inquiry/${id}`,
    });

    if (resp.data.result === "success") {
      setMyInquiry({ ...resp.data.inquiry, append: JSON.parse(resp.data.inquiry.append ?? []) });
    } else {
      console.error("내 질문 불러오기 실패");
    }
  };

  const adminReply = myInquiry.customer_question_reply?.[0];

  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex min-h-[90vh] flex-col items-center desktop:hidden"
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
          1:1 문의
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
                className={`inline-block rounded-full font-semibold ${myInquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
                style={{
                  paddingLeft: mobileSizeCalc(10, ratio),
                  paddingRight: mobileSizeCalc(10, ratio),
                  fontSize: mobileSizeCalc(14, ratio),
                  lineHeight: mobileSizeCalc(20, ratio),
                }}
              >
                {myInquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
              </div>
              <div
                className="whitespace-pre-line font-medium text-gray-700"
                style={{
                  marginTop: mobileSizeCalc(10, ratio),
                  fontSize: mobileSizeCalc(16, ratio),
                  lineHeight: mobileSizeCalc(26, ratio),
                }}
              >
                {myInquiry.title}
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
                  {myInquiry?.created_at?.slice(0, 10) ?? ""}
                </div>
              </div>
            </div>
            <div
              className="whitespace-pre-line font-normal text-gray-700"
              style={{
                paddingTop: mobileSizeCalc(20, ratio),
                paddingBottom: mobileSizeCalc(20, ratio),
                fontSize: mobileSizeCalc(14, ratio),
                lineHeight: mobileSizeCalc(18, ratio),
              }}
            >
              {myInquiry.content}
            </div>
            <div
              className="flex w-full overflow-auto"
              style={{
                marginTop: mobileSizeCalc(40, ratio),
                columnGap: mobileSizeCalc(10, ratio),
              }}
            >
              {myInquiry?.append?.map((item: any, index: number) => (
                <Image
                  key={index.toString()}
                  src={item}
                  width={100}
                  alt="이미지"
                  height={100}
                  onClick={() => (window.location.href = item)}
                  style={{
                    width: mobileSizeCalc(100, ratio),
                    height: mobileSizeCalc(100, ratio),
                  }}
                />
              ))}
            </div>
          </div>

          {/* === 관리자 답변(있을 때만) === */}
          {adminReply && (
            <div
              className="w-full rounded-[20px] bg-white shadow"
              style={{
                marginTop: mobileSizeCalc(20, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                paddingRight: mobileSizeCalc(20, ratio),
                paddingBottom: mobileSizeCalc(24, ratio),
                paddingTop: mobileSizeCalc(20, ratio),
              }}
            >
              <div
                className="flex items-center"
                style={{
                  columnGap: mobileSizeCalc(4, ratio),
                }}
              >
                <Image
                  src="/profile.png"
                  alt="관리자"
                  width={20}
                  height={20}
                  style={{
                    width: mobileSizeCalc(20, ratio),
                    height: mobileSizeCalc(20, ratio),
                  }}
                />
                <span
                  className="font-semibold text-blue-600"
                  style={{
                    fontSize: mobileSizeCalc(14, ratio),
                    lineHeight: mobileSizeCalc(20, ratio),
                  }}
                >
                  관리자 답변
                </span>
              </div>

              <div
                className="prose prose-sm max-w-none text-gray-700"
                style={{
                  marginTop: mobileSizeCalc(8, ratio),
                }}
                dangerouslySetInnerHTML={{ __html: adminReply.reply }}
              />

              {/* 답변 첨부 이미지 */}
              {adminReply.append &&
                adminReply.append !== "null" &&
                JSON.parse(adminReply.append).length > 0 && (
                  <div
                    className="flex overflow-auto"
                    style={{
                      marginTop: mobileSizeCalc(16, ratio),
                      columnGap: mobileSizeCalc(8, ratio),
                    }}
                  >
                    {JSON.parse(adminReply.append).map((imgSrc: string, idx: number) => (
                      <Image
                        key={idx}
                        src={imgSrc}
                        width={100}
                        height={100}
                        alt="답변 이미지"
                        onClick={() => (window.location.href = imgSrc)}
                        style={{
                          width: mobileSizeCalc(100, ratio),
                          height: mobileSizeCalc(100, ratio),
                        }}
                      />
                    ))}
                  </div>
                )}

              <div
                className="text-end text-gray-400"
                style={{
                  marginTop: mobileSizeCalc(12, ratio),
                  fontSize: mobileSizeCalc(12, ratio),
                  lineHeight: mobileSizeCalc(16, ratio),
                }}
              >
                {adminReply.created_at.slice(0, 10)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:min-w-[1280px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
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
            1:1 문의
          </h1>

          <div
            className="desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70"
            style={{
              minHeight: desktopSizeCalc(540, ratio),
              width: desktopSizeCalc(1200, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              marginBottom: desktopSizeCalc(80, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
              paddingTop: desktopSizeCalc(20, ratio),
              paddingBottom: desktopSizeCalc(20, ratio),
            }}
          >
            <div className="desktop:flex desktop:flex-col">
              <div
                className="flex justify-between"
                style={{
                  paddingTop: desktopSizeCalc(40, ratio),
                }}
              >
                <div
                  className={`flex items-center justify-center rounded-full font-medium ${myInquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
                  style={{
                    height: desktopSizeCalc(30, ratio),
                    width: desktopSizeCalc(64, ratio),
                    fontSize: desktopSizeCalc(18, ratio),
                    lineHeight: desktopSizeCalc(28, ratio),
                  }}
                >
                  {myInquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
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
                      lineHeight: desktopSizeCalc(28, ratio),
                    }}
                  >
                    {myInquiry?.created_at?.slice(0, 10) ?? ""}
                  </div>
                </div>
              </div>
              <h3
                className="border-b border-gray-600 font-bold text-white"
                style={{
                  marginTop: desktopSizeCalc(15, ratio),
                  paddingBottom: desktopSizeCalc(40, ratio),
                  fontSize: desktopSizeCalc(20, ratio),
                  lineHeight: desktopSizeCalc(28, ratio),
                }}
              >
                {myInquiry.title}
              </h3>

              <div
                className="whitespace-pre-line font-normal text-white"
                style={{
                  marginTop: desktopSizeCalc(35, ratio),
                  fontSize: desktopSizeCalc(20, ratio),
                  lineHeight: desktopSizeCalc(28, ratio),
                }}
              >
                {myInquiry.content}
              </div>

              <div
                className="flex w-full overflow-auto"
                style={{
                  marginTop: desktopSizeCalc(35, ratio),
                  columnGap: desktopSizeCalc(20, ratio),
                }}
              >
                {myInquiry?.append?.map((item: any, index: number) => (
                  <Image
                    key={index.toString()}
                    src={item}
                    width={300}
                    alt="이미지"
                    height={300}
                    onClick={() => (window.location.href = item)}
                    style={{
                      width: desktopSizeCalc(300, ratio),
                      height: desktopSizeCalc(300, ratio),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 답변 */}
            {adminReply && (
              <div
                className="rounded-[20px] bg-white/10 backdrop-blur-md"
                style={{
                  marginTop: desktopSizeCalc(50, ratio),
                  paddingLeft: desktopSizeCalc(32, ratio),
                  paddingRight: desktopSizeCalc(32, ratio),
                  paddingTop: desktopSizeCalc(24, ratio),
                  paddingBottom: desktopSizeCalc(24, ratio),
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    columnGap: desktopSizeCalc(8, ratio),
                  }}
                >
                  <Image
                    src="/profile.png"
                    alt="관리자"
                    width={24}
                    height={24}
                    style={{
                      width: desktopSizeCalc(24, ratio),
                      height: desktopSizeCalc(24, ratio),
                    }}
                  />
                  <span
                    className="font-semibold text-white"
                    style={{
                      fontSize: desktopSizeCalc(20, ratio),
                      lineHeight: desktopSizeCalc(28, ratio),
                    }}
                  >
                    관리자 답변
                  </span>
                </div>

                <div
                  className="prose prose-invert max-w-none text-white"
                  dangerouslySetInnerHTML={{ __html: adminReply.reply }}
                  style={{
                    marginTop: desktopSizeCalc(16, ratio),
                  }}
                />

                {adminReply.append &&
                  adminReply.append !== "null" &&
                  JSON.parse(adminReply.append).length > 0 && (
                    <div
                      className="flex overflow-auto"
                      style={{
                        marginTop: desktopSizeCalc(24, ratio),
                        columnGap: desktopSizeCalc(20, ratio),
                      }}
                    >
                      {JSON.parse(adminReply.append).map((imgSrc: string, idx: number) => (
                        <Image
                          key={idx}
                          src={imgSrc}
                          width={300}
                          height={300}
                          alt="답변 이미지"
                          onClick={() => (window.location.href = imgSrc)}
                          style={{
                            width: desktopSizeCalc(300, ratio),
                            height: desktopSizeCalc(300, ratio),
                          }}
                        />
                      ))}
                    </div>
                  )}

                <div
                  className="text-right text-gray-400"
                  style={{
                    marginTop: desktopSizeCalc(16, ratio),
                    fontSize: desktopSizeCalc(14, ratio),
                    lineHeight: desktopSizeCalc(20, ratio),
                  }}
                >
                  {adminReply.created_at.slice(0, 10)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
