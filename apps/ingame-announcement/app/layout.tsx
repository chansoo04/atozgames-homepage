import "./globals.css";
import type { Viewport, Metadata } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // appleWebAppCapable: true,
  // appleWebAppStatusBarStyle: "black-translucent",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <body
        className=""
        style={{
          margin: "0 auto",
          width: "100%",
          height: "100%",
        }}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
