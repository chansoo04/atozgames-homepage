import ssr from "lib/fetcher/ssr";
import type { Metadata } from "next";
import ClientPage from "./ClientPage";

// TODO: 페이지넹션 만들기

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atozgames.net/announcement"),
  title: "아토즈포커 - 공지사항",
  openGraph: {
    type: "website",
    title: "아토즈포커 - 공지사항",
    description:
      "아토즈포커의 소식을 가장 빠르게 확인하실 수 있습니다. 게임의 업데이트 내용이나 이벤트 등 다양한 소식을 만나보세요.",
    url: "https://www.atozgames.net/announcement",
    siteName: "아토즈포커",
    // images: "https://storage.googleapis.com/static.carepet.io/cvsc/cvsc_opengraph.png",
    // TODO: 이미지 제작 후 받기
  },
  category: "game",
  keywords: ["아토즈포커", "모바일포커", "텍사스홀덤", "로우바둑이"],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  description:
    "아토즈포커의 소식을 가장 빠르게 확인하실 수 있습니다. 게임의 업데이트 내용이나 이벤트 등 다양한 소식을 만나보세요.",
};

async function getPageData() {
  return await ssr.get("announcement").json();
}

export default async function Page() {
  const announcements: any = await getPageData();

  return <ClientPage announcements={announcements?.announcement ?? []} />;
}
