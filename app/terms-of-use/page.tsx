import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "이용약관",
  description: "아토즈포커의 이용약관을 확인하고, 서비스 이용에 필요한 정보를 제공합니다.",
  openGraph: {
    title: "이용약관",
    description: "아토즈포커의 이용약관을 확인하고, 서비스 이용에 필요한 정보를 제공합니다.",
    siteName: "아토즈포커 이용약관",
  },
};

export default function Page() {
  return (
    <>
      <div>이용약관</div>
    </>
  );
}
