// lib/fbpixel.ts
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function fbqTrack(event: string, params?: Record<string, any>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

// 예시: 회원가입 완료
// fbqTrack('CompleteRegistration')

// 예시: 결제 완료
// fbqTrack('Purchase', { value: 12900, currency: 'KRW', contents: [{id:'chip_12900', quantity:1}], content_type: 'product' })
