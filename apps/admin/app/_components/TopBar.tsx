"use client";
import "./topbar.css";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Transition } from "@headlessui/react";

export default function TopBar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Transition
        show={!isOpen}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="w-full desktop:hidden"
      >
        <footer className="absolute top-0 flex h-[60px] w-full items-center gap-x-2.5 bg-white px-5 py-3 desktop:hidden">
          <button type="button" onClick={() => setIsOpen(true)}>
            <Image src="/menu.png" alt="메뉴" width={30} height={30} />
          </button>
          <Link href="/">
            <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />
          </Link>
        </footer>
      </Transition>

      <Transition
        show={isOpen}
        enter="transition transform duration-300 ease-out"
        enterFrom="-translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition transform duration-200 ease-in"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-full opacity-0"
        className="tablet:hidden desktop:hidden"
      >
        <div className="absolute inset-0 z-50 flex h-screen flex-col overflow-x-hidden bg-white desktop:hidden">
          <div className="flex h-[60px] w-full items-center justify-center px-5">
            <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />
            <button type="button" onClick={() => setIsOpen(false)}>
              <Image
                src="/close.png"
                alt="닫기"
                width={30}
                height={30}
                className="absolute left-5 top-[15px]"
              />
            </button>
          </div>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">
              <span className="text-sm font-semibold leading-relaxed text-gray-600">게임소개</span>
              <Image
                src="/dropdown.png"
                className="icon size-4"
                width={16}
                height={16}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/rng-certificate"
              className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"
            >
              RNG 인증 및 공정성
            </Link>
          </details>
          <Link
            href="/announcement"
            className="flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"
          >
            공지사항
          </Link>
          <details open className="w-full border-b-[0.5px] border-gray-300">
            <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">
              <span className="text-sm font-semibold leading-relaxed text-gray-600">문의하기</span>
              <Image
                src="/dropdown.png"
                className="icon size-4"
                width={16}
                height={16}
                alt="펼치기"
              />
            </summary>
            <Link
              href="/faq"
              className="ml-5 flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"
            >
              자주 묻는 질문
            </Link>
            <Link
              href="/inquiry"
              className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"
            >
              1:1 문의
            </Link>
          </details>
        </div>
      </Transition>

      {/* 모바일(<640)에서만 보임 */}
      {/*{!isOpen ? (*/}
      {/*  <footer className="absolute top-0 flex h-[60px] w-full items-center gap-x-2.5 bg-white px-5 py-3 tablet:hidden desktop:hidden">*/}
      {/*    <button type="button" onClick={() => setIsOpen(true)}>*/}
      {/*      <Image src="/menu.png" alt="메뉴" width={30} height={30} />*/}
      {/*    </button>*/}
      {/*    <Link href="/">*/}
      {/*      <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />*/}
      {/*    </Link>*/}
      {/*  </footer>*/}
      {/*) : (*/}
      {/*  <div className="absolute top-0 z-50 flex h-screen w-full flex-col bg-white tablet:hidden desktop:hidden">*/}
      {/*    <div className="flex h-[60px] w-full items-center justify-center px-5">*/}
      {/*      <Image src="/logo_black.png" alt="카피바라 로고" width={91} height={35} />*/}
      {/*      <button type="button" onClick={() => setIsOpen(false)}>*/}
      {/*        <Image*/}
      {/*          src="/close.png"*/}
      {/*          alt="닫기"*/}
      {/*          width={30}*/}
      {/*          height={30}*/}
      {/*          className="absolute left-5 top-[15px]"*/}
      {/*        />*/}
      {/*      </button>*/}
      {/*    </div>*/}
      {/*    <details open className="w-full border-b-[0.5px] border-gray-300">*/}
      {/*      <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">*/}
      {/*        <span className="text-sm font-semibold leading-relaxed text-gray-600">게임소개</span>*/}
      {/*        <Image*/}
      {/*          src="/dropdown.png"*/}
      {/*          className="icon size-4"*/}
      {/*          width={16}*/}
      {/*          height={16}*/}
      {/*          alt="펼치기"*/}
      {/*        />*/}
      {/*      </summary>*/}
      {/*      <Link*/}
      {/*        href="/rng-certificate"*/}
      {/*        className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"*/}
      {/*      >*/}
      {/*        RNG 인증 및 공정성*/}
      {/*      </Link>*/}
      {/*    </details>*/}
      {/*    <Link*/}
      {/*      href="/announcement"*/}
      {/*      className="flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"*/}
      {/*    >*/}
      {/*      공지사항*/}
      {/*    </Link>*/}
      {/*    <details open className="w-full border-b-[0.5px] border-gray-300">*/}
      {/*      <summary className="flex h-[50px] w-full items-center justify-between px-5 py-[15px]">*/}
      {/*        <span className="text-sm font-semibold leading-relaxed text-gray-600">문의하기</span>*/}
      {/*        <Image*/}
      {/*          src="/dropdown.png"*/}
      {/*          className="icon size-4"*/}
      {/*          width={16}*/}
      {/*          height={16}*/}
      {/*          alt="펼치기"*/}
      {/*        />*/}
      {/*      </summary>*/}
      {/*      <Link*/}
      {/*        href="/faq"*/}
      {/*        className="ml-5 flex h-[50px] w-full items-center border-b-[0.5px] border-gray-300 pl-5 text-sm font-semibold leading-relaxed text-gray-600"*/}
      {/*      >*/}
      {/*        자주 묻는 질문*/}
      {/*      </Link>*/}
      {/*      <Link*/}
      {/*        href="/inquiry"*/}
      {/*        className="flex h-[50px] w-full items-center pl-10 text-sm font-semibold leading-relaxed text-gray-600"*/}
      {/*      >*/}
      {/*        1:1 문의*/}
      {/*      </Link>*/}
      {/*    </details>*/}
      {/*  </div>*/}
      {/*)}*/}

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer className="tablet:hidden hidden desktop:block">PC</footer>
    </>
  );
}
