"use client";
/* ----------------------------------------------------------------
  TODO:
  2) 데스크탑 · 모바일 공통 영상 모달 구현 (play 버튼 클릭 시)
  3) 모바일 전용 슬라이드 추가 디자인 및 내용 확정
  4) 배경 이미지 프리로드 & 퍼포먼스 최적화
  5) https://journey-dev.tistory.com/123 안티얼리어싱, text-shadow 관련 문제 해결 필요
---------------------------------------------------------------- */
import { useState, useEffect, FormEvent, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import csr from "lib/fetcher/csr";
import useWindowSize from "app/_components/useWindowSize";
import { paginationMobileSizeCalc } from "app/_components/sizeCalculator";
import Modal from "app/_components/Modal";
import Clarity from "@microsoft/clarity";
import { gaEvent } from "lib/gtag";

declare global {
  interface Window {
    cauly_send?: (param: { track_code: string; event_name: string; event_param: string }) => void;
  }
}

const agreementItems = ["age", "privacy", "alarm"];
// 원래 버전 + 데스크탑 인디케이터(클릭 스크롤 지원) + 마우스 스크롤 이미지 1페이지만 노출
export default function Page() {
  const images = {
    mobile: ["/bg_mobile2.png"],
    // mobile: ["/test_1.png", "/test_2.png", "/test_3.png", "/test_4.png"],
    desktop: ["/bg_desktop1.png"],
    // desktop: ["/test_1.png", "/test_2.png", "/test_3.png", "/test_4.png"],
  } as const;

  const [index, setIndex] = useState(0);
  const [activeDesktopSection, setActiveDesktopSection] = useState(0); // 0 or 1
  const [activeMobileSection, setActiveMobileSection] = useState(0); // 0 or 1
  const [store, setStore] = useState<string>("");
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [frontPhoneNumber, setFrontPhoneNumber] = useState<string>("");
  const [backPhoneNumber, setBackPhoneNumber] = useState<string>("");
  const mobileBackPhoneRef = useRef<HTMLInputElement>(null);
  const mobileFrontPhoneRef = useRef<HTMLInputElement>(null);
  const desktopBackPhoneRef = useRef<HTMLInputElement>(null);
  const desktopFrontPhoneRef = useRef<HTMLInputElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isAlarmOpen, setIsAlarmOpen] = useState<boolean>(false);
  const { ratio, width, height } = useWindowSize();

  const toggleAll = (flag: boolean) => {
    setCheckedList(flag ? agreementItems : []);
  };

  const toggleOne = (name: string) => {
    setCheckedList((list) =>
      list.includes(name) ? list.filter((v) => v !== name) : [...list, name],
    );
  };

  const allChecked = checkedList.length === agreementItems.length;

  /* 배경 이미지 순환 */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.mobile.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* 데스크탑 섹션 관찰 → 인디케이터 업데이트 */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.getElementById("desktop-scroll");
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>(".desktop-section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActiveDesktopSection(idx);
          }
        });
      },
      {
        root,
        threshold: 0.6,
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  /* 모바일 섹션 IntersectionObserver */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.getElementById("mobile-scroll");
    if (!root) return;
    const secs = root.querySelectorAll<HTMLElement>(".mobile-section");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            setActiveMobileSection(Number(e.target.getAttribute("data-index")));
          }
        }),
      { root, threshold: 0.5 },
    );
    secs.forEach((s) => io.observe(s));
    return () => secs.forEach((s) => io.unobserve(s));
  }, []);

  const mobileBg = images.mobile[index];
  const desktopBg = images.desktop[index];

  /* 데스크탑 인디케이터 클릭 시 섹션으로 스크롤 */
  const scrollToDesktopSection = (targetIdx: number) => {
    if (typeof window === "undefined") return;
    const root = document.getElementById("desktop-scroll");
    if (!root) return;
    const target = root.querySelector<HTMLElement>(`.desktop-section[data-index='${targetIdx}']`);
    if (target) {
      root.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    }
  };

  /* 모바일 버튼 클릭 시 섹션으로 스크롤 */
  const scrollToMobileSection = (i: number) => {
    if (typeof window === "undefined") return;
    const root = document.getElementById("mobile-scroll");
    const tgt = root?.querySelector<HTMLElement>(`.mobile-section[data-index='${i}']`);
    if (tgt) {
      root?.scrollTo({ top: tgt.offsetTop, behavior: "smooth" });
    }
  };

  /* 인디케이터 컴포넌트 (데스크탑 전용) */
  const Indicator = () => {
    const items = ["메인", "사전등록"];
    return (
      <div
        className="fixed top-1/2 z-50 flex -translate-y-1/2 flex-col items-end gap-y-[18px] desktop:flex"
        style={{
          right: `${width >= 1920 ? Math.round(30 + (width - 1920) / 2) : "30"}px`,
        }}
      >
        {items.map((label, i) => {
          const isActive = i === activeDesktopSection;
          return (
            <div
              key={label}
              className={`flex cursor-pointer items-center justify-center transition-all duration-300 ${isActive ? "flex h-10 w-[110px] items-center gap-x-2 rounded-lg bg-[#1C4154] px-[15px] text-lg font-semibold text-white" : "w-full justify-center text-lg font-normal text-white"}`}
              onClick={() => scrollToDesktopSection(i)}
            >
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 디코딩을 반드시 해야 함
  const tickSvg = `data:image/svg+xml,%3Csvg%20width%3D%2213%22%20height%3D%229%22%20viewBox%3D%220%200%2013%209%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5.08%208.64L0%203.56L1.41%202.15L5.08%205.81L10.89%200L12.3%201.41L5.08%208.64Z%22%20fill%3D%22white%22%20%2F%3E%3C%2Fsvg%3E`;

  // TODO: os 가 Android라면, 구글플레이스토어로 보내자..
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    if (store === "" || !allChecked || frontPhoneNumber === "" || backPhoneNumber === "") {
      return alert("사전 등록을 위해서 필요한 정보를 입력해주세요");
    }
    const phoneNumber = frontPhoneNumber + backPhoneNumber;
    if (phoneNumber.length !== 8) {
      return alert("핸드폰번호를 정확하게 입력해주세요");
    }

    const data = {
      store: store,
      phone_number: phoneNumber,
      agreeAge: checkedList.includes("age"),
      agreePrivacy: checkedList.includes("privacy"),
      agreeAlarm: checkedList.includes("alarm"),
    };

    const req = await csr
      .post("reservation", { json: data })
      .then(async (req) => {
        const resp: any = await req.json();
        if (resp.result === "success") {
          // cauly 트래커 발송
          if (typeof window.cauly_send === "function") {
            // cauly -> 마케팅
            window.cauly_send({
              track_code: process.env.NEXT_PUBLIC_CAULY_TRACK_CODE as string,
              event_name: process.env.NEXT_PUBLIC_CAULY_EVENT_NAME as string,
              event_param: phoneNumber,
            });
          }
          gaEvent("event", "generate_lead", {
            lead_status: "pre_registration",
          });
          Clarity.event("pre_registration_completed");
          setStore("");
          setCheckedList([]);
          setFrontPhoneNumber("");
          setBackPhoneNumber("");
          alert("사전예약에 성공하였습니다");
        }
      })
      .catch((err) => {
        alert(err?.message ?? "사전 예약에 실패했습니다.\n잠시 후 다시 시도해주세요");
        console.error(err, "err");
      });
  };

  return (
    <main className="relative w-full desktop:bg-black">
      {/* ───── 모바일 전용 ───── */}
      <div
        id="mobile-scroll"
        className="h-dvh snap-y snap-mandatory overflow-y-scroll bg-cover bg-fixed bg-top transition-[background-image] duration-1000 ease-in-out desktop:hidden"
        style={{ backgroundImage: `url(${mobileBg})` }}
      >
        {/* 모바일 슬라이드 1 */}
        <section
          className="mobile-section flex h-dvh snap-start flex-col items-center"
          data-index={0}
        >
          <Image
            src="/advance_reservation_logo_bar_mobile.png"
            alt="로고"
            width={150}
            height={85}
            style={{
              marginTop: paginationMobileSizeCalc(102, ratio),
              width: paginationMobileSizeCalc(150, ratio),
              height: paginationMobileSizeCalc(85, ratio),
            }}
            unoptimized
          />
          <h1
            className="whitespace-pre-line text-center font-gmarket font-light text-white"
            style={{
              marginTop: paginationMobileSizeCalc(27, ratio),
              fontSize: paginationMobileSizeCalc(30, ratio),
              lineHeight: paginationMobileSizeCalc(40, ratio),
            }}
          >
            빠른 속도감과 100%{"\n"}공정한 카드 분배,{"\n"}아토즈포커
          </h1>
          <Image
            src="/advance_reservation_play.png"
            alt="play"
            width={100}
            height={100}
            style={{
              width: paginationMobileSizeCalc(100, ratio),
              height: paginationMobileSizeCalc(100, ratio),
              marginTop: paginationMobileSizeCalc(43, ratio),
            }}
            onClick={() => {
              setIsVideoOpen(true);
              Clarity.event("watch_pre_registration_video");
            }}
          />
          <div className="flex w-full justify-center">
            <button
              type="button"
              className="rounded-lg bg-[#1C4154] font-semibold text-white"
              onClick={() => scrollToMobileSection(2)}
              style={{
                marginTop: paginationMobileSizeCalc(69, ratio),
                height: paginationMobileSizeCalc(64, ratio),
                width: paginationMobileSizeCalc(250, ratio),
                fontSize: paginationMobileSizeCalc(22, ratio),
              }}
            >
              사전등록
            </button>
          </div>
          {/* 모바일 1페이지만 스크롤 아이콘 */}
          {activeMobileSection === 0 && (
            <Image
              src="/advance_reservation_mouse_scroll.png"
              alt="scroll"
              width={63}
              height={81}
              className="absolute"
              style={{
                width: paginationMobileSizeCalc(63, ratio),
                height: paginationMobileSizeCalc(81, ratio),
                bottom: paginationMobileSizeCalc(23, ratio),
              }}
              unoptimized
            />
          )}
        </section>

        {/* 모바일 슬라이드 2 */}
        <section
          className="mobile-section flex h-dvh snap-start justify-center overflow-hidden"
          data-index={1}
        >
          <div
            className="mx-auto flex flex-col items-center rounded-[20px] bg-[#161B38]"
            style={{
              width: paginationMobileSizeCalc(300, ratio, 360, 624),
              height: paginationMobileSizeCalc(440, ratio, 360, 624),
              marginTop: paginationMobileSizeCalc(50, ratio, 360, 624),
              paddingTop: paginationMobileSizeCalc(15, ratio, 360, 624),
              paddingLeft: paginationMobileSizeCalc(20, ratio, 360, 624),
              paddingRight: paginationMobileSizeCalc(20, ratio, 360, 624),
              paddingBottom: paginationMobileSizeCalc(20, ratio, 360, 624),
            }}
          >
            <Image
              src="/advance_reservation_reservation_mobile.png"
              width={233}
              height={115}
              style={{
                width: paginationMobileSizeCalc(233, ratio, 360, 624),
                height: paginationMobileSizeCalc(115, ratio, 360, 624),
              }}
              alt="아토즈포커 사전예약 사전등록"
            />
            <h3
              className="font-normal text-white"
              style={{
                marginTop: paginationMobileSizeCalc(9, ratio, 360, 624),
                fontSize: paginationMobileSizeCalc(10, ratio, 360, 624),
                lineHeight: paginationMobileSizeCalc(10, ratio, 360, 624),
              }}
            >
              기간: 2025년 9월 4일(목) - 2025년 9월 29일(월) 23:59
            </h3>
            <h5
              className="font-medium text-white"
              style={{
                marginTop: paginationMobileSizeCalc(24, ratio, 360, 624),
                fontSize: paginationMobileSizeCalc(18, ratio, 360, 624),
                lineHeight: paginationMobileSizeCalc(18, ratio, 360, 624),
              }}
            >
              사전등록 선물
            </h5>
            <div
              className="flex w-full flex-col items-center rounded-[15px] bg-[#0C1027]"
              style={{
                marginTop: paginationMobileSizeCalc(17, ratio, 360, 624),
                paddingLeft: paginationMobileSizeCalc(20, ratio, 360, 624),
                paddingRight: paginationMobileSizeCalc(20, ratio, 360, 624),
                paddingBottom: paginationMobileSizeCalc(17, ratio, 360, 624),
                paddingTop: paginationMobileSizeCalc(19, ratio, 360, 624),
              }}
            >
              <Image
                src="/advance_reservation_sclass_mobile.png"
                alt="사전등록 선물 S-Class"
                width={37.17}
                height={72.21}
                style={{
                  width: paginationMobileSizeCalc(37.17, ratio, 360, 624),
                  height: paginationMobileSizeCalc(72.21, ratio, 360, 624),
                }}
              />
              <table
                className="w-full"
                style={{
                  marginTop: paginationMobileSizeCalc(11, ratio, 360, 624),
                }}
              >
                <tbody className="w-full">
                  <tr
                    className="flex"
                    style={{
                      paddingBottom: paginationMobileSizeCalc(10, ratio, 360, 624),
                    }}
                  >
                    <th
                      className="text-left font-medium text-[#A0ABDC]"
                      style={{
                        fontSize: paginationMobileSizeCalc(10, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(12, ratio, 360, 624),
                        width: paginationMobileSizeCalc(55, ratio, 360, 624),
                      }}
                    >
                      딜러비
                    </th>
                    <th
                      className="font-medium text-white"
                      style={{
                        fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(14, ratio, 360, 624),
                      }}
                    >
                      5%→2%할인
                    </th>
                  </tr>
                  <tr
                    className="flex border-y border-[#232741]"
                    style={{
                      paddingTop: paginationMobileSizeCalc(10, ratio, 360, 624),
                      paddingBottom: paginationMobileSizeCalc(10, ratio, 360, 624),
                    }}
                  >
                    <th
                      className="text-left font-medium text-[#A0ABDC]"
                      style={{
                        fontSize: paginationMobileSizeCalc(10, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(12, ratio, 360, 624),
                        width: paginationMobileSizeCalc(55, ratio, 360, 624),
                      }}
                    >
                      보유한도
                    </th>
                    <th
                      className="font-medium text-white"
                      style={{
                        fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(14, ratio, 360, 624),
                      }}
                    >
                      10배 증가
                    </th>
                  </tr>
                  <tr
                    className="flex"
                    style={{
                      paddingTop: paginationMobileSizeCalc(10, ratio, 360, 624),
                      paddingBottom: paginationMobileSizeCalc(9, ratio, 360, 624),
                    }}
                  >
                    <th
                      className="text-left font-medium text-[#A0ABDC]"
                      style={{
                        fontSize: paginationMobileSizeCalc(10, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(12, ratio, 360, 624),
                        width: paginationMobileSizeCalc(55, ratio, 360, 624),
                      }}
                    >
                      전용상점
                    </th>
                    <th
                      className="font-medium text-white"
                      style={{
                        fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(14, ratio, 360, 624),
                      }}
                    >
                      S클래스 전용 상점
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* 모바일 1페이지만 스크롤 아이콘 */}
          {activeMobileSection === 1 && (
            <Image
              src="/advance_reservation_mouse_scroll.png"
              alt="scroll"
              width={63}
              height={81}
              className="absolute"
              style={{
                width: paginationMobileSizeCalc(63, ratio),
                height: paginationMobileSizeCalc(81, ratio),
                bottom: paginationMobileSizeCalc(23, ratio),
              }}
              unoptimized
            />
          )}
        </section>

        {/* 모바일 슬라이드 3 */}
        <section
          className="mobile-section flex h-dvh snap-start items-center justify-center overflow-hidden"
          data-index={2}
        >
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex flex-col rounded-[20px] bg-[#F3F3F3]"
            style={{
              width: paginationMobileSizeCalc(300, ratio, 360, 624),
              height: paginationMobileSizeCalc(524, ratio, 360, 624),
              paddingTop: paginationMobileSizeCalc(25, ratio, 360, 624),
              paddingLeft: paginationMobileSizeCalc(20, ratio, 360, 624),
              paddingRight: paginationMobileSizeCalc(20, ratio, 360, 624),
              paddingBottom: paginationMobileSizeCalc(21, ratio, 360, 624),
            }}
          >
            <div
              className="flex items-center"
              style={{
                columnGap: paginationMobileSizeCalc(29, ratio, 360, 624),
                paddingLeft: paginationMobileSizeCalc(10, ratio, 360, 624),
              }}
            >
              <label
                className="flex items-center"
                style={{ columnGap: paginationMobileSizeCalc(6, ratio, 360, 624) }}
              >
                <input
                  type="radio"
                  name="store"
                  value="google"
                  style={{
                    // 기본 외형 제거
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    // 공통 크기와 테두리
                    width: paginationMobileSizeCalc(20, ratio, 360, 624),
                    height: paginationMobileSizeCalc(20, ratio, 360, 624),
                    borderRadius: "50%",
                    border: "1px solid black",
                    margin: 0,
                    cursor: "pointer",
                    outline: "none",
                    background: store === "google" ? "#1C4154" : "#F3F3F3",
                    boxShadow: store === "google" ? "inset 0 0 0 3px #F3F3F3" : "none",
                    transition: "background .15s ease",
                  }}
                  checked={store === "google"}
                  onChange={(e) => setStore(e.target.value)}
                />
                <span
                  className="font-normal text-black"
                  style={{
                    fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                    lineHeight: paginationMobileSizeCalc(14, ratio, 360, 624),
                  }}
                >
                  Google Play
                </span>
              </label>
              <label
                className="flex items-center"
                style={{ columnGap: paginationMobileSizeCalc(6, ratio, 360, 624) }}
              >
                <input
                  type="radio"
                  name="store"
                  value="ios"
                  style={{
                    // 기본 외형 제거
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    // 공통 크기와 테두리
                    width: paginationMobileSizeCalc(20, ratio, 360, 624),
                    height: paginationMobileSizeCalc(20, ratio, 360, 624),
                    borderRadius: "50%",
                    border: "1px solid black",
                    margin: 0,
                    cursor: "pointer",
                    outline: "none",
                    background: store === "ios" ? "#1C4154" : "#F3F3F3",
                    boxShadow: store === "ios" ? "inset 0 0 0 3px #F3F3F3" : "none",
                    transition: "background .15s ease",
                  }}
                  checked={store === "ios"}
                  onChange={(e) => setStore(e.target.value)}
                />
                <span
                  className="font-normal text-black"
                  style={{
                    fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                    lineHeight: paginationMobileSizeCalc(14, ratio, 360, 624),
                  }}
                >
                  App Store
                </span>
              </label>
            </div>
            <div
              className="w-full rounded-[10px] border border-[#AAAAAA]"
              style={{
                marginTop: paginationMobileSizeCalc(14, ratio, 360, 624),
              }}
            >
              <label
                className="flex w-full items-center border-b border-[#AAAAAA]"
                style={{
                  paddingTop: paginationMobileSizeCalc(17, ratio, 360, 624),
                  paddingBottom: paginationMobileSizeCalc(15, ratio, 360, 624),
                  paddingLeft: paginationMobileSizeCalc(13, ratio, 360, 624),
                }}
              >
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => toggleAll(e.target.checked)}
                  style={{
                    // 기본 외형 제거
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    // 공통 크기와 테두리
                    width: paginationMobileSizeCalc(20, ratio, 360, 624),
                    height: paginationMobileSizeCalc(20, ratio, 360, 624),
                    borderRadius: "5px",
                    border: allChecked ? "1px solid #1C4154" : "1px solid black",
                    cursor: "pointer",
                    outline: "none",
                    transition: "background .15s",
                    background: allChecked
                      ? `#1C4154 url("${tickSvg}") no-repeat center/10px`
                      : "#F3F3F3",
                    boxShadow: "none",
                  }}
                />
                <span
                  className="font-semibold text-black"
                  style={{
                    paddingLeft: paginationMobileSizeCalc(11, ratio, 360, 624),
                    fontSize: paginationMobileSizeCalc(14, ratio, 360, 624),
                  }}
                >
                  전체동의
                </span>
              </label>
              <div
                className="flex flex-col"
                style={{
                  paddingTop: paginationMobileSizeCalc(17, ratio, 360, 624),
                  paddingBottom: paginationMobileSizeCalc(17, ratio, 360, 624),
                  paddingLeft: paginationMobileSizeCalc(20, ratio, 360, 624),
                  rowGap: paginationMobileSizeCalc(15, ratio, 360, 624),
                }}
              >
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="age"
                    checked={checkedList.includes("age")}
                    onChange={(e) => toggleOne(e.target.name)}
                    style={{
                      // 기본 외형 제거
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      // 공통 크기와 테두리
                      width: paginationMobileSizeCalc(20, ratio, 360, 624),
                      height: paginationMobileSizeCalc(20, ratio, 360, 624),
                      borderRadius: "5px",
                      border: checkedList.includes("age") ? "1px solid #1C4154" : "1px solid black",
                      cursor: "pointer",
                      outline: "none",
                      transition: "background .15s",
                      background: checkedList.includes("age")
                        ? `#1C4154 url("${tickSvg}") no-repeat center/10px`
                        : "#F3F3F3",
                      boxShadow: "none",
                    }}
                  />
                  <span
                    className="font-normal text-black"
                    style={{
                      paddingLeft: paginationMobileSizeCalc(9, ratio, 360, 624),
                      fontSize: paginationMobileSizeCalc(13, ratio, 360, 624),
                      lineHeight: paginationMobileSizeCalc(13, ratio, 360, 624),
                    }}
                  >
                    만 18세 이상
                  </span>
                </label>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacy"
                      checked={checkedList.includes("privacy")}
                      onChange={(e) => toggleOne(e.target.name)}
                      style={{
                        // 기본 외형 제거
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        // 공통 크기와 테두리
                        width: paginationMobileSizeCalc(20, ratio, 360, 624),
                        height: paginationMobileSizeCalc(20, ratio, 360, 624),
                        borderRadius: "5px",
                        border: checkedList.includes("privacy")
                          ? "1px solid #1C4154"
                          : "1px solid black",
                        cursor: "pointer",
                        outline: "none",
                        transition: "background .15s",
                        background: checkedList.includes("privacy")
                          ? `#1C4154 url("${tickSvg}") no-repeat center/10px`
                          : "#F3F3F3",
                        boxShadow: "none",
                      }}
                    />
                    <span
                      className="font-normal leading-none text-black"
                      style={{
                        paddingLeft: paginationMobileSizeCalc(9, ratio, 360, 624),
                        fontSize: paginationMobileSizeCalc(13, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(13, ratio, 360, 624),
                      }}
                    >
                      개인정보 수집 및 이용 동의
                    </span>
                  </label>
                  <span
                    className="cursor-pointer rounded-full bg-[#1C4154] font-normal text-white"
                    style={{
                      marginLeft: paginationMobileSizeCalc(9, ratio, 360, 624),
                      paddingLeft: paginationMobileSizeCalc(8, ratio, 360, 624),
                      paddingRight: paginationMobileSizeCalc(8, ratio, 360, 624),
                      paddingTop: paginationMobileSizeCalc(3, ratio, 360, 624),
                      paddingBottom: paginationMobileSizeCalc(3, ratio, 360, 624),
                      fontSize: paginationMobileSizeCalc(11, ratio, 360, 624),
                      lineHeight: paginationMobileSizeCalc(12, ratio, 360, 624),
                    }}
                    onClick={() => setIsPrivacyOpen(true)}
                  >
                    자세히
                  </span>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="alarm"
                      checked={checkedList.includes("alarm")}
                      onChange={(e) => toggleOne(e.target.name)}
                      style={{
                        // 기본 외형 제거
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        // 공통 크기와 테두리
                        width: paginationMobileSizeCalc(20, ratio, 360, 624),
                        height: paginationMobileSizeCalc(20, ratio, 360, 624),
                        borderRadius: "5px",
                        border: checkedList.includes("alarm")
                          ? "1px solid #1C4154"
                          : "1px solid black",
                        cursor: "pointer",
                        outline: "none",
                        transition: "background .15s",
                        background: checkedList.includes("alarm")
                          ? `#1C4154 url("${tickSvg}") no-repeat center/10px`
                          : "#F3F3F3",
                        boxShadow: "none",
                      }}
                    />
                    <span
                      className="font-normal text-black"
                      style={{
                        paddingLeft: paginationMobileSizeCalc(9, ratio, 360, 624),
                        fontSize: paginationMobileSizeCalc(13, ratio, 360, 624),
                        lineHeight: paginationMobileSizeCalc(13, ratio, 360, 624),
                      }}
                    >
                      게임 서비스 소식 받기
                    </span>
                  </label>
                  <span
                    className="rounded-full bg-[#1C4154] font-normal text-white "
                    style={{
                      marginLeft: paginationMobileSizeCalc(9, ratio, 360, 624),
                      paddingLeft: paginationMobileSizeCalc(8, ratio, 360, 624),
                      paddingRight: paginationMobileSizeCalc(8, ratio, 360, 624),
                      paddingTop: paginationMobileSizeCalc(3, ratio, 360, 624),
                      paddingBottom: paginationMobileSizeCalc(3, ratio, 360, 624),
                      fontSize: paginationMobileSizeCalc(11, ratio, 360, 624),
                      lineHeight: paginationMobileSizeCalc(12, ratio, 360, 624),
                    }}
                    onClick={() => setIsAlarmOpen(true)}
                  >
                    자세히
                  </span>
                </div>
              </div>
            </div>
            <div
              className="flex w-full items-center rounded-[10px] border border-[#AAAAAA] bg-white"
              style={{
                marginTop: paginationMobileSizeCalc(20, ratio, 360, 624),
                paddingLeft: paginationMobileSizeCalc(15, ratio, 360, 624),
                paddingTop: paginationMobileSizeCalc(16, ratio, 360, 624),
                paddingBottom: paginationMobileSizeCalc(15, ratio, 360, 624),
              }}
            >
              <div
                className="font-semibold text-[#1F1F1F]"
                style={{
                  fontSize: paginationMobileSizeCalc(18, ratio, 360, 624),
                  lineHeight: paginationMobileSizeCalc(18, ratio, 360, 624),
                }}
              >
                010&nbsp;-&nbsp;
              </div>
              <input
                type="text"
                placeholder="1234"
                value={frontPhoneNumber}
                ref={mobileFrontPhoneRef}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                onChange={(e) => {
                  const isValid = /^\d{0,4}$/.test(e.target.value);

                  if (e.target.value.length < 5 && isValid) {
                    setFrontPhoneNumber(e.target.value);
                  }
                  if (e.target.value.length === 4) {
                    setTimeout(() => mobileBackPhoneRef?.current?.focus(), 1);
                  }
                }}
                className={`m-0 border-none p-0 font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0`}
                style={{
                  fontSize: paginationMobileSizeCalc(18, ratio, 360, 624),
                  lineHeight: paginationMobileSizeCalc(18, ratio, 360, 624),
                  width: paginationMobileSizeCalc(46, ratio, 360, 624),
                  height: paginationMobileSizeCalc(18, ratio, 360, 624),
                }}
              />
              <div
                className="font-semibold text-[#1F1F1F]"
                style={{
                  fontSize: paginationMobileSizeCalc(18, ratio, 360, 624),
                  lineHeight: paginationMobileSizeCalc(18, ratio, 360, 624),
                }}
              >
                &nbsp;-&nbsp;
              </div>
              <input
                type="text"
                placeholder="5678"
                value={backPhoneNumber}
                ref={mobileBackPhoneRef}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                onChange={(e) => {
                  const isValid = /^\d{0,4}$/.test(e.target.value);

                  if (e.target.value.length < 5 && isValid) {
                    setBackPhoneNumber(e.target.value);
                  }
                  if (e.target.value.length === 0) {
                    mobileFrontPhoneRef.current?.focus();
                  }
                }}
                className="m-0 border-none p-0 font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                style={{
                  fontSize: paginationMobileSizeCalc(18, ratio, 360, 624),
                  lineHeight: paginationMobileSizeCalc(18, ratio, 360, 624),
                  width: paginationMobileSizeCalc(46, ratio, 360, 624),
                  height: paginationMobileSizeCalc(18, ratio, 360, 624),
                }}
              />
            </div>
            <button
              disabled={
                !allChecked || store === "" || frontPhoneNumber === "" || backPhoneNumber === ""
              }
              type="submit"
              className="w-full rounded-[10px] bg-[#1C4154] font-semibold text-white disabled:bg-gray-400"
              style={{
                marginTop: paginationMobileSizeCalc(20, ratio, 360, 624),
                height: paginationMobileSizeCalc(54, ratio, 360, 624),
                fontSize: paginationMobileSizeCalc(22, ratio, 360, 624),
                lineHeight: paginationMobileSizeCalc(22, ratio, 360, 624),
              }}
            >
              사전등록하기
            </button>
            <div
              className="flex justify-between"
              style={{
                marginTop: paginationMobileSizeCalc(20, ratio, 360, 624),
              }}
            >
              <Link
                href="https://play.google.com/store/apps/details?id=com.atoz.poker"
                target="_blank"
              >
                <Image
                  src="/advance_reservation_google_mobile.png"
                  alt="구글 플레이스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={73}
                  height={104}
                  style={{
                    width: paginationMobileSizeCalc(73, ratio, 360, 624),
                    height: paginationMobileSizeCalc(104, ratio, 360, 624),
                  }}
                />
              </Link>
              {/*TODO: 검수 끝나고 풀기*/}
              {/*<Image*/}
              {/*  src="/advance_reservation_apple_mobile.png"*/}
              {/*  alt="앱스토어 사전예약"*/}
              {/*  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"*/}
              {/*  quality={100}*/}
              {/*  unoptimized*/}
              {/*  width={73}*/}
              {/*  height={104}*/}
              {/*  style={{*/}
              {/*    width: paginationMobileSizeCalc(73, ratio, 360, 624),*/}
              {/*    height: paginationMobileSizeCalc(104, ratio, 360, 624),*/}
              {/*  }}*/}
              {/*  onClick={() => alert("기능 개발중입니다")}*/}
              {/*/>*/}

              {/*<Image*/}
              {/*  src="/advance_reservation_onestore_mobile.png"*/}
              {/*  alt="원스토어 사전예약"*/}
              {/*  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"*/}
              {/*  quality={100}*/}
              {/*  unoptimized*/}
              {/*  width={73}*/}
              {/*  height={104}*/}
              {/*  style={{*/}
              {/*    width: paginationMobileSizeCalc(73, ratio, 360, 624),*/}
              {/*    height: paginationMobileSizeCalc(104, ratio, 360, 624),*/}
              {/*  }}*/}
              {/*  onClick={() => alert("기능 개발중입니다")}*/}
              {/*/>*/}
            </div>
          </form>
        </section>
      </div>

      {/* ───── 데스크탑 전용 ───── */}
      <div
        id="desktop-scroll"
        className="relative hidden h-screen snap-y snap-mandatory overflow-y-scroll transition-[background-image] duration-1000 ease-in-out desktop:mx-auto desktop:block desktop:aspect-[1920/2095] desktop:w-[1920px] desktop:min-w-[1920px] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y"
        style={{ backgroundImage: `url(${desktopBg})` }}
      >
        {/* 인디케이터 */}
        {width > 1800 ? <Indicator /> : null}

        {/* 슬라이드 1 */}
        <section
          className="desktop-section flex min-h-screen snap-start flex-col items-center pt-[221px]"
          data-index={0}
        >
          <Image src="/advance_reservation_logo.png" alt="아토즈 로고" width={213} height={50} />
          <Image
            src="/advance_reservation_bar.png"
            alt=""
            width={123}
            height={7}
            className="mt-16"
          />
          <h1 className="mt-[21px] font-gmarket text-[38px] font-light leading-none text-white">
            빠른 속도감과 100% 공정한 카드 분배, 아토즈포커
          </h1>
          <Image
            src="/advance_reservation_play.png"
            alt="영상 재생"
            width={100}
            height={100}
            className="mt-[94px] cursor-pointer"
            onClick={() => {
              setIsVideoOpen(true);
              Clarity.event("watch_pre_registration_video");
            }}
          />
          <button
            type="button"
            className="mt-[55px] h-[64px] w-[250px] rounded-lg bg-[#1C4154] text-[22px] font-semibold text-white"
            onClick={() => scrollToDesktopSection(1)}
          >
            사전등록
          </button>
          {/* 마우스 스크롤 이미지는 1페이지에서만 표시 */}
          {activeDesktopSection === 0 && height > 870 ? (
            <Image
              unoptimized
              src="/advance_reservation_mouse_scroll.png"
              alt="마우스 스크롤"
              width={63}
              height={81}
              className="absolute bottom-12"
            />
          ) : null}
        </section>

        {/* 슬라이드 2 */}
        <section
          className="desktop-section flex min-h-screen snap-start flex-col items-center justify-center"
          data-index={1}
        >
          <div className="flex h-[600px] w-[1280px]">
            <div className="flex h-[600px] w-[560px] flex-col items-center rounded-l-[30px] bg-[#161B38] pt-[36px]">
              <Image
                src="/advance_reservation_reservation.png"
                alt="아토즈포커 사전예약 사전등록"
                width={274}
                height={179}
              />
              <div className="mt-[11px] text-sm font-normal leading-none text-white">
                기간: 2025년 9월 4일(목) - 2025년 9월 29일(월) 23:59
              </div>
              <div className="mt-[39px] text-lg font-medium leading-none text-white">
                사전등록 선물
              </div>
              <div className="mt-[33px] flex h-[220px] w-[460px] gap-x-[35px] rounded-[20px] bg-[#0C1027] px-10 py-[35px]">
                <Image
                  src="/advance_reservation_sclass.png"
                  alt="사전등록 선물 S-Class"
                  width={59}
                  height={139}
                  className="mt-2.5"
                />
                <table className="w-full">
                  <tbody className="w-full">
                    <tr className="h-[49px] border-t border-[#232741]">
                      <th className="w-[62px] px-[7px] text-left text-xs font-medium text-[#A0ABDC]">
                        딜러비
                      </th>
                      <th className="text-left text-xl font-medium text-white">5%→2%할인</th>
                    </tr>
                    <tr className="h-[49px] border-t border-[#232741]">
                      <th className="w-[62px] px-[7px] text-left text-xs font-medium text-[#A0ABDC]">
                        보유한도
                      </th>
                      <th className="text-left text-xl font-medium text-white">10배 증가</th>
                    </tr>
                    <tr className="h-[49px] border-y border-[#232741]">
                      <th className="w-[62px] px-[7px] text-left text-xs font-medium text-[#A0ABDC]">
                        전용상점
                      </th>
                      <th className="text-left text-xl font-medium text-white">
                        S클래스 전용 상점
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="h-[600px] w-[720px]  rounded-r-[30px] bg-[#F3F3F3] px-12 pt-[74px]"
            >
              <div className="flex gap-x-[30px] pl-[13px]">
                <label className="flex cursor-pointer items-center gap-x-1.5">
                  <input
                    type="radio"
                    name="store"
                    value="google"
                    style={{
                      // 기본 외형 제거
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      // 공통 크기와 테두리
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1px solid black",
                      margin: 0,
                      cursor: "pointer",
                      outline: "none",
                      background: store === "google" ? "#1C4154" : "#F3F3F3",
                      boxShadow: store === "google" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "google"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-sm font-normal text-black">Google Play</span>
                </label>
                <label className="flex cursor-pointer items-center gap-x-1.5">
                  <input
                    type="radio"
                    name="store"
                    value="ios"
                    style={{
                      // 기본 외형 제거
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      // 공통 크기와 테두리
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "1px solid black",
                      margin: 0,
                      cursor: "pointer",
                      outline: "none",
                      background: store === "ios" ? "#1C4154" : "#F3F3F3",
                      boxShadow: store === "ios" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "ios"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-sm font-normal text-black">App Store</span>
                </label>
              </div>
              <div className="mt-[22px] w-full rounded-[10px] border-2 border-[#AAAAAA]">
                <label className="flex items-center border-b-2 border-[#AAAAAA] px-3 py-3.5">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{
                      // 기본 외형 제거
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      // 공통 크기와 테두리
                      width: 20,
                      height: 20,
                      borderRadius: "5px",
                      border: allChecked ? "1px solid #1C4154" : "1px solid black",
                      cursor: "pointer",
                      outline: "none",
                      transition: "background .15s",
                      background: allChecked
                        ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                        : "#F3F3F3",
                      boxShadow: "none",
                    }}
                  />
                  <span className="px-2.5 text-sm font-semibold text-black">전체동의</span>
                </label>
                <div className="flex flex-col gap-y-3.5 px-6 py-3.5">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="age"
                      checked={checkedList.includes("age")}
                      onChange={(e) => toggleOne(e.target.name)}
                      style={{
                        // 기본 외형 제거
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        // 공통 크기와 테두리
                        width: 20,
                        height: 20,
                        borderRadius: "5px",
                        border: checkedList.includes("age")
                          ? "1px solid #1C4154"
                          : "1px solid black",
                        cursor: "pointer",
                        outline: "none",
                        transition: "background .15s",
                        background: checkedList.includes("age")
                          ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                          : "#F3F3F3",
                        boxShadow: "none",
                      }}
                    />
                    <span className="pl-3 text-sm font-normal text-black">만 18세 이상</span>
                  </label>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="privacy"
                        checked={checkedList.includes("privacy")}
                        onChange={(e) => toggleOne(e.target.name)}
                        style={{
                          // 기본 외형 제거
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          // 공통 크기와 테두리
                          width: 20,
                          height: 20,
                          borderRadius: "5px",
                          border: checkedList.includes("privacy")
                            ? "1px solid #1C4154"
                            : "1px solid black",
                          cursor: "pointer",
                          outline: "none",
                          transition: "background .15s",
                          background: checkedList.includes("privacy")
                            ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                            : "#F3F3F3",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-3 text-sm font-normal text-black">
                        개인정보 수집 및 이용 동의
                      </span>
                    </label>
                    <span
                      className="ml-2 cursor-pointer rounded-full bg-[#1C4154] px-2.5 py-1 text-xs font-normal leading-none text-white"
                      onClick={() => setIsPrivacyOpen(true)}
                    >
                      자세히
                    </span>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="alarm"
                        checked={checkedList.includes("alarm")}
                        onChange={(e) => toggleOne(e.target.name)}
                        style={{
                          // 기본 외형 제거
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          // 공통 크기와 테두리
                          width: 20,
                          height: 20,
                          borderRadius: "5px",
                          border: checkedList.includes("alarm")
                            ? "1px solid #1C4154"
                            : "1px solid black",
                          cursor: "pointer",
                          outline: "none",
                          transition: "background .15s",
                          background: checkedList.includes("alarm")
                            ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                            : "#F3F3F3",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-3 text-sm font-normal text-black">
                        게임 서비스 소식 받기
                      </span>
                    </label>
                    <span
                      className="ml-2 cursor-pointer rounded-full bg-[#1C4154] px-2.5 py-1 text-xs font-normal leading-none text-white"
                      onClick={() => setIsAlarmOpen(true)}
                    >
                      자세히
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex h-[58px] w-full items-center rounded-[10px] border-2 border-[#AAAAAA] bg-white px-5 py-4">
                <div className="text-2xl font-semibold text-[#1F1F1F]">010&nbsp;-&nbsp;</div>
                <input
                  type="text"
                  placeholder="1234"
                  value={frontPhoneNumber}
                  ref={desktopFrontPhoneRef}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  onChange={(e) => {
                    const isValid = /^\d{0,4}$/.test(e.target.value);

                    if (e.target.value.length < 5 && isValid) {
                      setFrontPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 4) {
                      desktopBackPhoneRef?.current?.focus();
                    }
                  }}
                  className="m-0 w-[60px] border-none p-0 text-2xl font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
                <div className="text-2xl font-semibold leading-none text-[#1F1F1F]">
                  &nbsp;-&nbsp;
                </div>
                <input
                  type="text"
                  placeholder="5678"
                  value={backPhoneNumber}
                  ref={desktopBackPhoneRef}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  onChange={(e) => {
                    const isValid = /^\d{0,4}$/.test(e.target.value);

                    if (e.target.value.length < 5 && isValid) {
                      setBackPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 0) {
                      desktopFrontPhoneRef?.current?.focus();
                    }
                  }}
                  className="m-0 w-[60px] border-none p-0 text-2xl font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
              </div>
              <button
                disabled={
                  !allChecked || store === "" || backPhoneNumber === "" || frontPhoneNumber === ""
                }
                type="submit"
                className="mt-3.5 h-[68px] w-full rounded-[10px] bg-[#1C4154] text-[22px] font-semibold text-white disabled:bg-gray-400"
              >
                사전등록하기
              </button>

              <div className="mt-3.5 flex gap-x-[15px]">
                <Link
                  href="https://play.google.com/store/apps/details?id=com.atoz.poker"
                  target="_blank"
                >
                  <Image
                    src="/advance_reservation_google.png"
                    alt="구글 플레이스토어 사전예약"
                    className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                    quality={100}
                    unoptimized
                    width={198}
                    height={91}
                  />
                </Link>
                {/* TODO: 애플, 원스토어 검수 통과 시 다시 올리기 */}
                {/*<Image*/}
                {/*  src="/advance_reservation_apple.png"*/}
                {/*  alt="앱스토어 사전예약"*/}
                {/*  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"*/}
                {/*  quality={100}*/}
                {/*  unoptimized*/}
                {/*  width={198}*/}
                {/*  height={91}*/}
                {/*  // onClick={() => (window.location.href = "")}*/}
                {/*/>*/}
                {/*<Image*/}
                {/*  src="/advance_reservation_onestore.png"*/}
                {/*  alt="원스토어 사전예약"*/}
                {/*  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"*/}
                {/*  quality={100}*/}
                {/*  unoptimized*/}
                {/*  width={198}*/}
                {/*  height={91}*/}
                {/*  onClick={() => alert("기능 개발중입니다")}*/}
                {/*/>*/}
              </div>
            </form>
          </div>
        </section>

        {/* ───── 모바일 전용 영상 모달 ───── */}
        <Modal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)}>
          {/* 공용 전용 */}
          <div className="z-10 h-auto w-[95%] rounded bg-white desktop:w-4/5 desktop:max-w-[1530px]">
            <iframe
              src={`https://www.youtube.com/embed/DCu6LNPvMzY?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-[1280/720] w-full desktop:max-w-[1530px]"
            />
          </div>
        </Modal>

        {/* ───── 개인정보 수집 및 이용 동의 모달 ───── */}
        <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)}>
          <div className="z-10 h-auto w-[90%] rounded bg-white p-5 desktop:w-3/5 desktop:max-w-[1200px]">
            <h2 className="text-lg font-semibold">개인정보 수집 및 이용 동의</h2>
            <div className="mt-2.5 whitespace-pre-line text-sm desktop:text-base">
              {privacyModalText}
            </div>
          </div>
        </Modal>

        {/* ───── 게임 서비스 소식 받기 모달 ───── */}
        <Modal isOpen={isAlarmOpen} onClose={() => setIsAlarmOpen(false)}>
          <div className="z-10 h-auto w-[90%] rounded bg-white p-5 desktop:w-3/5 desktop:max-w-[1200px]">
            <h2 className="text-lg font-semibold">게임 서비스 소식 받기</h2>
            <div className="mt-2.5 whitespace-pre-line text-sm desktop:text-base">
              {alarmModalText}
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}

const privacyModalText = `
사전예약 접수 및 혜택 안내를 위해 OS 종류(Android/iOS)와 휴대전화번호를 수집·이용합니다. 
보관기간: 사전예약 종료 후 1년(또는 동의 철회 시 즉시 파기). 
미동의 시 사전예약 이용이 제한됩니다.

① 수집 항목: OS 종류(Android 또는 iOS), 휴대전화번호
② 수집 목적: 사전예약 접수 확인 및 중복 신청 방지, 출시/보상/이벤트 안내 발송, 고객 문의 대응, 부정 이용 방지
③ 보유·이용 기간: 사전예약 종료 후 1년 보관 후 지체 없이 파기(또는 동의 철회 시 즉시 파기)
④ 처리 위탁: 원활한 메시지 발송 및 시스템 운영을 위해 발송 대행사 및 클라우드 운영사에 업무를 위탁할 수 있습니다. 위탁받는 자와 업무 내용은 서비스 내 공지(또는 개인정보처리방침)에 수시 업데이트합니다.
⑤ 동의 거부 권리 및 불이익: 동의를 거부하실 수 있으나, 미동의 시 사전예약 신청 및 관련 안내 제공이 제한될 수 있습니다.
⑥ 문의처: atozgames.net@gmail.com
`;

const alarmModalText = `
출시 일정·업데이트·이벤트/프로모션 등 광고성 정보를 문자·카카오톡 등으로 받겠습니다. 
수신 동의는 언제든지 철회할 수 있으며, 미동의 시 사전예약 이용이 제한됩니다.

① 발송 목적: 출시 일정, 점검/업데이트, 이벤트·프로모션, 혜택/쿠폰 등 광고성 정보 안내
② 발송 매체: 문자(SMS/MMS), 카카오톡(알림톡/친구톡), 앱 푸시, 이메일 등
③ 보유·이용 기간: 동의 철회 또는 회원 탈퇴 시까지 보관·이용하며, 철회 시 지체 없이 발송을 중단합니다.
④ 수신 거부 방법: 각 메시지 내 표기된 수신거부(무료) 링크/번호 또는 앱/웹 설정, 고객센터를 통해 언제든지 철회 가능합니다.
⑤ 표시 의무 준수: 전송자 표시, (광고) 표기, 수신거부 안내 등 관련 법령 기준을 준수합니다.
⑥ 동의 거부 권리 및 불이익: 동의를 거부하실 수 있으나, 미동의 시 사전예약 신청 및 관련 안내 제공이 제한될 수 있습니다.
⑦ 문의처: atozgames.net@gmail.com
`;
