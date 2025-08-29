"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GAProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const AW_ID = process.env.NEXT_PUBLIC_GADS_ID;
    if (typeof window === "undefined" || !window.gtag) return;

    const path = pathname || "/";
    const qs = searchParams?.toString();
    const url = qs ? `${path}?${qs}` : path;

    // GA4: 명시적 SPA page_view
    if (GA_ID) {
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.origin + url,
        page_path: url,
      });
    }

    // Google Ads: SPA 경로 동기화(리마케팅/링커에 최신 경로 반영)
    if (AW_ID) {
      window.gtag("config", AW_ID, { page_path: url });
      // 필요 시 리마케팅용 커스텀 파라미터를 여기서 추가 가능
      // window.gtag('event', 'page_view', { send_to: AW_ID }); // 대안
    }
  }, [pathname, searchParams]);

  return null;
}
