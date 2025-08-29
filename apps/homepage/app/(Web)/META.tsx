// app/providers/MetaPixelProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function MetaPixelProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (!window.fbq) return;

    // 초기 진입 시에는 layout의 기본 스니펫이 이미 PageView를 보냈으니 중복 방지
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }

    // URL 변경 감지 -> SPA PageView 전송
    const path = pathname || "/";
    const qs = searchParams?.toString();
    const url = qs ? `${path}?${qs}` : path;

    // 표준 이벤트: PageView
    window.fbq("track", "PageView");

    // 참고: 필요하다면 커스텀 파라미터를 추가할 수도 있습니다.
    // window.fbq('track', 'PageView', { page_path: url })
  }, [pathname, searchParams]);

  return null;
}
