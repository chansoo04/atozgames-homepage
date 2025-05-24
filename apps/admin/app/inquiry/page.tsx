"use client";
import { useState, useContext, useEffect, FormEvent, useRef } from "react";
import { AuthContext } from "app/AuthProvider";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import axios from "lib/axios";

// TODO: 검색엔진 크롤링 비활성화

const tabs = ["문의하기", "내 문의내역"] as const;
export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [active, setActive] = useState<(typeof tabs)[number]>("문의하기");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [myInquiry, setMyInquiry] = useState<any[]>([]);
  const context = useContext(AuthContext);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1200);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && !context.user) {
      redirect("/login?redirect_uri=inquiry");
    } else {
      getMyInquiry();
    }
    console.log(context.user);
  }, [isLoading, context.user]);

  const getMyInquiry = async () => {
    const resp = await axios({
      method: "get",
      url: "api/inquiry",
    });

    if (resp.data.result === "success") {
      console.log(resp.data.inquiry);
      setMyInquiry(resp.data.inquiry);
    } else {
      console.error("내 질문 불러오기 실패");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    if (!title || !content || !context.user) return; // 빈 값 보호, 비로그인 유저 처리

    const resp = await axios({
      method: "post",
      url: "api/inquiry",
      data: {
        title,
        content,
      },
    });

    if (resp.data.result === "success") {
      setTitle("");
      setContent("");
      alert("문의사항 등록에 성공하였습니다\n최대한 빠른 시일 내 답변드릴 수 있도록 하겠습니다");
    } else {
      alert("문의사항 등록에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  const handleSelect = () => fileRef.current?.click();

  // jpg, jpeg, png만 받음
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    const fileType = file.type.split("/")[1];

    const getPresignedUrlRes = await fetch(process.env.NEXT_PUBLIC_S3_POST_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ContentType: fileType }),
    });
    const getPresignedUrl = await getPresignedUrlRes.json();
    console.log(getPresignedUrl, "getPresignedUrl");

    // TODO: 파일 업로드 기능 개발 필요
    // alert("파일 업로드 기능 개발중!");
  };

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
            {active === "문의하기" ? (
              <form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="flex h-[60px] items-center justify-between py-[15px]">
                  <div className="text-sm font-semibold text-gray-600">ID</div>
                  <div className="text-sm font-normal text-gray-700">
                    {context?.user?.email ?? ""}
                  </div>
                </div>
                <div className="flex h-[60px] items-center justify-between py-[15px]">
                  <div className="text-sm font-semibold text-gray-600">고객명</div>
                  <div className="text-sm font-normal text-gray-700">
                    {context?.user?.displayName ?? ""}
                  </div>
                </div>

                <div className="mt-2.5 flex h-[30px] items-center text-sm font-semibold text-gray-600">
                  제목
                </div>
                <div className="w-full">
                  <input
                    type="text"
                    className="h-[50px] w-full rounded-[5px] border-none bg-gray-200 p-[15px] text-sm font-normal text-gray-900 outline-none focus:border-none focus:ring-0"
                    placeholder="문의하실 내용의 제목을 입력해주세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mt-5 flex h-[30px] items-center text-sm font-semibold text-gray-600">
                  내용
                </div>
                <div className="w-full">
                  <textarea
                    className="h-[200px] w-full rounded-[5px] border-none bg-gray-200 px-[15px] py-2.5 text-sm font-normal text-gray-900 outline-none focus:border-none focus:ring-0"
                    placeholder="문의하실 내용을 입력해주세요."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="mt-5 flex h-[30px] items-center text-sm font-semibold text-gray-600">
                  첨부파일
                </div>
                <div
                  onClick={handleSelect}
                  className="flex w-full cursor-pointer flex-col items-center rounded-[5px] bg-gray-200 py-5"
                >
                  <Image src="/file_upload.png" alt="파일 업로드" width={50} height={50} />
                  <div className="mt-2.5 whitespace-pre-line text-center text-sm font-normal text-gray-500">
                    영역을 클릭하여{"\n"}파일을 추가하세요
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  hidden
                  onChange={onFileChange}
                />

                <button
                  type="submit"
                  disabled={!title || !content}
                  className="mt-10 rounded-[5px] bg-serve py-2.5 text-base font-semibold text-white disabled:bg-gray-400"
                >
                  전송하기
                </button>
              </form>
            ) : (
              <div className="flex flex-col">
                {myInquiry?.map((inquiry) => (
                  <Link
                    key={inquiry.id.toString()}
                    className="flex h-[105px] w-full flex-col border-b border-gray-200 py-[15px]"
                    href={`/inquiry/${inquiry.id}`}
                  >
                    <div className="h-5">
                      <span
                        className={`rounded-full px-2.5 text-center text-sm font-semibold leading-none text-white ${inquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600" : "bg-serve"}`}
                      >
                        {inquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
                      </span>
                    </div>
                    <div className="mt-2 truncate text-base font-medium text-gray-700">
                      {inquiry.title}
                    </div>
                    <div className="mt-[5px] flex items-center">
                      <Image src="/profile.png" alt="프로필" width={14} height={14} />
                      <div className="ml-1 text-sm font-normal text-gray-500">
                        {context?.user?.displayName ?? "작성자"}
                      </div>
                      <Image
                        className="ml-2.5"
                        src="/clock.png"
                        alt="작성일자"
                        width={14}
                        height={14}
                      />
                      <div className="ml-1 text-sm font-normal text-gray-500">
                        {inquiry.created_at.slice(0, 10)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            1:1 문의
          </h1>

          <div className="w-[1200px] desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            <div className="mb-20 min-h-[1150px] desktop:flex desktop:flex-col desktop:pb-[60px]">
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
              {active === "문의하기" ? (
                <form className="flex flex-col" onSubmit={handleSubmit}>
                  <div className="mt-5 flex justify-between border-b border-gray-400 pb-[30px] pt-5">
                    <div className="flex h-[60px] w-[480px] items-center">
                      <div className="w-[80px] text-xl font-bold text-gray-100">ID</div>
                      <div className="text-lg font-normal text-gray-100">
                        {context?.user?.email ?? ""}
                      </div>
                    </div>
                    <div className="flex h-[60px] w-[480px] items-center">
                      <div className="w-[80px] text-xl font-bold text-gray-100">고객명</div>
                      <div className="text-lg font-normal text-gray-100">
                        {context?.user?.displayName ?? ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col pb-[30px] pt-5">
                    <div className="text-xl font-bold text-gray-100">제목</div>
                    <div className="w-full">
                      <input
                        type="text"
                        className="mt-5 w-full rounded-[5px] border-none bg-white/15 px-5 py-[15px] text-lg font-normal text-gray-400 outline-none focus:border-none focus:outline-none focus:ring-0"
                        placeholder="문의하실 내용의 제목을 입력해주세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col pb-[30px] pt-5">
                    <div className="text-xl font-bold text-gray-100">내용</div>
                    <div className="w-full">
                      <textarea
                        className="mt-5 h-[570px] w-full rounded-[5px] border-none bg-white/15 p-5 text-lg font-normal text-gray-400 outline-none focus:border-none focus:outline-none focus:ring-0"
                        placeholder="문의하실 내용을 입력해주세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex w-full flex-col pb-[30px] pt-5">
                    <div className="text-xl font-bold text-gray-100">첨부파일</div>
                    <div
                      onClick={handleSelect}
                      className="mt-5 flex w-full cursor-pointer flex-col items-center rounded-[5px] bg-white/15 py-10 "
                    >
                      <Image
                        src="/file_upload_desktop.png"
                        alt="파일 업로드"
                        width={70}
                        height={70}
                      />
                      <div className="mt-5 text-lg font-normal text-gray-400">
                        영역을 클릭하여 파일을 추가하세요
                      </div>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onFileChange}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!title || !content}
                    className="mt-5 cursor-pointer rounded-[5px] bg-serve py-5 text-xl font-medium text-white disabled:bg-gray-400"
                  >
                    전송하기
                  </button>
                </form>
              ) : (
                <div className="mt-5 flex flex-col">
                  {myInquiry.map((inquiry: any) => (
                    <Link
                      key={inquiry.id.toString()}
                      href={`/inquiry/${inquiry.id}`}
                      className="flex w-full justify-between border-b border-gray-600 py-10"
                    >
                      <div className="flex items-center gap-x-4">
                        <div
                          className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${inquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
                        >
                          {inquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
                        </div>
                        <div className="w-[500px] truncate text-lg font-medium text-white">
                          {inquiry.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-x-1">
                        <Image src="/clock.png" alt="작성일" width={20} height={20} />
                        <div className="text-lg font-medium text-gray-400">
                          {inquiry.created_at.slice(0, 10)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
