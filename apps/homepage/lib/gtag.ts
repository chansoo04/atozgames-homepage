// lib/gtag.ts
export const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

type Gtag = {
  (cmd: "event", name: string, params?: Record<string, any>): void;
};

export const gaEvent: Gtag = (cmd, name, params = {}) => {
  if (typeof window === "undefined") return;
  if (!window.gtag) return;
  window.gtag(cmd, name, params);
};

// 사용 예시:
// gaEvent('event', 'select_content', { content_type: 'banner', content_id: 'home_top' })
