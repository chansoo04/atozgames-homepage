"use client";
import { useState, useContext, useEffect, FormEvent, useRef } from "react";
import { AuthContext } from "app/AuthProvider";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import axios from "lib/axios";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

// TODO: 파일 삭제 기능 추가

const tabs = ["문의하기", "내 문의내역"] as const;
export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [active, setActive] = useState<(typeof tabs)[number]>("문의하기");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [appendFile, setAppendFile] = useState<string[]>([]);
  const [myInquiry, setMyInquiry] = useState<any[]>([]);
  const context = useContext(AuthContext);
  const fileRef = useRef<HTMLInputElement>(null);
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
    const resp = await axios({
      method: "get",
      url: "api/inquiry",
    });

    if (resp.data.result === "success") {
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
        appendFile,
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

    const formData = new FormData();
    formData.append("file", file, file.name);

    const req = await fetch("/api/inquiry/file", {
      method: "POST",
      body: formData,
    });

    const resp = await req.json();

    if (resp.result === "failure") {
      alert(resp.message ?? "파일 업로드에 실패했습니다");
    }

    setAppendFile((oldState) => [resp.url, ...oldState]);
    // input 초기화
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  if (!isLoading && context.user) {
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
            className="font-bold text-gray-700
          style={{
            fontSize: mobileSizeCalc(18, ratio),
            lineHeight: mobileSizeCalc(26, ratio),
          }}"
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
              className="flex w-full flex-col rounded-[20px] bg-gray-100"
              style={{
                marginTop: mobileSizeCalc(20, ratio),
                paddingLeft: mobileSizeCalc(20, ratio),
                paddingRight: mobileSizeCalc(20, ratio),
                paddingBottom: mobileSizeCalc(20, ratio),
                paddingTop: mobileSizeCalc(10, ratio),
              }}
            >
              <nav
                className="grid grid-cols-3"
                style={{
                  columnGap: mobileSizeCalc(5, ratio),
                }}
              >
                {tabs.map((tab) => (
                  <div key={tab} className="relative">
                    <button
                      onClick={() => setActive(tab)}
                      className={`w-full text-center ${active === tab ? "font-semibold text-primary" : "font-normal text-gray-400"}`}
                      style={{
                        paddingTop: mobileSizeCalc(12, ratio),
                        paddingBottom: mobileSizeCalc(12, ratio),
                        fontSize: mobileSizeCalc(16, ratio),
                        lineHeight: mobileSizeCalc(24, ratio),
                      }}
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
                  <div
                    className="flex items-center justify-between"
                    style={{
                      height: mobileSizeCalc(60, ratio),
                      paddingTop: mobileSizeCalc(15, ratio),
                      paddingBottom: mobileSizeCalc(15, ratio),
                    }}
                  >
                    <div
                      className="font-semibold text-gray-600"
                      style={{
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      ID
                    </div>
                    <div
                      className="font-normal text-gray-700"
                      style={{
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      {context?.user?.email ?? ""}
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between"
                    style={{
                      height: mobileSizeCalc(60, ratio),
                      paddingTop: mobileSizeCalc(15, ratio),
                      paddingBottom: mobileSizeCalc(15, ratio),
                    }}
                  >
                    <div
                      className="font-semibold text-gray-600"
                      style={{
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      고객명
                    </div>
                    <div
                      className="font-normal text-gray-700"
                      style={{
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      {context?.user?.displayName ?? ""}
                    </div>
                  </div>

                  <div
                    className="flex items-center font-semibold text-gray-600"
                    style={{
                      marginTop: mobileSizeCalc(10, ratio),
                      height: mobileSizeCalc(30, ratio),
                      fontSize: mobileSizeCalc(14, ratio),
                      lineHeight: mobileSizeCalc(20, ratio),
                    }}
                  >
                    제목
                  </div>
                  <div className="w-full">
                    <input
                      type="text"
                      className="w-full rounded-[5px] border-none bg-gray-200 font-normal text-gray-900 outline-none focus:border-none focus:ring-0"
                      placeholder="문의하실 내용의 제목을 입력해주세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        height: mobileSizeCalc(50, ratio),
                        padding: mobileSizeCalc(15, ratio),
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    />
                  </div>
                  <div
                    className="flex items-center font-semibold text-gray-600"
                    style={{
                      marginTop: mobileSizeCalc(20, ratio),
                      height: mobileSizeCalc(30, ratio),
                      fontSize: mobileSizeCalc(14, ratio),
                      lineHeight: mobileSizeCalc(20, ratio),
                    }}
                  >
                    내용
                  </div>
                  <div className="w-full">
                    <textarea
                      className="w-full rounded-[5px] border-none bg-gray-200 font-normal text-gray-900 outline-none focus:border-none focus:ring-0"
                      placeholder="문의하실 내용을 입력해주세요."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        height: mobileSizeCalc(200, ratio),
                        paddingLeft: mobileSizeCalc(15, ratio),
                        paddingRight: mobileSizeCalc(15, ratio),
                        paddingTop: mobileSizeCalc(10, ratio),
                        paddingBottom: mobileSizeCalc(10, ratio),
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    />
                  </div>
                  <div
                    className="flex items-center font-semibold text-gray-600"
                    style={{
                      marginTop: mobileSizeCalc(20, ratio),
                      height: mobileSizeCalc(30, ratio),
                      fontSize: mobileSizeCalc(14, ratio),
                      lineHeight: mobileSizeCalc(20, ratio),
                    }}
                  >
                    첨부파일
                  </div>
                  <div
                    onClick={handleSelect}
                    className="flex w-full cursor-pointer flex-col items-center rounded-[5px] bg-gray-200"
                    style={{
                      paddingTop: mobileSizeCalc(20, ratio),
                      paddingBottom: mobileSizeCalc(20, ratio),
                    }}
                  >
                    <Image
                      src="/file_upload.png"
                      alt="파일 업로드"
                      width={50}
                      height={50}
                      style={{
                        width: mobileSizeCalc(50, ratio),
                        height: mobileSizeCalc(50, ratio),
                      }}
                    />
                    <div
                      className="whitespace-pre-line text-center font-normal text-gray-500"
                      style={{
                        marginTop: mobileSizeCalc(10, ratio),
                        fontSize: mobileSizeCalc(14, ratio),
                        lineHeight: mobileSizeCalc(20, ratio),
                      }}
                    >
                      영역을 클릭하여{"\n"}파일을 추가하세요
                    </div>
                    {appendFile.length === 0 ? null : (
                      <div
                        className="flex flex-col"
                        style={{
                          marginTop: mobileSizeCalc(10, ratio),
                          marginBottom: mobileSizeCalc(10, ratio),
                          rowGap: mobileSizeCalc(10, ratio),
                        }}
                      >
                        {appendFile.map((item, index: number) => (
                          <div
                            key={index.toString()}
                            className="truncate rounded-[5px] bg-gray-300 font-semibold text-gray-600"
                            style={{
                              width: mobileSizeCalc(250, ratio),
                              padding: mobileSizeCalc(15, ratio),
                              fontSize: mobileSizeCalc(14, ratio),
                              lineHeight: mobileSizeCalc(20, ratio),
                            }}
                          >
                            {item.split("/cs/")[1]}
                          </div>
                        ))}
                      </div>
                    )}
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
                    className="rounded-[5px] bg-serve font-semibold text-white disabled:bg-gray-400"
                    style={{
                      marginTop: mobileSizeCalc(40, ratio),
                      paddingTop: mobileSizeCalc(10, ratio),
                      paddingBottom: mobileSizeCalc(10, ratio),
                      fontSize: mobileSizeCalc(16, ratio),
                      lineHeight: mobileSizeCalc(24, ratio),
                    }}
                  >
                    전송하기
                  </button>
                </form>
              ) : (
                <div className="flex flex-col">
                  {myInquiry?.map((inquiry) => (
                    <Link
                      key={inquiry.id.toString()}
                      className="flex w-full flex-col border-b border-gray-200"
                      href={`/inquiry/${inquiry.id}`}
                      style={{
                        height: mobileSizeCalc(105, ratio),
                        paddingTop: mobileSizeCalc(15, ratio),
                        paddingBottom: mobileSizeCalc(15, ratio),
                      }}
                    >
                      <div
                        className=""
                        style={{
                          height: mobileSizeCalc(20, ratio),
                        }}
                      >
                        <span
                          className={`rounded-full text-center font-semibold text-white ${inquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600" : "bg-serve"}`}
                          style={{
                            paddingLeft: mobileSizeCalc(10, ratio),
                            paddingRight: mobileSizeCalc(10, ratio),
                            fontSize: mobileSizeCalc(14, ratio),
                            lineHeight: mobileSizeCalc(14, ratio),
                          }}
                        >
                          {inquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
                        </span>
                      </div>
                      <div
                        className="truncate font-medium text-gray-700"
                        style={{
                          marginTop: mobileSizeCalc(8, ratio),
                          fontSize: mobileSizeCalc(16, ratio),
                          lineHeight: mobileSizeCalc(24, ratio),
                        }}
                      >
                        {inquiry.title}
                      </div>
                      <div
                        className="flex items-center"
                        style={{
                          marginTop: mobileSizeCalc(5, ratio),
                        }}
                      >
                        <Image
                          src="/profile.png"
                          alt="프로필"
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
                            marginLeft: mobileSizeCalc(4, ratio),
                            fontSize: mobileSizeCalc(14, ratio),
                            lineHeight: mobileSizeCalc(20, ratio),
                          }}
                        >
                          {context?.user?.displayName ?? "작성자"}
                        </div>
                        <Image
                          className=""
                          src="/clock.png"
                          alt="작성일자"
                          width={14}
                          height={14}
                          style={{
                            marginLeft: mobileSizeCalc(10, ratio),
                            width: mobileSizeCalc(14, ratio),
                            height: mobileSizeCalc(14, ratio),
                          }}
                        />
                        <div
                          className="font-normal text-gray-500"
                          style={{
                            marginLeft: mobileSizeCalc(4, ratio),
                            fontSize: mobileSizeCalc(14, ratio),
                            lineHeight: mobileSizeCalc(20, ratio),
                          }}
                        >
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
                  marginBottom: desktopSizeCalc(80, ratio),
                  minHeight: desktopSizeCalc(1150, ratio),
                  paddingBottom: desktopSizeCalc(60, ratio),
                }}
              >
                <nav className="desktop:flex">
                  {tabs.map((tab) => (
                    <div key={tab} className="relative">
                      <button
                        onClick={() => setActive(tab)}
                        className={`flex items-center justify-center text-3xl font-medium ${active === tab ? "bg-gradient-to-b from-[#2167FF] to-[#2398FF] bg-clip-text text-transparent" : "text-white/60"}`}
                        style={{
                          height: desktopSizeCalc(100, ratio),
                          width: desktopSizeCalc(200, ratio),
                          fontSize: desktopSizeCalc(30, ratio),
                          lineHeight: desktopSizeCalc(36, ratio),
                        }}
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
                    <div
                      className="flex justify-between border-b border-gray-400"
                      style={{
                        marginTop: desktopSizeCalc(20, ratio),
                        paddingBottom: desktopSizeCalc(30, ratio),
                        paddingTop: desktopSizeCalc(20, ratio),
                      }}
                    >
                      <div
                        className="flex items-center"
                        style={{
                          height: desktopSizeCalc(60, ratio),
                          width: desktopSizeCalc(480, ratio),
                        }}
                      >
                        <div
                          className="font-bold text-gray-100"
                          style={{
                            width: desktopSizeCalc(80, ratio),
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        >
                          ID
                        </div>
                        <div
                          className="font-normal text-gray-100"
                          style={{
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        >
                          {context?.user?.email ?? ""}
                        </div>
                      </div>
                      <div
                        className="flex items-center"
                        style={{
                          height: desktopSizeCalc(60, ratio),
                          width: desktopSizeCalc(480, ratio),
                        }}
                      >
                        <div
                          className="font-bold text-gray-100"
                          style={{
                            width: desktopSizeCalc(80, ratio),
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        >
                          고객명
                        </div>
                        <div
                          className="text-lg font-normal text-gray-100"
                          style={{
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        >
                          {context?.user?.displayName ?? ""}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex w-full flex-col"
                      style={{
                        paddingBottom: desktopSizeCalc(30, ratio),
                        paddingTop: desktopSizeCalc(20, ratio),
                      }}
                    >
                      <div
                        className="font-bold text-gray-100"
                        style={{
                          fontSize: desktopSizeCalc(20, ratio),
                          lineHeight: desktopSizeCalc(28, ratio),
                        }}
                      >
                        제목
                      </div>
                      <div className="w-full">
                        <input
                          type="text"
                          className="w-full rounded-[5px] border-none bg-white/15 font-normal text-gray-400 outline-none focus:border-none focus:outline-none focus:ring-0"
                          placeholder="문의하실 내용의 제목을 입력해주세요"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          style={{
                            marginTop: desktopSizeCalc(20, ratio),
                            paddingLeft: desktopSizeCalc(20, ratio),
                            paddingRight: desktopSizeCalc(20, ratio),
                            paddingTop: desktopSizeCalc(15, ratio),
                            paddingBottom: desktopSizeCalc(15, ratio),
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="flex w-full flex-col"
                      style={{
                        paddingBottom: desktopSizeCalc(30, ratio),
                        paddingTop: desktopSizeCalc(20, ratio),
                      }}
                    >
                      <div
                        className="font-bold text-gray-100"
                        style={{
                          fontSize: desktopSizeCalc(20, ratio),
                          lineHeight: desktopSizeCalc(28, ratio),
                        }}
                      >
                        내용
                      </div>
                      <div className="w-full">
                        <textarea
                          className="w-full rounded-[5px] border-none bg-white/15 font-normal text-gray-400 outline-none focus:border-none focus:outline-none focus:ring-0"
                          placeholder="문의하실 내용을 입력해주세요"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          style={{
                            marginTop: desktopSizeCalc(20, ratio),
                            height: desktopSizeCalc(570, ratio),
                            padding: desktopSizeCalc(20, ratio),
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="flex w-full flex-col"
                      style={{
                        paddingBottom: desktopSizeCalc(30, ratio),
                        paddingTop: desktopSizeCalc(20, ratio),
                      }}
                    >
                      <div
                        className="font-bold text-gray-100"
                        style={{
                          fontSize: desktopSizeCalc(20, ratio),
                          lineHeight: desktopSizeCalc(28, ratio),
                        }}
                      >
                        첨부파일
                      </div>
                      <div
                        onClick={handleSelect}
                        className="flex w-full cursor-pointer flex-col items-center rounded-[5px] bg-white/15"
                        style={{
                          marginTop: desktopSizeCalc(20, ratio),
                          paddingLeft: desktopSizeCalc(30, ratio),
                          paddingRight: desktopSizeCalc(30, ratio),
                          paddingTop: desktopSizeCalc(40, ratio),
                          paddingBottom: desktopSizeCalc(40, ratio),
                        }}
                      >
                        <Image
                          src="/file_upload_desktop.png"
                          alt="파일 업로드"
                          width={70}
                          height={70}
                          style={{
                            width: desktopSizeCalc(70, ratio),
                            height: desktopSizeCalc(70, ratio),
                          }}
                        />
                        <div
                          className="font-normal text-gray-400"
                          style={{
                            marginTop: desktopSizeCalc(20, ratio),
                            fontSize: desktopSizeCalc(20, ratio),
                            lineHeight: desktopSizeCalc(28, ratio),
                          }}
                        >
                          영역을 클릭하여 파일을 추가하세요
                        </div>
                        {appendFile.length === 0 ? null : (
                          <div
                            className="flex w-full flex-col"
                            style={{
                              marginTop: desktopSizeCalc(20, ratio),
                              rowGap: desktopSizeCalc(10, ratio),
                            }}
                          >
                            {appendFile.map((item, index: number) => (
                              <div
                                key={index.toString()}
                                className="truncate rounded-[5px] border border-gray-400 bg-white/15 font-normal text-gray-100"
                                style={{
                                  paddingLeft: desktopSizeCalc(30, ratio),
                                  paddingRight: desktopSizeCalc(30, ratio),
                                  paddingTop: desktopSizeCalc(15, ratio),
                                  paddingBottom: desktopSizeCalc(15, ratio),
                                  fontSize: desktopSizeCalc(20, ratio),
                                  lineHeight: desktopSizeCalc(28, ratio),
                                }}
                              >
                                {item.split("/cs/")[1]}
                              </div>
                            ))}
                          </div>
                        )}
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
                      className="cursor-pointer rounded-[5px] bg-serve font-medium text-white disabled:bg-gray-400"
                      style={{
                        marginTop: desktopSizeCalc(20, ratio),
                        paddingTop: desktopSizeCalc(20, ratio),
                        paddingBottom: desktopSizeCalc(20, ratio),
                        fontSize: desktopSizeCalc(20, ratio),
                        lineHeight: desktopSizeCalc(28, ratio),
                      }}
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
                        className="flex w-full justify-between border-b border-gray-600"
                        style={{
                          paddingTop: desktopSizeCalc(40, ratio),
                          paddingBottom: desktopSizeCalc(40, ratio),
                        }}
                      >
                        <div
                          className="flex items-center"
                          style={{
                            columnGap: desktopSizeCalc(16, ratio),
                          }}
                        >
                          <div
                            className={`flex items-center justify-center rounded-full font-medium ${inquiry.state === "QUESTION_STATE_OPEN" ? "bg-gray-600 text-white" : "bg-serve text-white"}`}
                            style={{
                              height: desktopSizeCalc(30, ratio),
                              width: desktopSizeCalc(64, ratio),
                              fontSize: desktopSizeCalc(20, ratio),
                              lineHeight: desktopSizeCalc(28, ratio),
                            }}
                          >
                            {inquiry.state === "QUESTION_STATE_OPEN" ? "대기중" : "답변완료"}
                          </div>
                          <div
                            className="truncate font-medium text-white"
                            style={{
                              width: desktopSizeCalc(500, ratio),
                              fontSize: desktopSizeCalc(20, ratio),
                              lineHeight: desktopSizeCalc(28, ratio),
                            }}
                          >
                            {inquiry.title}
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
                              fontSize: desktopSizeCalc(20, ratio),
                              lineHeight: desktopSizeCalc(28, ratio),
                            }}
                          >
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

  return null;
}
