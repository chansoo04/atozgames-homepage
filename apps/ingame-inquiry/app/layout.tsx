import "./globals.css";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";
import { AuthProvider } from "./AuthProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// TODO: 로그인 처리해야함.. HOW?

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // className="bg-amber-400"
      style={{
        // backgroundImage: `url('/background.png')`,
        backgroundImage: `url('/background_real.png')`,
        backgroundSize: "100% auto", // 가로 기준 꽉 채움
        backgroundPosition: "center center", // 세로 중앙 정렬
        backgroundRepeat: "no-repeat",
        overflowY: "hidden",
        backgroundColor: "black",
      }}
    >
      <body className="h-full bg-transparent">
        <AuthProvider>
          <ClientProviders>{children}</ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
