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
    <div className="bg-white text-black px-5 py-10 md:py-20 md:px-20">
      {/* 모바일 및 태블릿 버전 */}
      <div className="md:hidden flex flex-col space-y-10">
        {/* 텍스트 영역 */}
        <div>
          <h1 className="text-2xl font-bold mb-4">이토브 포커는</h1>
          <p className="mb-4">
            RNG(난수 생성기) 인증을 받았으며, 이를 통해 게임 내 모든 카드 배분과 결과가 완전한
            무작위성에 따라 이루어짐을 공식적으로 보증합니다. RNG 인증은 독립적인 인증 기관에서
            진행하는 검증 절차를 통해, 게임이 편향 없이 공정하게 운영되고 있음을 증명합니다.
          </p>
          <p className="mb-4">
            RNG(난수 생성기) 시스템은 수학적 알고리즘에 의한 완전한 무작위성을 바탕으로 카드가
            배분되며, 이는 어떠한 외부 개입이나 조작 없이 자동으로 이루어집니다. 이로 인해, 모든
            유저는 동일한 조건과 공정한 기회 아래에서 게임을 즐기실 수 있습니다.
          </p>
          <p className="mb-4">
            더욱이 「이토브 포커」는 공정성에 더욱 집중하였습니다. 포커 게임에서 가장 중요한 것은
            특수 로직이 따로 존재하지 않으며, 게임을 이용하는 어떤 누구에게도 편향되지 않은 공정한
            패 분사가 가장 중요하다는 것을 잘 알고 있습니다.
          </p>
          <p className="mb-4">
            따라서 「이토브 포커」는 RNG 인증 외에도, 족보를 완성함에 그 어떤 로직이 없으며 패를
            분사함에 있어서 100% 랜덤성을 나타낸다는 것을 증명하기 위해 실제 프로그램 코드를 아래와
            같이 기재합니다.
          </p>
          <p>
            해당 코드는 오픈소스로서 그 누구라도 사용하여 공정함을 검토하실 수 있습니다. 단, 코드를
            검토하는데 어려움이 있는 유저 또한 있을 수 있기에 이 코드를 이용하여 1,000,000번의 시행
            결과 아래에 발생 빈도를 기재합니다(소수점 두번째에서 반올림).
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
          <h1 className="text-3xl font-bold mb-6">이토브 포커는</h1>
          <p className="mb-4">
            RNG(난수 생성기) 인증을 받았으며, 이를 통해 게임 내 모든 카드 배분과 결과가 완전한
            무작위성에 따라 이루어짐을 공식적으로 보증합니다. RNG 인증은 독립적인 인증 기관에서
            진행하는 검증 절차를 통해, 게임이 편향 없이 공정하게 운영되고 있음을 증명합니다.
          </p>
          <p className="mb-4">
            RNG(난수 생성기) 시스템은 수학적 알고리즘에 의한 완전한 무작위성을 바탕으로 카드가
            배분되며, 이는 어떠한 외부 개입이나 조작 없이 자동으로 이루어집니다. 이로 인해, 모든
            유저는 동일한 조건과 공정한 기회 아래에서 게임을 즐기실 수 있습니다.
          </p>
          <p className="mb-4">
            더욱이 「이토브 포커」는 공정성에 더욱 집중하였습니다. 포커 게임에서 가장 중요한 것은
            특수 로직이 따로 존재하지 않으며, 게임을 이용하는 어떤 누구에게도 편향되지 않은 공정한
            패 분사가 가장 중요하다는 것을 잘 알고 있습니다.
          </p>
          <p className="mb-4">
            따라서 「이토브 포커」는 RNG 인증 외에도, 족보를 완성함에 그 어떤 로직이 없으며 패를
            분사함에 있어서 100% 랜덤성을 나타낸다는 것을 증명하기 위해 실제 프로그램 코드를 아래와
            같이 기재합니다.
          </p>
          <p>
            해당 코드는 오픈소스로서 그 누구라도 사용하여 공정함을 검토하실 수 있습니다. 단, 코드를
            검토하는데 어려움이 있는 유저 또한 있을 수 있기에 이 코드를 이용하여 1,000,000번의 시행
            결과 아래에 발생 빈도를 기재합니다(소수점 두번째에서 반올림).
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
