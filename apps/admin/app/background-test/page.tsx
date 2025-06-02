// app/page.tsx
"use client";

import React from "react";

export default function HomePage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* 배경 동영상 */}
      <video
        className="fixed left-0 top-0 size-full object-cover"
        src="/test.mp4"
        autoPlay
        muted
        loop
      />

      {/* 배경 위에 올라가는 실제 콘텐츠 */}
      <div className="relative z-10 flex size-full flex-col items-center justify-center bg-black bg-opacity-30 text-white">
        <h1 className="mb-4 text-4xl font-bold">환영합니다</h1>
        <p className="text-lg">이곳은 전체 화면 배경 영상 예제입니다.</p>
      </div>
    </div>
  );
}
