import Script from "next/script";
import "./global.css";
import Provider from "./provider";
import { AuthProvider } from "./AuthProvider";
import RouteChangeListener from "./RouteChangeListener";

export default async function layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <Script
          async
          type="text/javascript"
          // TODO [work] : dev, ops 환경에 따라 변경
          src={
            process.env.NODE_ENV === "development"
              ? "https://scert.mobile-ok.com/resources/js/index.js"
              : "https://cert.mobile-ok.com/resources/js/index.js"
          }
          strategy="beforeInteractive"
        ></Script>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta id="status-bar" name="theme-color" content="b9c2e2" />
      </head>
      <body className="flex w-full bg-[#b9c2e2]">
        <RouteChangeListener />
        <AuthProvider>
          <Provider>{children}</Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
