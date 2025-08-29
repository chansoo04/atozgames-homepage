import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "app/ClientProvider";
import { AuthProvider } from "app/AuthProvider";
import ClarityTracker from "./ClarityTracker";
import GA from "./GA";
import MetaPixelProvider from "./META";
import { gmarketSans } from "app/fonts/gmarket";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atozgames.net"),
  title: "아토즈포커 - 빠르고 스릴있는 포커게임",
  openGraph: {
    type: "website",
    title: "아토즈포커 - 빠르고 스릴있는 포커게임",
    description:
      "아토즈포커에서 공정성을 기반으로 빠른 게임 진행과 높은 배팅 금액으로 스릴있는 텍사스홀덤과 바둑이 게임을 즐겨보세요.",
    url: "https://www.atozgames.net",
    siteName: "아토즈포커",
    // images: "https://storage.googleapis.com/static.carepet.io/cvsc/cvsc_og_v2.png",
    // TODO: 이미지 제작 후 받기
  },
  category: "game",
  keywords: ["아토즈포커", "모바일포커", "텍사스홀덤", "로우바둑이"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description:
    "아토즈포커에서 공정성을 기반으로 빠른 게임 진행과 높은 배팅 금액으로 스릴있는 텍사스홀덤과 바둑이 게임을 즐겨보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const AW_ID = process.env.NEXT_PUBLIC_GADS_ID;
  const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // noscript용 픽셀 이미지 (JS 차단 사용자 대비)
  const noscript = PIXEL_ID
    ? `<img height="1" width="1" style="display:none"
         src="https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1" />`
    : "";

  return (
    <html lang="ko" className={`bg-white ${gmarketSans.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="a2hqnOJ17XPUYdKuy6Xl5GNutCzygONWX_zGD1hUouU"
        />
        <meta name="naver-site-verification" content="5dd4b35471d6a5a94c12da502d53a617fd69dd82" />
      </head>
      <body className="flex min-h-dvh w-full justify-center px-0 pt-0 font-sans lining-nums text-gray-900 outline-none desktop:min-h-screen">
        {/* GA4: gtag.js */}
        {(GA_ID || AW_ID) && (
          <>
            <Script
              id="gtag-src"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID || AW_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-base" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                // SPA 중복 방지: 초기 자동 page_view 끔
                ${GA_ID ? `gtag('config', '${GA_ID}', { send_page_view: false });` : ""}
                ${AW_ID ? `gtag('config', '${AW_ID}');` : ""}
              `}
            </Script>
          </>
        )}
        {/* META PIXEL */}
        {PIXEL_ID && (
          <>
            {/* Meta Pixel 기본 스니펫 (공식) */}
            <Script id="fb-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s){
                  if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>

            {/* JS 꺼진 사용자 대비 noscript 픽셀 */}
            <noscript dangerouslySetInnerHTML={{ __html: noscript }} />
          </>
        )}
        {/* 라우트 변경 감지 후 수동 page_view 전송 */}
        <GA />
        {/* SPA 라우팅 시 PageView 추가 발화 */}
        <MetaPixelProvider />

        <AuthProvider>
          <ClientProviders>{children}</ClientProviders>
          <ClarityTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
