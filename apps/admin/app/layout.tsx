import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ClientProviders from "./ClientProvider";
import ClarityTracker from "./ClarityTracker";

export const metadata: Metadata = {
  title: "WYC ADMIN",
  description: "",
  robots: "noindex",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "1400",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="bg-white">
      <body className="flex min-h-screen w-full justify-center px-0 pt-0 font-sans lining-nums text-gray-900 outline-none">
        <ClientProviders>{children}</ClientProviders>
        <ClarityTracker />
      </body>
    </html>
  );
}
