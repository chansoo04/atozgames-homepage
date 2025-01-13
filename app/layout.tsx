import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "components/Header";

export const metadata: Metadata = {
  title: "Responsive Next.js App",
  description: "A responsive Next.js app with mobile, tablet, and desktop layouts.",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    userScalable: true,
};

export default function RootLayout({ children, params }: { children: React.ReactNode, params: { pathname: string } }) {
  const excludedRoutes = ["/login", "/signup"]; // Header를 제외할 경로
  const showHeader = !excludedRoutes.includes(params.pathname); // Header 렌더링 여부 판별

  return (
    <html lang="ko">
    <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link
            href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;700&display=swap"
            rel="stylesheet"
        />
    </head>
    <body className="bg-gray-100 text-gray-900 font-pretendard">
      {showHeader && <Header />}
      {children}
    </body>
    </html>
  );
}
