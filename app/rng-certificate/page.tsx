import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "RNG 인증 및 공정성",
  description:
    "순수한 랜덤 기반으로 설계되어, 패 분사와 로직에 외부 개입이 일절 없이 공정성을 보장합니다.",
  openGraph: {
    title: "RNG 인증 및 공정성",
    description:
      "순수한 랜덤 기반으로 설계되어, 패 분사와 로직에 외부 개입이 일절 없이 공정성을 보장합니다.",
    siteName: "아토즈포커 공정성",
  },
};

export default function Page() {
  return (
    <>
      <div>RNG 인증</div>
    </>
  );
}
