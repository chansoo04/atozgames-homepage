"use client";

export default function Footer() {
  return (
    <>
      {/* 모바일 푸터 */}
      <footer className="md:hidden bg-white">모바일 푸터</footer>

      {/* PC 푸터 */}
      <footer className="hidden md:flex bg-white">
        <div className="max-w-[1200px] mx-auto py-10">PC 푸터</div>
      </footer>
    </>
  );
}
