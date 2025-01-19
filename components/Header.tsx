"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 모바일 */}
      <nav className="md:hidden sticky top-0 border-b border-gray-100 z-40 bg-white h-[50px] px-5 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/images/logo.png" // public 폴더 기준 경로
            alt="Logo"
            width={50} // 원하는 너비
            height={50} // 원하는 높이
            priority // 초기 로드 최적화
          />
        </Link>
        <button type="button" onClick={() => setIsOpen(true)}>
          메뉴 버튼
        </button>
      </nav>
      {isOpen ? (
        <div className="md:hidden fixed top-0 left-0 z-40 flex w-full h-screen">
          <div className="w-2/5 size-full bg-black opacity-50" onClick={() => setIsOpen(false)} />
          <div className="bg-white w-3/5 flex flex-col gap-y-2.5 p-10">
            <div className="flex justify-end">
              <button type="button" className="text-right" onClick={() => setIsOpen(false)}>
                닫기
              </button>
            </div>
            <div className="font-bold">게임소개</div>
            <Link href="/rng-certificate" className="font-normal pl-4">
              RNG 인증 및 공정성
            </Link>
            <Link href="/notice" className="font-bold mt-2.5">
              공지사항
            </Link>
            <div className="font-bold mt-2.5">문의하기</div>
            <Link href="/faq" className="font-normal pl-4">
              자주 묻는 질문
            </Link>
            <Link href="/customer-inquiry" className="font-normal pl-4">
              1:1 문의
            </Link>
          </div>
        </div>
      ) : null}

      {/* PC */}
      <nav className="hidden md:flex sticky top-0 border-b border-gray-100 z-40 bg-white h-[70px] px-5 justify-between items-center">
        <div className="max-w-[1200px] mx-auto grid grid-cols-[100px_2fr_auto] gap-x-52">
          <Link href="/" className="p-2.5">
            <Image
              src="/images/logo.png" // public 폴더 기준 경로
              alt="아토즈포커 로고"
              width={80} // 원하는 너비
              height={80} // 원하는 높이
              priority // 초기 로드 최적화
            />
          </Link>
          <div className="grid gap-x-14 grid-cols-[120px_120px_120px]">
            <button type="button" className="p-2.5 font-bold" onMouseEnter={() => setIsOpen(true)}>
              게임소개
            </button>
            <button type="button" className="p-2.5 font-bold" onMouseEnter={() => setIsOpen(true)}>
              공지사항
            </button>
            <button type="button" className="p-2.5 font-bold" onMouseEnter={() => setIsOpen(true)}>
              문의하기
            </button>
          </div>
          <div className="w-48" />
        </div>
      </nav>
      {isOpen ? (
        <div
          className="hidden md:flex fixed top-[70px] bg-white h-[210px] w-full z-50 justify-between"
          onMouseLeave={(e) => {
            if (e.pageY > 280) {
              setIsOpen(false);
            }
          }}
        >
          <div className="max-w-[1200px] mx-auto grid grid-cols-[100px_2fr_auto] gap-x-52">
            <div className="p-2.5"></div>
            <div className="grid gap-x-14 grid-cols-[120px_120px_120px]">
              <Link href="/rng-certificate" className="p-2.5 font-bold text-center">
                게임소개
              </Link>
              <Link href="/notice" className="p-2.5 font-bold text-center">
                공지사항
              </Link>
              <div className="p-2.5 flex flex-col gap-y-2.5 items-center text-center">
                <Link href="/faq" className="font-bold">
                  자주 묻는 질문
                </Link>
                <Link href="/customer-inquiry" className="font-bold">
                  1:1 문의
                </Link>
              </div>
            </div>
            <div className="w-48" />
          </div>
        </div>
      ) : null}
    </>
  );
}
