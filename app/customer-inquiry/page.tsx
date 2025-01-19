import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "1:1 문의",
  description: "아토즈포커 유저가 고객센터에 자유롭게 신고, 문의, 질문을 할 수 있는 페이지입니다.",
  openGraph: {
    title: "1:1 문의",
    description:
      "아토즈포커 유저가 고객센터에 자유롭게 신고, 문의, 질문을 할 수 있는 페이지입니다.",
    siteName: "아토즈포커 1:1 문의",
  },
};

export default function Page() {
  return (
    <>
      <div>1:1 문의</div>
    </>
  );
}
