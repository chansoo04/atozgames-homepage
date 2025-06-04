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

  /* 4글자 이상 입력 시 자동 하이픈 삽입용 헬퍼 */
  const formatPhone = (v: string) => (v.length > 4 ? `${v.slice(0, 4)}-${v.slice(4, 8)}` : v);

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
        className="h-screen snap-y snap-mandatory overflow-y-scroll bg-cover bg-fixed bg-top transition-[background-image] duration-1000 ease-in-out desktop:hidden"
        style={{ backgroundImage: `url(${mobileBg})` }}
      >
        {/* 모바일 슬라이드 1 */}
        <section
          className="mobile-section flex min-h-screen snap-start flex-col items-center"
          data-index={0}
        >
          <Image
            src="/advance_reservation_logo_bar_mobile.png"
            alt="로고"
            width={150}
            height={85}
            className="mt-[102px]"
            unoptimized
          />
          <h1 className="mt-[27px] whitespace-pre-line text-center font-gmarket text-3xl font-light text-white">
            빠른 속도감과 100%{"\n"}공정한 카드 분배,{"\n"}아토즈포커
          </h1>
          <Image
            src="/advance_reservation_play.png"
            alt="play"
            width={100}
            height={100}
            className="mt-[43px]"
            onClick={() => alert("영상 재생 필요")}
          />
          <div className="flex w-full justify-center">
            <button
              type="button"
              className="mt-[70px] w-[69vw] rounded-lg bg-[#1C4154] py-5 text-xl font-semibold text-white"
              onClick={() => scrollToMobileSection(1)}
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
              className="absolute bottom-12"
              unoptimized
            />
          )}
        </section>

        {/* 모바일 슬라이드 2 */}
        <section
          className="mobile-section flex min-h-screen snap-start items-center justify-center"
          data-index={1}
        >
          <div className="mx-auto flex w-[83.3vw] flex-col">
            <div className="flex w-full flex-col items-center rounded-t-[20px] bg-[#161B38] px-5 py-4">
              <Image
                src="/advance_reservation_reservation_mobile.png"
                width={217}
                height={97}
                alt="아토즈포커 사전예약 사전등록"
              />
              <div className="mt-2 text-[10px] font-normal leading-none text-white">
                기간: 2025년 7월 12일(토) - 2025년 8월 11일(월) 23:59
              </div>
              <div className="mt-5 text-xs font-medium leading-none text-white">사전등록 선물</div>
              <div className="mt-[7px] flex h-[120px] w-full gap-x-4 rounded-[15px] bg-[#0C1027] px-6 py-[13px]">
                <Image
                  src="/advance_reservation_sclass.png"
                  alt="사전등록 선물 S-Class"
                  width={40}
                  height={94}
                />
                <table className="w-full">
                  <tbody className="w-full">
                    <tr className="h-[30px]">
                      <th className="w-[55px] text-left text-[10px] font-medium text-[#A0ABDC]">
                        딜러비
                      </th>
                      <th className="text-left text-sm font-medium text-white">5%→2%할인</th>
                    </tr>
                    <tr className="h-[30px] border-y  border-[#232741]">
                      <th className="w-[55px] text-left text-[10px] font-medium text-[#A0ABDC]">
                        보유한도
                      </th>
                      <th className="text-left text-sm font-medium text-white">10배 증가</th>
                    </tr>
                    <tr className="h-[30px]">
                      <th className="w-[55px] text-left text-[10px] font-medium text-[#A0ABDC]">
                        전용상점
                      </th>
                      <th className="text-left text-sm font-medium text-white">
                        S클래스 전용 상점
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col rounded-b-[20px] bg-[#F3F3F3] px-5 pb-5 pt-[22px]"
            >
              <div className="flex gap-x-[29px] pl-2.5">
                <label className="flex items-center gap-x-1.5">
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
                      background: store === "google" ? "#1C4154" : "white",
                      boxShadow: store === "google" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "google"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-sm font-normal leading-none text-black">Google Play</span>
                </label>
                <label className="flex items-center gap-x-1.5">
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
                      background: store === "ios" ? "#1C4154" : "white",
                      boxShadow: store === "ios" ? "inset 0 0 0 4px #FFFFFF" : "none",
                      transition: "background .15s ease",
                    }}
                    checked={store === "ios"}
                    onChange={(e) => setStore(e.target.value)}
                  />
                  <span className="text-sm font-normal leading-none text-black">App Store</span>
                </label>
              </div>
              <div className="mt-[17px] w-full rounded-[10px] border-2 border-[#AAAAAA]">
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
                        : "#FFFFFF",
                      boxShadow: "none",
                    }}
                  />
                  <span className="px-2.5 text-sm font-semibold text-black">전체동의</span>
                </label>
                <div className="flex flex-col gap-y-2.5 py-3.5 pl-6">
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
                          : "#FFFFFF",
                        boxShadow: "none",
                      }}
                    />
                    <span className="pl-2.5 text-xs font-normal text-black">만 18세 이상</span>
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
                            : "#FFFFFF",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-2.5 text-xs font-normal text-black">
                        개인정보 수집 및 이용 동의
                      </span>
                    </label>
                    <span
                      className="ml-2 rounded-full bg-[#1C4154] px-2 py-[3px] text-[10px] font-normal leading-[12px] text-white "
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
                            : "#FFFFFF",
                          boxShadow: "none",
                        }}
                      />
                      <span className="pl-2.5 text-xs font-normal text-black">
                        게임 서비스 소식 받기
                      </span>
                    </label>
                    <span
                      className="ml-2 rounded-full bg-[#1C4154] px-2 py-[3px] text-[10px] font-normal leading-[12px] text-white "
                      onClick={() => alert("개발 예정")}
                    >
                      자세히
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex h-12 w-full items-center rounded-[10px] border-2 border-[#AAAAAA] bg-white px-3.5 py-3">
                <div className="text-lg font-semibold text-[#1F1F1F]">010&nbsp;-&nbsp;</div>
                <input
                  type="number"
                  placeholder="1234"
                  value={frontPhoneNumber}
                  onChange={(e) => {
                    if (e.target.value.length < 5) {
                      setFrontPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 4) {
                      backPhoneRef?.current?.focus();
                    }
                  }}
                  className="m-0 w-[46px] border-none p-0 text-lg font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
                <div className="text-lg font-semibold leading-none text-[#1F1F1F]">
                  &nbsp;-&nbsp;
                </div>
                <input
                  type="number"
                  placeholder="5678"
                  value={backPhoneNumber}
                  ref={backPhoneRef}
                  onChange={(e) => setBackPhoneNumber(e.target.value)}
                  className="m-0 w-[46px] border-none p-0 text-lg font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
              </div>
              <button
                disabled={
                  !allChecked || store === "" || frontPhoneNumber === "" || backPhoneNumber === ""
                }
                type="submit"
                className="mt-2.5 h-[58px] w-full rounded-[10px] bg-[#1C4154] text-xl font-semibold leading-none text-white disabled:bg-gray-400"
              >
                사전등록하기
              </button>
              <div className="mt-4 flex justify-between">
                <Image
                  src="/advance_reservation_apple_mobile.png"
                  alt="앱스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={73}
                  height={118}
                  onClick={() => alert("액션 머임?")}
                />
                <Image
                  src="/advance_reservation_google_mobile.png"
                  alt="구글 플레이스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={73}
                  height={118}
                  onClick={() => alert("액션 머임?")}
                />
                <Image
                  src="/advance_reservation_onestore_mobile.png"
                  alt="원스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={73}
                  height={118}
                  onClick={() => alert("액션 머임?")}
                />
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* ───── 데스크탑 전용 ───── */}
      <div
        id="desktop-scroll"
        className="hidden h-screen snap-y snap-mandatory overflow-y-scroll bg-cover bg-fixed bg-top transition-[background-image] duration-1000 ease-in-out desktop:block"
        style={{ backgroundImage: `url(${desktopBg})` }}
      >
        {/* 인디케이터 */}
        <Indicator />

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
          <h1 className="mt-[21px] font-gmarket text-[38px] font-light leading-none tracking-wide text-white">
            빠른 속도감과 100% 공정한 카드 분배, 아토즈포커
          </h1>
          <Image
            src="/advance_reservation_play.png"
            alt="영상 재생"
            width={100}
            height={100}
            className="mt-[94px] cursor-pointer"
            onClick={() => alert("기능 개발 필요")}
          />
          <button
            type="button"
            className="mt-[55px] h-[64px] w-[250px] rounded-lg bg-[#1C4154] text-[22px] font-semibold text-white"
            onClick={() => scrollToDesktopSection(1)}
          >
            사전등록
          </button>
          {/* 마우스 스크롤 이미지는 1페이지에서만 표시 */}
          {activeDesktopSection === 0 && (
            <Image
              unoptimized
              src="/advance_reservation_mouse_scroll.png"
              alt="마우스 스크롤"
              width={63}
              height={81}
              className="absolute bottom-12"
            />
          )}
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
                기간: 2025년 7월 12일(토) - 2025년 8월 11일(월) 23:59
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
                      onClick={() => alert("개발 예정")}
                    >
                      자세히
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex h-[58px] w-full items-center rounded-[10px] border-2 border-[#AAAAAA] bg-white px-5 py-4">
                <div className="text-2xl font-semibold text-[#1F1F1F]">010&nbsp;-&nbsp;</div>
                <input
                  type="number"
                  placeholder="1234"
                  value={frontPhoneNumber}
                  onChange={(e) => {
                    if (e.target.value.length < 5) {
                      setFrontPhoneNumber(e.target.value);
                    }
                    if (e.target.value.length === 4) {
                      backPhoneRef?.current?.focus();
                    }
                  }}
                  className="m-0 w-[60px] border-none p-0 text-2xl font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
                <div className="text-2xl font-semibold leading-none text-[#1F1F1F]">
                  &nbsp;-&nbsp;
                </div>
                <input
                  type="number"
                  placeholder="5678"
                  value={backPhoneNumber}
                  ref={backPhoneRef}
                  onChange={(e) => setBackPhoneNumber(e.target.value)}
                  className="m-0 w-[60px] border-none p-0 text-2xl font-semibold text-[#1F1F1F] outline-none placeholder:text-gray-500 focus:border-transparent focus:ring-0"
                />
              </div>
              <button
                disabled={
                  !allChecked || store === "" || backPhoneNumber === "" || frontPhoneNumber === ""
                }
                type="submit"
                className="mt-3.5 h-[68px] w-full rounded-[10px] bg-[#1C4154] text-xl font-semibold text-white disabled:bg-gray-400"
              >
                사전등록하기
              </button>
              <div className="mt-3.5 flex gap-x-[15px]">
                <Image
                  src="/advance_reservation_apple.png"
                  alt="앱스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={198}
                  height={91}
                  onClick={() => alert("액션 머임?")}
                />
                <Image
                  src="/advance_reservation_google.png"
                  alt="구글 플레이스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={198}
                  height={91}
                  onClick={() => alert("액션 머임?")}
                />
                <Image
                  src="/advance_reservation_onestore.png"
                  alt="원스토어 사전예약"
                  className="rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)]"
                  quality={100}
                  unoptimized
                  width={198}
                  height={91}
                  onClick={() => alert("액션 머임?")}
                />
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
