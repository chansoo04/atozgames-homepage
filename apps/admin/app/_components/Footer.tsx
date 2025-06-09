"use client";
import Link from "next/link";
import Image from "next/image";
import useWindowSize from "app/_components/useWindowSize";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";

export default function Footer() {
  const { ratio } = useWindowSize();

  return (
    <>
      {/* 모바일(<640)에서만 보임 */}
      <footer
        className="flex w-full flex-col items-center bg-white desktop:hidden"
        style={{
          padding: mobileSizeCalc(20, ratio),
          paddingBottom: mobileSizeCalc(36, ratio),
        }}
      >
        <div
          className="flex"
          style={{
            paddingLeft: mobileSizeCalc(44, ratio),
            paddingRight: mobileSizeCalc(44, ratio),
          }}
        >
          <Link
            className="border-r border-gray-300 font-medium text-gray-500"
            href="/terms"
            style={{
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              fontSize: mobileSizeCalc(10, ratio),
              lineHeight: mobileSizeCalc(15, ratio),
            }}
          >
            이용약관
          </Link>
          <Link
            className="border-r border-gray-300 font-medium text-serve-light"
            href="/privacy-policy"
            style={{
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              fontSize: mobileSizeCalc(10, ratio),
              lineHeight: mobileSizeCalc(15, ratio),
            }}
          >
            개인정보 처리방침
          </Link>
          <Link
            className="font-medium text-gray-500"
            href="/operating-policy"
            style={{
              paddingLeft: mobileSizeCalc(16, ratio),
              paddingRight: mobileSizeCalc(16, ratio),
              fontSize: mobileSizeCalc(10, ratio),
              lineHeight: mobileSizeCalc(15, ratio),
            }}
          >
            운영정책
          </Link>
        </div>
        <Image
          src="/logo_black.png"
          alt="카피바라 로고"
          width={65}
          height={25}
          style={{
            width: mobileSizeCalc(65, ratio),
            height: mobileSizeCalc(25, ratio),
            marginTop: mobileSizeCalc(10, ratio),
          }}
        />
        <div
          className="font-normal text-gray-500"
          style={{
            fontSize: mobileSizeCalc(8, ratio),
            lineHeight: mobileSizeCalc(15, ratio),
          }}
        >
          ⓒ 2025 CAPYBARA Corp, All Rights Reserved
        </div>
      </footer>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer
        className="hidden desktop:flex desktop:w-full desktop:flex-col desktop:bg-[#16172D]"
        style={{
          paddingBottom: desktopSizeCalc(40, ratio),
          paddingTop: desktopSizeCalc(30, ratio),
        }}
      >
        <div
          className="desktop:mx-auto"
          style={{
            minWidth: desktopSizeCalc(1200, ratio),
          }}
        >
          <div className="desktop:flex desktop:items-center desktop:justify-between">
            <Image
              src="/logo_gray.png"
              alt="카피바라 로고"
              width={156}
              height={60}
              style={{
                width: desktopSizeCalc(156, ratio),
                height: desktopSizeCalc(60, ratio),
              }}
            />
            <div className="desktop:flex desktop:items-center ">
              <Link
                href="/terms"
                className="desktop:border-r desktop:border-gray-600 desktop:text-center desktop:font-semibold desktop:text-gray-400"
                style={{
                  paddingLeft: desktopSizeCalc(16, ratio),
                  paddingRight: desktopSizeCalc(16, ratio),
                  fontSize: desktopSizeCalc(16, ratio),
                  lineHeight: desktopSizeCalc(26, ratio),
                }}
              >
                이용약관
              </Link>
              <Link
                href="/privacy-policy"
                className="desktop:border-r desktop:border-gray-600 desktop:text-center desktop:font-semibold desktop:text-gray-400"
                style={{
                  paddingLeft: desktopSizeCalc(16, ratio),
                  paddingRight: desktopSizeCalc(16, ratio),
                  fontSize: desktopSizeCalc(16, ratio),
                  lineHeight: desktopSizeCalc(26, ratio),
                }}
              >
                개인정보 처리방침
              </Link>
              <Link
                href="/operating-policy"
                className="desktop:text-center desktop:font-semibold desktop:text-gray-400"
                style={{
                  paddingLeft: desktopSizeCalc(16, ratio),
                  paddingRight: desktopSizeCalc(16, ratio),
                  fontSize: desktopSizeCalc(16, ratio),
                  lineHeight: desktopSizeCalc(26, ratio),
                }}
              >
                운영정책
              </Link>
            </div>
          </div>
          <div
            className="desktop:flex desktop:flex-col"
            style={{
              rowGap: desktopSizeCalc(10, ratio),
              marginTop: desktopSizeCalc(10, ratio),
            }}
          >
            <div
              className="desktop:font-bold desktop:text-gray-400"
              style={{
                fontSize: desktopSizeCalc(20, ratio),
                lineHeight: desktopSizeCalc(30, ratio),
              }}
            >
              카피바라 주식회사
            </div>
            <div
              className="desktop:font-normal desktop:text-gray-600"
              style={{
                fontSize: desktopSizeCalc(16, ratio),
                lineHeight: desktopSizeCalc(16, ratio),
              }}
            >
              서울특별시 강서구 공항대로 59길 8, 415호 (등촌동, 우촌빌딩)
            </div>
            <div
              className="desktop:font-normal desktop:text-gray-600"
              style={{
                fontSize: desktopSizeCalc(16, ratio),
                lineHeight: desktopSizeCalc(16, ratio),
              }}
            >
              사업자 등록번호 564-81-03136
            </div>
            <div
              className="desktop:font-normal desktop:text-gray-600"
              style={{
                fontSize: desktopSizeCalc(16, ratio),
                lineHeight: desktopSizeCalc(16, ratio),
              }}
            >
              통신판매업신고번호 2024-서울강서-3600호
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
