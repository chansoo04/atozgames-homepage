"use client";

export default function Header() {

  return (
    <>
      {/* 모바일 */}
      <div className="block sm:hidden text-lg font-bold text-blue-500">
        모바일 헤더
      </div>

      {/* 태블릿 */}
      <div className="hidden sm:block md:hidden text-xl font-bold text-green-500">
        태블릿 헤더
      </div>

      {/* PC */}
      <div className="hidden md:block text-2xl font-bold text-red-500">
        PC 헤더
      </div>
    </>
  )
}