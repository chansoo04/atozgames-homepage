import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "공지사항",
  description: "아토즈포커의 최신 이벤트와 중요 이슈를 확인할 수 있는 게시판입니다.",
  openGraph: {
    title: "공지사항",
    description: "아토즈포커의 최신 이벤트와 중요 이슈를 확인할 수 있는 게시판입니다.",
    siteName: "아토즈포커 공지사항",
  },
};

export default function Page() {
  return (
    <>
      <div>공지사항</div>
    </>
  );
}
