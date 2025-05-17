import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <>
      {/* 모바일(<640)에서만 보임 */}
      <footer className="flex w-full flex-col items-center bg-white p-5 pb-9 desktop:hidden">
        <div className="flex px-11">
          <Link
            className="border-r border-gray-300 px-4 text-2xs font-medium text-gray-500"
            href="/terms"
          >
            이용약관
          </Link>
          <Link
            className="border-r border-gray-300 px-4 text-2xs font-medium text-serve-light"
            href="/privacy-policy"
          >
            개인정보 처리방침
          </Link>
          <Link className="px-4 text-2xs font-medium text-gray-500" href="/operating-policy">
            운영정책
          </Link>
        </div>
        <Image
          src="/logo_black.png"
          className="mt-2.5"
          alt="카피바라 로고"
          width="65"
          height="25"
        />
        <div className="text-3xs font-normal text-gray-500">
          ⓒ 2025 CAPYBARA Corp, All Rights Reserved
        </div>
      </footer>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer className="hidden desktop:flex desktop:w-full desktop:flex-col desktop:bg-[#16172D] desktop:pb-10 desktop:pt-[30px]">
        <div className="desktop:mx-auto desktop:min-w-[1024px]">
          <div className="desktop:flex desktop:items-center desktop:justify-between">
            <Image src="/logo_gray.png" alt="카피바라 로고" width={156} height={60} />
            <div className="desktop:flex desktop:items-center ">
              <Link
                href="/terms"
                className="desktop:border-r desktop:border-gray-600 desktop:px-4 desktop:text-center desktop:text-base desktop:font-semibold desktop:text-gray-400"
              >
                이용약관
              </Link>
              <Link
                href="/privacy-policy"
                className="desktop:border-r desktop:border-gray-600 desktop:px-4 desktop:text-center desktop:text-base desktop:font-semibold desktop:text-gray-400"
              >
                개인정보 처리방침
              </Link>
              <Link
                href="/operating-policy"
                className="desktop:px-4 desktop:text-center desktop:text-base desktop:font-semibold desktop:text-gray-400"
              >
                운영정책
              </Link>
            </div>
          </div>
          <div className="gap-y-2.5 desktop:mt-2.5 desktop:flex desktop:flex-col">
            <div className="desktop:text-xl desktop:font-bold desktop:text-gray-400">
              카피바라 주식회사
            </div>
            <div className="desktop:text-base desktop:font-normal desktop:text-gray-600">
              서울특별시 강서구 공항대로 59길 8, 415호 (등촌동, 우촌빌딩)
            </div>
            <div className="desktop:text-base desktop:font-normal desktop:text-gray-600">
              사업자 등록번호 564-81-03136
            </div>
            <div className="desktop:text-base desktop:font-normal desktop:text-gray-600">
              통신판매업신고번호 2024-서울강서-3600호
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
