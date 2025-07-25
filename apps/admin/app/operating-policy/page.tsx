"use client";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import useWindowSize from "app/_components/useWindowSize";

export default function Page() {
  const { ratio } = useWindowSize();

  return (
    <main className="relative w-full desktop:bg-black">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex flex-col items-center desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
          minHeight: mobileSizeCalc(783, ratio),
          paddingBottom: mobileSizeCalc(40, ratio),
          paddingTop: mobileSizeCalc(92, ratio),
        }}
      >
        <TopBar />
        <h1
          className="font-bold text-gray-700"
          style={{
            fontSize: mobileSizeCalc(18, ratio),
            lineHeight: mobileSizeCalc(26, ratio),
          }}
        >
          운영정책
        </h1>
        <div
          className="w-full"
          style={{
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
          }}
        >
          <div
            className="flex w-full flex-col whitespace-pre-line rounded-[20px] bg-gray-100 font-normal text-gray-700"
            style={{
              marginTop: mobileSizeCalc(20, ratio),
              paddingLeft: mobileSizeCalc(20, ratio),
              paddingRight: mobileSizeCalc(20, ratio),
              paddingBottom: mobileSizeCalc(30, ratio),
              paddingTop: mobileSizeCalc(20, ratio),
              fontSize: mobileSizeCalc(14, ratio),
              lineHeight: mobileSizeCalc(20, ratio),
            }}
          >
            {operatingPolicy}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative mx-auto hidden desktop:block desktop:aspect-[1920/2086] desktop:w-[1920px] desktop:min-w-[1920px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div
          className="desktop:flex desktop:flex-col desktop:items-center"
          style={{
            paddingTop: desktopSizeCalc(240, ratio),
          }}
        >
          <h1
            className="desktop:text-center desktop:font-bold desktop:text-white"
            style={{
              fontSize: desktopSizeCalc(50, ratio),
              lineHeight: desktopSizeCalc(50, ratio),
            }}
          >
            운영정책
          </h1>
          <div
            className="desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70"
            style={{
              width: desktopSizeCalc(1200, ratio),
              marginBottom: desktopSizeCalc(208, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
              paddingTop: desktopSizeCalc(20, ratio),
              paddingBottom: desktopSizeCalc(20, ratio),
            }}
          >
            <div
              className="whitespace-pre-line font-normal text-white"
              style={{
                paddingBottom: desktopSizeCalc(80, ratio),
                paddingTop: desktopSizeCalc(40, ratio),
                fontSize: desktopSizeCalc(18, ratio),
                lineHeight: desktopSizeCalc(34, ratio),
              }}
            >
              {operatingPolicy}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const operatingPolicy = `
제 1조 : 목적
본 운영정책은 카피바라 주식회사가 제공하는 게임 및 관련 서비스를 이용하는 회원이 반드시 준수해야 할 사항과, 회원들에게 안전하고 공정한 게임 환경을 제공하기 위한 관리 조치를 구체적으로 규정하는 것을 목적으로 합니다.
 
제 2조 : 정책 외 준칙
본 운영정책에 명시되지 않은 사항이나 해석은 이용약관에 따르며, 그 외의 사항에 대해서는 관련 법령 및 일반적인 상관례에 따라 처리됩니다.
 
제 3조 : 게임머니 운영
1.   게임머니 정의: 게임머니는 회사가 제공하는 게임 및 서비스를 이용하는 데 필요한 가상 화폐로, 현금과는 무관하며 환금될 수 없습니다.
2.   게임머니 소유권: 게임머니에 대한 모든 권리는 회사에 있으며, 이를 타인과 거래하거나 양도하는 것은 금지됩니다.
3.   게임머니 복구 불가: 회원의 네트워크 문제 등으로 인한 게임머니의 손실에 대해 회사는 복구할 의무가 없습니다.
4.   게임머니 수정 권한: 회사는 서비스 운영상 필요할 경우, 회원의 게임머니를 수정할 수 있습니다.
 
제 4조 : 서비스 이용 제한 조치
회사는 회원이 본 정책을 중대하게 위반하거나 반복적으로 위반한 경우, 또는 특정 사건에 대해 조사나 조치가 필요한 경우 아래의 제한 조치를 취할 수 있습니다.
1.   계정 정지: 일시적 또는 영구적으로 서비스를 이용할 수 없도록 계정을 정지할 수 있습니다.
2.   게임머니 회수: 회원의 게임머니를 회수할 수 있습니다.
3.   프로필 강제 변경: 회원의 닉네임을 강제로 변경할 수 있습니다.
 
제 5조 : 서비스 이용 제한 기준
회사는 아래의 부정행위를 저지른 회원에 대해 서비스 이용을 제한할 수 있습니다.
① 부정 행위
●\t해킹 및 불법 프로그램 사용: 게임 내 불법적인 프로그램이나 해킹 도구를 사용하여 게임의 정상적인 흐름을 방해하는 행위
●\t자동화 프로그램(Bot) 사용: 게임을 자동화하여 불법적으로 진행하는 행위
●\t실시간 지원 프로그램(RTA) 사용: 게임을 실시간으로 유리하게 만드는 프로그램을 사용하는 행위
●\t외부 도구를 이용한 불공정 이득 취득: 게임 외부의 도구나 서비스를 사용해 불공정한 이득을 취하는 행위
●\t게임 내 오류 악용: 시스템의 결함이나 오류를 악용하여 이득을 취하거나 타인에게 피해를 주는 행위
●\t원격 프로그램 사용: 원격 데스크톱 프로그램이나 화면 공유를 사용하여 부당하게 이득을 취하는 행위
●\t가상 머신 사용: 가상 머신 프로그램을 이용해 시스템을 우회하거나 불법적인 방법으로 이득을 취하는 행위
●\t타인 개인정보 도용: 다른 회원의 개인정보를 무단으로 취득하거나 이를 도용하는 행위
●\t운영자 또는 회사 관계자 사칭: 회사의 관계자나 운영자를 사칭하여 불법적인 행위를 하는 행위
●\t부당한 환불 요청: 정당한 이유 없이 환불을 요구하는 행위
●\t게임머니 불법 거래: 게임머니를 다른 회원과 불법적으로 거래하거나 양도하는 행위
② 비정상 플레이
●\t다수 계정 이용: 여러 개의 계정을 이용하여 게임을 불공정하게 운영하는 행위
●\t계정 공유: 자신의 계정을 타인과 공유하여 불법적인 플레이를 하는 행위
●\t고의적 게임머니 손실: 의도적으로 게임머니를 잃어주는 행위
●\t게임 기록 유포: 타인과의 게임 기록을 의도적으로 유포하여 불공정한 이득을 취하는 행위
●\t핸드 카드 정보 공유: 다른 회원과 자신의 게임 핸드 카드 정보를 실시간으로 공유하는 행위
●\t부정한 승패 조작: 게임의 승패를 고의적으로 조작하거나 불공정한 방식으로 결과를 만들어내는 행위
●\t게임머니로 불쾌감을 주는 행위: 적은 금액으로 반복적으로 입장하여 게임머니를 따고, 다시 재입장하는 행위로 다른 회원들에게 불쾌감을 주는 경우
③ 현금 거래
●\t게임머니 현금 거래: 게임머니를 실제 돈으로 사고 팔거나 알선하는 행위
●\t게임머니 매매 홍보: 게임머니의 매매를 홍보하거나 유도하는 행위
④ 부적절한 닉네임/메시지
●\t불건전 또는 외설적인 내용: 게임 내 닉네임이나 메시지에 불건전하거나 외설적인 내용이 포함된 경우
●\t타인 비방 및 욕설: 타인을 비방하거나 욕설, 신체적 비하 등의 불쾌감을 주는 표현을 사용하는 경우
●\t차별적 표현: 특정 인종, 지역, 장애 등에 대한 혐오적이고 비하적인 표현을 사용하는 경우
●\t종교, 정치적 논란: 종교, 정치적 인물 등을 비하하거나 홍보하는 내용을 포함한 경우
●\t광고 및 상업적 목적: 영리 목적의 광고나 홍보 내용을 포함한 경우
●\t공포 및 혐오 표현: 불쾌감을 주는 혐오적이거나 공포스러운 내용을 포함한 경우
⑤ 계정 조사
●\t회사는 회원이 본 운영정책을 위반한 의심이 있는 경우 또는 공공기관의 요청이 있을 경우 해당 계정을 조사할 수 있으며, 이에 따라 서비스 이용을 제한할 수 있습니다.
⑥ 게임운영 방해
●\t고의적 방해: 동일한 문의 또는 신고를 반복하여 서비스 운영을 방해하는 행위
●\t고객상담 방해: 욕설, 위협, 성적 수치심을 유발하는 표현 등을 사용하여 고객상담 업무를 방해하는 행위
●\t 게임 운영 방해: 게임의 정상적인 운영을 위해 회사의 중재나 안내를 따르지 않는 행위
제 6조 : 장애 보상
서비스 장애로 인해 회원이 유료서비스에서 손해를 본 경우, 회사는 소비자 피해보상 규정을 근거로 보상합니다. 단, 사전 공지된 서비스 점검이나 정기 보수 등으로 인한 장애는 고의나 중과실이 없는 경우 보상에서 제외됩니다.
 
제 7조 : 게임 내 분쟁
회사는 게임 내 회원 간의 분쟁에 개입하지 않으며, 분쟁으로 발생한 손해를 배상할 책임이 없습니다. 다만, 이용약관이나 운영정책을 위반하는 행위가 있거나 게임에 미치는 영향이 큰 경우에는 회사가 개입하여 중재할 수 있습니다. 만약 회원이 중재를 따르지 않는 경우, 사전 통지 후 게임 서비스 이용이 제한될 수 있습니다. 긴급한 조치가 필요할 경우 사전 통지 없이 즉시 서비스 이용이 제한될 수 있습니다.

제 8조: 가상재화 거래 제한 및 제재 절차
1) 불법 거래 행위의 정의
① 게임머니·아이템을 판매·구매·교환·양도·대여하거나 이를 광고·알선하는 행위
② 외부 결제수단·메신저·계좌 정보를 이용하여 현금 또는 유사 재화와 교환하는 행위
③ 회사가 승인하지 않은 방법으로 다수 계정을 생성·이용하여 가상재화를 이동·축적하는 행위

2) 배팅 한도
① 단일 판 베팅 한도: 70,000원 상당 게임머니 (게임산업진흥법 시행령 별표 3 기준)

3) 단계벌 제재
1차 적발: 경고 및 해당 가상재화 회수
2차 적발: 계정 7일 이용정지 + 회수
3차 적발: 계정 30일 이용정지 + 회수
4차 적발 또는 중대한 경우: 계정 영구 이용정지 + 전량 몰수

4) 자동 탐지 및 즉시 잠금
불법 거래 패턴(급격한 칩 이동, 동일 IP·디바이스 다계정 접속 등) 탐지 시 서버가 계정을 최대 24시간 선잠금하고, 운영자가 검수 후 제재 절차를 진행합니다.

5) 로그 보존 및 수사 협조
회사는 불법 거래·환전 행위 조사 및 분쟁 해결을 위해 거래 내역, IP 주소, 디바이스 식별값 등 관련 로그를 최대 3년간 보관하며, 관계 법령에 따라 수사기관 요청이 있을 때 이를 제공할 수 있습니다.

6) 이의제기 절차
제재 통보를 받은 회원은 통보일로부터 7일 이내에 고객센터를 통해 서면으로 소명 자료를 제출할 수 있으며, 회사는 접수일로부터 14일 이내에 재심 결과를 통지합니다.

7) 이용약관과의 관계
본 조와 이용약관이 상충할 경우, 이용약관 제16조(가상재화 및 불법거래 금지 및 제재)가 우선 적용됩니다.
 
<부칙> 본 정책은 2025년 1월 1일부터 시행합니다.

`;
