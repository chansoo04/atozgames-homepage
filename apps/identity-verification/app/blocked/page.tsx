// app/blocked/page.tsx
"use client";
import { useEffect } from "react";

export default function BlockedPage({ searchParams }: { searchParams: { reason?: string } }) {
  useEffect(() => {
    try {
      window.close();
    } catch (_e) {
      // ignore
    }
  }, []);

  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-xl font-bold">접근이 차단되었습니다</h1>
      <p className="mt-3 text-sm text-gray-500">사유: {searchParams?.reason || "unknown"}</p>
      <p className="mt-6">이 페이지는 인게임(WebView)에서만 접근 가능합니다.</p>
    </main>
  );
}
