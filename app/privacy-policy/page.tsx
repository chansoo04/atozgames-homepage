import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "아토즈포커의 개인정보 처리 방침을 안내하며, 사용자 개인정보 보호 정책을 제공합니다.",
  openGraph: {
    title: "개인정보처리방침",
    description:
      "아토즈포커의 개인정보 처리 방침을 안내하며, 사용자 개인정보 보호 정책을 제공합니다.",
    siteName: "아토즈포커 개인정보처리방침",
  },
};

export default function Page() {
  return (
    <>
      <div>개인정보 처리방침</div>
    </>
  );
}
