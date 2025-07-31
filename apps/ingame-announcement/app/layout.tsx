import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="bg-white">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="flex w-full justify-center px-0 pt-0 font-sans lining-nums text-gray-900 outline-none desktop:min-h-screen">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
