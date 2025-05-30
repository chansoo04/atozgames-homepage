"use client";
import { AuthContext } from "app/AuthProvider";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { useContext, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import axios from "lib/axios";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myInquiry, setMyInquiry] = useState<any>({});
  const context = useContext(AuthContext);

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
    console.log(resp.data, "resp.data");

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
        className="flex min-h-[90vh] flex-col items-center pb-10 pt-[92px] desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <TopBar />
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">1:1 문의</h1>

        <div className="w-full px-5">
          <div className="mt-5 w-full rounded-[20px] bg-gray-100 px-5 pb-[30px] pt-5">
            <div className="py-[15px]">
              <div
                className={`inline-block rounded-full px-2.5 text-sm font-semibold ${myInquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
              >
                {myInquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
              </div>
              <div className="mt-2.5 whitespace-pre-line text-base font-medium leading-relaxed text-gray-700">
                {myInquiry.title}
              </div>
              <div className="mt-[15px] flex items-center gap-x-1">
                <Image src="/clock.png" alt="작성일" width={14} height={14} />
                <div className="text-sm font-normal text-gray-500">
                  {myInquiry?.created_at?.slice(0, 10) ?? ""}
                </div>
              </div>
            </div>
            <div className="whitespace-pre-line py-5 text-sm font-normal leading-tight text-gray-700">
              {myInquiry.content}
            </div>
            <div className="mt-10 flex w-full gap-x-2.5 overflow-auto">
              {myInquiry?.append?.map((item: any, index: number) => (
                <Image
                  key={index.toString()}
                  src={item}
                  width={100}
                  alt="이미지"
                  height={100}
                  onClick={() => (window.location.href = item)}
                />
              ))}
            </div>
          </div>

          {/* === 관리자 답변(있을 때만) === */}
          {adminReply && (
            <div className="mt-5 w-full rounded-[20px] bg-white px-5 pb-6 pt-5 shadow">
              <div className="flex items-center gap-x-1">
                <Image src="/profile.png" alt="관리자" width={20} height={20} />
                <span className="text-sm font-semibold text-blue-600">관리자 답변</span>
              </div>

              <div
                className="prose prose-sm mt-2 max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: adminReply.reply }}
              />

              {/* 답변 첨부 이미지 */}
              {adminReply.append &&
                adminReply.append !== "null" &&
                JSON.parse(adminReply.append).length > 0 && (
                  <div className="mt-4 flex gap-x-2 overflow-auto">
                    {JSON.parse(adminReply.append).map((imgSrc: string, idx: number) => (
                      <Image
                        key={idx}
                        src={imgSrc}
                        width={100}
                        height={100}
                        alt="답변 이미지"
                        onClick={() => (window.location.href = imgSrc)}
                      />
                    ))}
                  </div>
                )}

              <div className="mt-3 text-end text-xs text-gray-400">
                {adminReply.created_at.slice(0, 10)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            1:1 문의
          </h1>

          <div className="min-h-[50vh] w-[1200px] desktop:my-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            <div className="desktop:flex desktop:flex-col">
              <div className="flex justify-between pt-10">
                <div
                  className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${myInquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
                >
                  {myInquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
                </div>
                <div className="flex items-center gap-x-1">
                  <Image src="/clock.png" alt="작성일" width={20} height={20} />
                  <div className="text-lg font-medium text-gray-400">
                    {myInquiry?.created_at?.slice(0, 10) ?? ""}
                  </div>
                </div>
              </div>
              <h3 className="mt-[15px] border-b border-gray-600 pb-10 text-xl font-bold text-white">
                {myInquiry.title}
              </h3>

              <div className="mt-[35px] whitespace-pre-line text-lg font-normal text-white">
                {myInquiry.content}
              </div>

              <div className="mt-[35px] flex w-full gap-x-5 overflow-auto">
                {myInquiry?.append?.map((item: any, index: number) => (
                  <Image
                    key={index.toString()}
                    src={item}
                    width={300}
                    alt="이미지"
                    height={300}
                    onClick={() => (window.location.href = item)}
                  />
                ))}
              </div>
            </div>

            {/* 답변 */}
            {adminReply && (
              <div className="mt-[50px] rounded-[20px] bg-white/10 px-8 py-6 backdrop-blur-md">
                <div className="flex items-center gap-x-2">
                  <Image src="/profile.png" alt="관리자" width={24} height={24} />
                  <span className="text-lg font-semibold text-white">관리자 답변</span>
                </div>

                <div
                  className="prose prose-invert mt-4 max-w-none text-white"
                  dangerouslySetInnerHTML={{ __html: adminReply.reply }}
                />

                {adminReply.append &&
                  adminReply.append !== "null" &&
                  JSON.parse(adminReply.append).length > 0 && (
                    <div className="mt-6 flex gap-x-5 overflow-auto">
                      {JSON.parse(adminReply.append).map((imgSrc: string, idx: number) => (
                        <Image
                          key={idx}
                          src={imgSrc}
                          width={300}
                          height={300}
                          alt="답변 이미지"
                          onClick={() => (window.location.href = imgSrc)}
                        />
                      ))}
                    </div>
                  )}

                <div className="mt-4 text-right text-sm text-gray-400">
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
