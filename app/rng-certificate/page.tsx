import type { Metadata } from "next";
import Image from "next/image";

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

export default function RNGCertificatePage() {
  return (
    <div className="bg-white text-gray-900 px-5 py-10 md:py-20 md:px-20">
      {/* 모바일 및 태블릿 버전 */}
      <div className="md:hidden flex flex-col space-y-10">
        {/* 텍스트 영역 */}
        <div>
          <h1 className="text-2xl font-bold mb-4">2ACE 포커는</h1>
          <p className="mb-4">
            BMM Testlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은 게임의
            데이터를 추출하고 분석하여, 외부적인 개입이 없는 공정한 플레이를 검증하는 국제 공식
            인증입니다.
          </p>
          <p className="mb-4">
            <span className="font-bold">BMM Testlabs</span>는 세계에서 가장 권위있는 독립 게임
            테스트 연구소 중 하나입니다. 이곳은 30년 넘게 게임 산업 발전을 위해 헌신한 연구소입니다.
          </p>
          <p className="mb-4">
            2ACE 포커의 모든 콘텐츠는 적절한 기술 표준과 규칙을 따르며, 공정성과 신뢰를 최우선으로
            합니다.
          </p>
        </div>
        {/* 이미지 영역 */}
        <div>
          <Image
            src="/images/rng-certificate.png"
            alt="RNG 인증서"
            width={600}
            height={800}
            className="w-full rounded shadow-md"
          />
        </div>
      </div>

      {/* PC 버전 */}
      <div className="hidden md:flex items-start justify-between space-x-10">
        {/* 텍스트 영역 */}
        <div className="w-1/2">
          <h1 className="text-3xl font-bold mb-6">2ACE 포커는</h1>
          <p className="mb-4">
            BMM Testlabs의 RNG(Random Number Generator) 인증을 받았습니다. RNG 인증은 게임의
            데이터를 추출하고 분석하여, 외부적인 개입이 없는 공정한 플레이를 검증하는 국제 공식
            인증입니다.
          </p>
          <p className="mb-4">
            <span className="font-bold">BMM Testlabs</span>는 세계에서 가장 권위있는 독립 게임
            테스트 연구소 중 하나입니다. 이곳은 30년 넘게 게임 산업 발전을 위해 헌신한 연구소입니다.
          </p>
          <p className="mb-4">
            2ACE 포커의 모든 콘텐츠는 적절한 기술 표준과 규칙을 따르며, 공정성과 신뢰를 최우선으로
            합니다.
          </p>
        </div>

        {/* 이미지 영역 */}
        <div className="w-1/2">
          <Image
            src="/images/rng-certificate.png"
            alt="RNG 인증서"
            width={600}
            height={800}
            className="w-full rounded shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
