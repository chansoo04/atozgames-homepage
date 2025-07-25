import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";
import { AuthProvider } from "./AuthProvider";
import ClarityTracker from "./ClarityTracker";
import { gmarketSans } from "app/fonts/gmarket";

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
        <AuthProvider>
          <ClientProviders>{children}</ClientProviders>
          <ClarityTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
