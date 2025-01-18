"use client";
import Link from "next/link";

/*
1. 카피바라 사업자번호: 564-81-03136
2. 대표 전화번호(CS): 010-
3. 주소지: 서울특별시 강서구 공항대로 59길 8, 415호(등촌동, 우현빌딩)
4. 대표이사: 오우열
5. 이메일 주소: atoz@atozgames.net
6. 통신판매업신고번호: 제 2024-서울강서-3600 호
* */

export default function Footer() {
  return (
    <>
      {/* 모바일 푸터 */}
      <footer className="md:hidden bg-white py-10 px-5">
        <div>모바일 푸터</div>
        <div className="flex gap-x-5">
          <Link href="/terms-of-use">이용약관</Link>
          <Link href="/privacy-policy">개인정보 처리방침</Link>
          <Link href="/youth-protection-policy">청소년 보호정책</Link>
        </div>
      </footer>

      {/* PC 푸터 */}
      <footer className="hidden md:flex bg-white">
        <div className="max-w-[1200px] mx-auto py-10">
          <div>PC 푸터</div>
          <div className="flex gap-x-5">
            <Link href="/terms-of-use" className="block">
              이용약관
            </Link>
            <Link href="/privacy-policy">개인정보 처리방침</Link>
            <Link href="/youth-protection-policy">청소년 보호정책</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
