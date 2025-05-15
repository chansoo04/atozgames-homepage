import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <>
      {/* 모바일(<640)에서만 보임 */}
      <footer className="flex w-full flex-col items-center bg-white p-5 pb-9 tablet:hidden desktop:hidden">
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

      {/* 태블릿(≥640 & <1024)에서만 보임 */}
      <footer className="hidden tablet:block desktop:hidden">태블릿</footer>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer className="hidden tablet:hidden desktop:block">PC</footer>
    </>
  );
}
