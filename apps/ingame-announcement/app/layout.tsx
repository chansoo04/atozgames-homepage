import "./globals.css";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // className="bg-amber-400"
      style={{
        backgroundImage: `url('/background.png')`,
        backgroundSize: "100% auto", // 가로 기준 꽉 채움
        backgroundPosition: "center center", // 세로 중앙 정렬
        backgroundRepeat: "no-repeat",
      }}
    >
      <body
        className="bg-red-300"
        style={{
          margin: "0 auto",
          // width: "100%",
          // height: "100%",
        }}
      >
        <div className="bg-white text-primary">asdfasdf</div>
        {/*<ClientProviders>{children}</ClientProviders>*/}
      </body>
    </html>
  );
}
