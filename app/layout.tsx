import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "components/Header";
import Footer from "components/Footer";

export const metadata: Metadata = {
  title: "아토즈포커 - 공정한 포커 플랫폼",
  description: "아토즈포커는 보안과 신뢰, 공정성을 최우선으로 하는 온라인 포커 플랫폼입니다.",
  keywords: "games, announcements, contact, game overview, support",
  openGraph: {
    title: "아토즈포커 - 공정한 포커 플랫폼",
    description: "아토즈포커는 보안과 신뢰, 공정성을 최우선으로 하는 온라인 포커 플랫폼입니다.",
    siteName: "아토즈포커",
    url: "https://example.com",
    images: [
      {
        url: "https://example.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Website",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { pathname: string };
}) {
  const excludedHeaderRoutes = ["/login", "/signup"]; // Header를 제외할 경로
  const showHeader = !excludedHeaderRoutes.includes(params.pathname); // Header 렌더링 여부 판별

  const excludedFooterRoutes = ["/login", "/signup"]; // Footer를 제외할 경로
  const showFooter = !excludedFooterRoutes.includes(params.pathname); // Footer 렌더링 여부 판별

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-100 text-gray-900 font-pretendard">
        {showHeader && <Header />}
        {children}
        {showFooter && <Footer />}
      </body>
    </html>
  );
}
