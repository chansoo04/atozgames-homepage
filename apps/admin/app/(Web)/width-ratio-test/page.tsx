"use client";
/* ----------------------------------------------------------------
  TODO LIST (keep for future tasks)
  2) 데스크탑 · 모바일 공통 영상 모달 구현 (play 버튼 클릭 시)
  3) 모바일 전용 슬라이드 추가 디자인 및 내용 확정
  4) 배경 이미지 프리로드 & 퍼포먼스 최적화
  5) https://journey-dev.tistory.com/123 안티얼리어싱, text-shadow 관련 문제 해결 필요
  ※ 위 TODO는 기능 구현 순서 논의를 위해 남겨두는 주석입니다.
---------------------------------------------------------------- */
import { useState, useEffect, FormEvent, useRef } from "react";
import Image from "next/image";
import csr from "lib/fetcher/csr";

const agreementItems = ["age", "privacy", "alarm"];
// 원래 버전 + 데스크탑 인디케이터(클릭 스크롤 지원) + 마우스 스크롤 이미지 1페이지만 노출
export default function Page() {
  const images = {
    mobile: ["/bg_mobile2.png"],
    // mobile: ["/test_1.png", "/test_2.png", "/test_3.png", "/test_4.png"],
    desktop: ["/bg_desktop2.png"],
    // desktop: ["/test_1.png", "/test_2.png", "/test_3.png", "/test_4.png"],
  } as const;

  const [index, setIndex] = useState(0);
  const [activeDesktopSection, setActiveDesktopSection] = useState(0); // 0 or 1
  const [activeMobileSection, setActiveMobileSection] = useState(0); // 0 or 1
  const [store, setStore] = useState<string>("");
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [frontPhoneNumber, setFrontPhoneNumber] = useState<string>("");
  const [backPhoneNumber, setBackPhoneNumber] = useState<string>("");
  const backPhoneRef = useRef<HTMLInputElement>(null);
  const frontPhoneRef = useRef<HTMLInputElement>(null);

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
      { root, threshold: 0.3 },
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
      <div className="fixed right-[30px] top-1/2 z-50 flex -translate-y-1/2 flex-col items-end gap-y-[18px] desktop:flex">
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
      phoneNumber: phoneNumber,
      age: checkedList.includes("age"),
      privacy: checkedList.includes("privacy"),
      alarm: checkedList.includes("alarm"),
    };

    const req = await csr
      .post("advance-reservation", { json: data })
      .then(async (req) => {
        const resp: any = await req.json();
        if (resp.result === "success") {
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
    <main className="relative w-full">
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
            width={1}
            height={1}
            style={{ width: "41.58dvw", height: "23.57dvw", marginTop: "28.25dvw" }}
            unoptimized
          />
          <h1 className="mt-[7.49dvw] whitespace-pre-line text-center font-gmarket text-[8.31dvw] font-light leading-[11.09dvw] text-white">
            빠른 속도감과 100%{"\n"}공정한 카드 분배,{"\n"}아토즈포커
          </h1>
          <Image
            width={1}
            height={1}
            src="/advance_reservation_play.png"
            unoptimized
            alt="play"
            style={{ width: "27.71dvw", height: "27.71dvw", marginTop: "11.91dvw" }}
            onClick={() => alert("영상 재생 필요")}
          />
          <div className="flex w-full justify-center">
            <button
              type="button"
              className="rounded-[2.21dvw] bg-[#1C4154] font-semibold text-white"
              style={{
                marginTop: "19.12dvw",
                height: "17.73dvw",
                width: "69.29dvw",
                fontSize: "6.10dvw",
              }}
              onClick={() => scrollToMobileSection(1)}
            >
              사전등록
            </button>
          </div>
          {/* 모바일 1페이지만 스크롤 아이콘 */}
          {/*{activeMobileSection === 0 && (*/}
          {/*  <Image*/}
          {/*    width={1}*/}
          {/*    height={1}*/}
          {/*    src="/advance_reservation_mouse_scroll.png"*/}
          {/*    alt="scroll"*/}
          {/*    style={{*/}
          {/*      position: "absolute",*/}
          {/*      width: "17.47dvw",*/}
          {/*      height: "22.44dvw",*/}
          {/*      bottom: `calc(6.38dvw + env(safe-area-inset-bottom))`,*/}
          {/*    }}*/}
          {/*    unoptimized*/}
          {/*  />*/}
          {/*)}*/}
        </section>

        {/* 모바일 슬라이드 2 */}
        <section
          className="mobile-section flex h-dvh snap-start items-center justify-center overflow-hidden"
          data-index={1}
        >
          <div className="mx-auto flex w-[83.33dvw] flex-col">
            <div className="flex w-full flex-col items-center rounded-t-[20px] bg-[#161B38] px-[5.53dvw] py-[2.78dvw]">
              <Image
                src="/advance_reservation_reservation_mobile.png"
                width={1}
                height={1}
                unoptimized
                style={{ width: "60.13dvw", height: "26.89dvw" }}
                alt="아토즈포커 사전예약 사전등록"
              />
              <div className="mt-[2.50dvw] text-[2.56dvw] font-normal leading-none text-white">
                기간: 2025년 7월 12일(토) - 2025년 8월 11일(월) 23:59
              </div>
              <div className="mt-[4.73dvw] text-[3.04dvw] font-medium leading-none text-white">
                사전등록 선물
              </div>
              <div className="mt-[1.93dvw] flex h-[33.27dvw] w-full gap-x-[4.30dvw] rounded-[6.25dvw] bg-[#0C1027] px-[6.66dvw] py-[3.60dvw]">
                <Image
                  src="/advance_reservation_sclass.png"
                  width={1}
                  height={1}
                  unoptimized
                  alt="사전등록 선물 S-Class"
                  style={{ width: "11.22dvw", height: "26.13dvw" }}
                />
                <table className="w-full">
                  <tbody className="w-full">
                    <tr className="h-[8.03dvw]">
                      <th className="w-[15.23dvw] p-0 text-left text-[2.78dvw] font-medium text-[#A0ABDC]">
                        딜러비
                      </th>
                      <th className="p-0 text-left text-[3.88dvw] font-medium text-white">
                        5%→2%할인
                      </th>
                    </tr>
                    <tr className="h-[8.03dvw] border-y  border-[#232741]">
                      <th className="w-[15.23dvw] p-0 text-left text-[2.78dvw] font-medium text-[#A0ABDC]">
                        보유한도
                      </th>
                      <th className="p-0 text-left text-[3.88dvw] font-medium text-white">
                        10배 증가
                      </th>
                    </tr>
                    <tr className="h-[8.03dvw]">
                      <th className="w-[15.23dvw] p-0 text-left text-[2.78dvw] font-medium text-[#A0ABDC]">
                        전용상점
                      </th>
                      <th className="p-0 text-left text-[3.88dvw] font-medium text-white">
                        S클래스 전용 상점
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col rounded-b-[20px] bg-[#F3F3F3] px-[5.53dvw] pb-[2.78dvw] pt-[5.53dvw]"
            >
              <div className="flex gap-x-[8.03dvw] pl-[2.78dvw]">
                <label className="flex items-center gap-x-[1.67dvw]">
                  <input
                    type="radio"
                    name="store"
                    value="google"
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      width: "5.53dvw",
                      height: "5.53dvw",
                      borderRadius: "50%",
                      border: "1px solid black",
                      margin: 0,
                      cursor: "pointer",
                      outline: "none",
                      background: store === "google" ? "#1C4154" : "white",
                      boxShadow: store === "google" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "google"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-[3.88dvw] font-normal leading-none text-black">
                    Google Play
                  </span>
                </label>
                <label className="flex items-center gap-x-[1.67dvw]">
                  <input
                    type="radio"
                    name="store"
                    value="ios"
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      width: "5.53dvw",
                      height: "5.53dvw",
                      borderRadius: "50%",
                      border: "1px solid black",
                      margin: 0,
                      cursor: "pointer",
                      outline: "none",
                      background: store === "ios" ? "#1C4154" : "white",
                      boxShadow: store === "ios" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "ios"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-[3.88dvw] font-normal leading-none text-black">
                    App Store
                  </span>
                </label>
              </div>
              <div className="mt-[3.32dvw] w-full rounded-[4.17dvw] border-2 border-[#AAAAAA]">
                <label className="flex items-center border-b-2 border-[#AAAAAA] px-[6.66dvw] py-[5.53dvw]">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      width: "5.53dvw",
                      height: "5.53dvw",
                      borderRadius: "1.39dvw",
                      border: allChecked ? "1px solid #1C4154" : "1px solid black",
                      cursor: "pointer",
                      outline: "none",
                      transition: "background .15s",
                      background: allChecked
                        ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                        : "#FFFFFF",
                      boxShadow: "none",
                    }}
                  />
                  <span className="pl-[3.04dvw] text-[3.88dvw] font-semibold text-black">
                    전체동의
                  </span>
                </label>
                <div className="flex flex-col gap-y-[5.53dvw] py-[5.53dvw] pl-[6.66dvw]">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="age"
                      checked={checkedList.includes("age")}
                      onChange={(e) => toggleOne(e.target.name)}
                      style={{
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        width: "5.53dvw",
                        height: "5.53dvw",
                        borderRadius: "1.39dvw",
                        border: checkedList.includes("age")
                          ? "1px solid #1C4154"
                          : "1px solid black",
                        cursor: "pointer",
                        outline: "none",
                        transition: "background .15s",
                        background: checkedList.includes("age")
                          ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                          : "#FFFFFF",
                        boxShadow: "none",
                      }}
                    />
                    <span className="pl-[2.50dvw] text-[3.60dvw] font-normal text-black">
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
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          width: "5.53dvw",
                          height: "5.53dvw",
                          borderRadius: "1.39dvw",
                          border: checkedList.includes("privacy")
                            ? "1px solid #1C4154"
                            : "1px solid black",
                          cursor: "pointer",
                          outline: "none",
                          transition: "background .15s",
                          background: checkedList.includes("privacy")
                            ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                            : "#FFFFFF",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-[2.50dvw] text-[3.60dvw] font-normal text-black">
                        개인정보 수집 및 이용 동의
                      </span>
                    </label>
                    <span
                      className="ml-[2.50dvw] rounded-full bg-[#1C4154] px-[2.21dvw] py-[0.82dvw] text-[3.04dvw] font-normal leading-[3.88dvw] text-white "
                      onClick={() => alert("개발 예정")}
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
                          appearance: "none",
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          width: "5.53dvw",
                          height: "5.53dvw",
                          borderRadius: "1.39dvw",
                          border: checkedList.includes("alarm")
                            ? "1px solid #1C4154"
                            : "1px solid black",
                          cursor: "pointer",
                          outline: "none",
                          transition: "background .15s",
                          background: checkedList.includes("alarm")
                            ? `#1C4154 url("${tickSvg}") no-repeat center/12px`
                            : "#FFFFFF",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-[2.50dvw] text-[3.60dvw] font-normal text-black">
                        게임 서비스 소식 받기
                      </span>
                    </label>
                    <span
                      className="ml-[2.50dvw] rounded-full bg-[#1C4154] px-[2.21dvw] py-[0.82dvw] text-[3.04dvw] font-normal leading-[3.88dvw] text-white "
                      onClick={() => alert("개발 예정")}
                    >
                      자세히
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-[2.78dvw] flex h-[12.74dvw] w-full items-center rounded-[10px] border-2 border-[#AAAAAA] bg-white px-[4.17dvw]">
                <div className="text-[4.99dvw] font-semibold leading-[6.66dvw] text-[#1F1F1F]">
                  010&nbsp;-&nbsp;
                </div>
                <input
                  type="number"
                  placeholder="1234"
                  value={frontPhoneNumber}
                  onBlur={() => {
                    const root = document.documentElement;
                    root.style.transform = "scale(1)";
                    root.style.transformOrigin = "top left";
                    root.style.width = "100%";
                  }}
                  onChange={(e) => {
                    if (e.target.value.length < 5) {
                      setFrontPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 4) {
                      backPhoneRef?.current?.focus();
                    }
                  }}
                  className="m-0 w-[11.28dvw] border-none p-0 text-[4.99dvw] font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
                <div className="text-[4.99dvw] font-semibold leading-none text-[#1F1F1F]">
                  &nbsp;-&nbsp;
                </div>
                <input
                  type="number"
                  // onBlur={() => {
                  //   const root = document.getElementById("mobile-scroll");
                  //   (root as HTMLElement).style.transform = "scale(1)";
                  //   (root as HTMLElement).style.transformOrigin = "top left";
                  //   (root as HTMLElement).style.width = "100dvw";
                  // }}
                  placeholder="5678"
                  value={backPhoneNumber}
                  ref={backPhoneRef}
                  onChange={(e) => {
                    if (e.target.value.length < 5) {
                      setBackPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 0) {
                      frontPhoneRef.current?.focus();
                    }
                  }}
                  className="m-0 w-[13.45dvw] border-none p-0 text-[4.99dvw] font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
              </div>
              <button
                disabled={
                  !allChecked || store === "" || frontPhoneNumber === "" || backPhoneNumber === ""
                }
                type="submit"
                className="w-full rounded-[10px] bg-[#1C4154] text-[6.10dvw] font-semibold leading-none text-white disabled:bg-gray-400"
                style={{ marginTop: "2.78dvw", height: "12.74dvw" }}
              >
                사전등록하기
              </button>
              {/*<div className="mt-[1.28dvw] flex justify-between">*/}
              {/*  <Image*/}
              {/*    width={1}*/}
              {/*    height={1}*/}
              {/*    src="/advance_reservation_apple_mobile.png"*/}
              {/*    alt="앱스토어 사전예약"*/}
              {/*    className="rounded-[10px] shadow-[0px_0.13dvw_0.38dvw_0px_rgba(0,0,0,0.10)]"*/}
              {/*    quality={100}*/}
              {/*    unoptimized*/}
              {/*    style={{ width: "9.32dvw", height: "15.07dvw" }}*/}
              {/*    onClick={() => alert("액션 머임?")}*/}
              {/*  />*/}
              {/*  <Image*/}
              {/*    width={1}*/}
              {/*    height={1}*/}
              {/*    src="/advance_reservation_google_mobile.png"*/}
              {/*    alt="구글 플레이스토어 사전예약"*/}
              {/*    className="rounded-[10px] shadow-[0px_0.13dvw_0.38dvw_0px_rgba(0,0,0,0.10)]"*/}
              {/*    quality={100}*/}
              {/*    unoptimized*/}
              {/*    style={{ width: "9.32dvw", height: "15.07dvw" }}*/}
              {/*    onClick={() => alert("액션 머임?")}*/}
              {/*  />*/}
              {/*  <Image*/}
              {/*    width={1}*/}
              {/*    height={1}*/}
              {/*    src="/advance_reservation_onestore_mobile.png"*/}
              {/*    alt="원스토어 사전예약"*/}
              {/*    className="rounded-[10px] shadow-[0px_0.13dvw_0.38dvw_0px_rgba(0,0,0,0.10)]"*/}
              {/*    quality={100}*/}
              {/*    unoptimized*/}
              {/*    style={{ width: "9.32dvw", height: "15.07dvw" }}*/}
              {/*    onClick={() => alert("액션 머임?")}*/}
              {/*  />*/}
              {/*</div>*/}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
