import ssr from "lib/fetcher/ssr";
import Tabs from "./Tabs";
import type { Metadata } from "next";

// TODO: API 변경하기

export const metadata: Metadata = {
  metadataBase: new URL("https://www.atozgames.net/faq"),
  title: "아토즈포커 - 자주 묻는 질문",
  openGraph: {
    type: "website",
    title: "아토즈포커 - 자주 묻는 질문",
    description:
      "아토즈포커에 대한 문의사항이 있으신가요? 자주 묻는 질문을 통해 궁금증을 해결해보세요",
    url: "https://www.atozgames.net/faq",
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
    "아토즈포커에 대한 문의사항이 있으신가요? 자주 묻는 질문을 통해 궁금증을 해결해보세요",
};

async function getPageData() {
  return await ssr.get("faq").json();
}

export default async function Page() {
  const faqs: any = await getPageData();

  return <Tabs faqs={faqs.faq} />;
}
