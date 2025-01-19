import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "자주 묻는 질문(FAQ)과 답변을 통해 아토즈포커 관련 정보를 쉽게 확인하세요.",
  openGraph: {
    title: "자주 묻는 질문",
    description: "자주 묻는 질문(FAQ)과 답변을 통해 아토즈포커 관련 정보를 쉽게 확인하세요.",
    siteName: "아토즈포커 자주 묻는 질문",
  },
};

export default function Page() {
  return (
    <>
      <div>FAQ</div>
    </>
  );
}
