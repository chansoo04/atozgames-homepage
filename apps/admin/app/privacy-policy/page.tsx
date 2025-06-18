"use client";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import useWindowSize from "app/_components/useWindowSize";

export default function Page() {
  const { ratio } = useWindowSize();

  return (
    <main className="relative w-full">
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
          개인정보 처리방침
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
            {privacyPolicy}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop2.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
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
            개인정보 처리방침
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
              {privacyPolicy}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const privacyPolicy = `
카피바라 주식회사(이하 "회사")은 이용자의 개인정보 보호를 중요하게 생각하며, 개인정보 처리방침을 통해 이를 보호하기 위한 노력과 방안을 명확히 안내하고 있습니다. 회사는 관련 법령을 준수하고, 개인정보 보호를 위한 기술적, 관리적 조치를 취하고 있습니다. 또한, 회사의 정책이 변경되거나 법령이 개정되는 경우에는 개인정보 처리방침을 수정하여 홈페이지를 통해 사전 공지할 것입니다.
 
제1조 개인정보의 제3자 제공
회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않으며, 아래의 경우에만 제공될 수 있습니다.

1. 이용자가 사전에 동의한 경우2. 법령에 의한 요청이 있는 경우, 또는 적법한 절차에 따라 법원, 수사기관, 기타 행정기관에서 요구하는 경우
 
제2조 개인정보 보유 및 이용 기간
회사는 개인정보 보유 및 이용 기간을 법령에 따라 또는 이용자로부터 동의를 받은 기간 동안 보유하고 처리합니다. 각 항목에 대한 보유 기간은 다음과 같습니다.




1. 회원 가입 및 관리: 회원 탈퇴 또는 서비스 종료 시까지2. 본인 인증: 회원 탈퇴 또는 서비스 종료 시까지3. 결제 처리: 회원 탈퇴 또는 서비스 종료 시까지4. 고객 상담 및 문의 처리: 회원 탈퇴 또는 서비스 종료 시까지5. 서비스 이용 시 자동 수집 정보: 회원 탈퇴 또는 서비스 종료 시까지
보유 기간이 종료되거나 개인정보 수집 및 이용 목적이 달성되면, 회사는 즉시 개인정보를 파기합니다. 다만, 법령에 의한 보존 필요성이 있을 경우 예외적으로 보존할 수 있습니다.



예외 상황- 부정 이용 기록: 수집일로부터 1년 (부정 이용 방지 목적)- 과몰입 이용 기록: 수집일로부터 1년 (과몰입 이용 방지 목적)- 본인 인증 기록: 회원 탈퇴 시까지 (혼선 방지 및 분쟁 해결 목적)






법령에 의한 보존 필요성:- 가입자 전기통신일시 등: 1년- 컴퓨터통신 및 인터넷 로그 기록: 3개월- 소비자 불만 및 분쟁 처리 기록: 3년- 계약 및 청약 철회 기록: 5년- 대금 결제 및 재화 공급 기록: 5년- 표시 또는 광고 기록: 6개월
 
제3조 개인정보 처리 위탁
현재 회사는 개인정보 처리를 위탁하고 있지 않지만, 추후 개인정보 처리가 위탁될 경우, 해당 내용을 개인정보 처리방침에 반영하여 7일 이전에 공지할 것입니다.
 
제4조 개인정보 파기 절차 및 방법
회사는 개인정보 보유 기간이 만료되거나 처리 목적이 달성된 경우, 이를 지체 없이 파기합니다. 개인정보의 파기 절차와 방법은 다음과 같습니다.

1. 파기 절차: 개인정보 파기 사유 발생 시, 해당 개인정보를 선정하여 내부 절차에 따라 파기합니다.2. 파기 방법: 종이에 출력된 개인정보는 분쇄기를 사용하거나 소각하여 파기하며, 전자 파일로 저장된 개인정보는 복구 불가능한 방법으로 삭제합니다.
 
제5조 개인정보의 수집 및 이용 목적
회사는 이용자의 개인정보를 다음과 같은 목적을 위해 수집하고 처리합니다. 개인정보는 본 목적 외에는 사용되지 않으며, 목적이 변경될 경우 이용자에게 별도의 동의를 요청합니다.

1. 회원 가입 및 관리   - 필수 항목: 아이디, 비밀번호

2. 본인 인증   - 필수 항목: 이름, 생년월일, 성별, 내외국인 정보, 휴대폰번호, 통신사 정보 (휴대폰 인증 시), 신용카드사 정보 (신용카드 인증 시), 중복가입 확인 정보(DI), 암호화된 동일인 식별 정보(CI)

3. 결제 처리   - 필수 항목: 결제 수단, 소유자 정보(이름, 주민등록번호 앞 7자리), 신용카드 정보, 휴대전화번호

4. 고객 상담 및 문의 처리   - 필수 항목: 문의 내용, 첨부 파일

5. 서비스 이용 시 자동 수집되는 정보   - 필수 항목: 서비스 이용 기록, 접속 로그, 결제 기록, 부정 이용 기록, IP 주소, MAC 주소, 기기 사양 정보, 운영체제(OS) 정보 및 버전, 기기 식별자, 통신사, 단말기 언어 및 국가 정보
 
제6조 개인정보 보호를 위한 안전성 확보 조치
회사는 이용자의 개인정보 보호를 위해 다양한 기술적, 관리적 조치를 취하고 있습니다. 다만, 이용자의 부주의나 인터넷 보안 환경의 결함으로 발생할 수 있는 개인정보 유출에 대해서는 책임을 지지 않습니다.



1. 기술적 조치   - 비밀번호는 암호화 처리하여 저장하며, 이를 알 수 없도록 관리합니다.   - 개인정보 전송 시 암호화된 통신을 사용하여 안전하게 보호합니다.   - 해킹, 컴퓨터 바이러스 등에 의한 개인정보 유출 방지를 위해 주기적인 점검과 보안 시스템을 운영합니다.

2. 관리적 조치   - 개인정보 처리 담당자를 제한하여 관리하고, 관련 직원에 대한 교육을 통해 개인정보 보호 정책을 준수하도록 강조합니다.
 
제7조 정보주체의 권리와 행사 방법
이용자는 언제든지 본인의 개인정보 열람, 수정, 처리 제한, 동의 철회(회원 탈퇴) 등의 권리를 행사할 수 있습니다. 다만, 개인정보 보호법 제35조 및 제37조에 의해 일부 제한될 수 있습니다.

1. 권리 행사 방법: 고객센터를 통해 개인정보 보호 책임자에게 연락하여 권리를 행사하실 수 있습니다.2. 서비스 제공에 필수적인 개인정보 삭제 시 제한: 필수 개인정보 삭제 시, 해당 서비스의 이용이 불가능할 수 있습니다.
 
제8조 링크 사이트
회사는 외부 사이트와의 링크를 제공할 수 있습니다. 이 경우, 해당 사이트의 개인정보 처리방침은 회사의 정책과 다를 수 있으므로, 이용자는 새로 방문한 사이트의 개인정보 처리방침을 반드시 확인해야 합니다.
 
제9조 개인정보 처리방침 고지
본 개인정보 처리방침은 법령, 정책, 보안 기술의 변경에 따라 수시로 수정될 수 있습니다. 변경 사항은 시행일 7일 전부터 홈페이지를 통해 공지하며, 수집 항목, 이용 목적 등의 중대한 변경이 있을 경우 최소 30일 전에 공지할 것입니다.
 
제10조 개인정보 보호 책임자 및 민원 서비스
회사는 개인정보 보호와 관련된 문의 사항을 처리하기 위해 개인정보 보호 책임자를 지정하고 있습니다. 관련된 민원은 아래의 연락처를 통해 문의하실 수 있습니다.


개인정보 보호 책임자  이름: [이름]  이메일: [이메일]  
또한, 개인정보 침해 신고나 상담이 필요할 경우 아래 기관에 문의할 수 있습니다.


1. 개인정보 침해 신고 센터     - 전화: (국번 없이) 118     - 홈페이지: [http://privacy.kisa.or.kr](http://privacy.kisa.or.kr)


2. 개인정보 분쟁 조정 위원회     - 전화: 1833-6972     - 홈페이지: [http://www.kopico.go.kr](http://www.kopico.go.kr)
 
제11조 개인정보 수집 방법
회사는 다음과 같은 방법으로 개인정보를 수집합니다.

1. 회원 가입 및 회원 정보 수정 시 제공하는 양식2. 고객 상담을 진행하는 과정에서
 
제12조 개인정보의 처리(수집•이용) 목적
회사는 이용자의 개인정보를 다음과 같은 목적을 위해 수집하고 처리합니다. 개인정보는 본 목적 외에는 사용되지 않으며, 목적이 변경될 경우 이용자에게 별도의 동의를 요청합니다.

회원 가입 및 관리  - 필수 항목: 아이디, 비밀번호

본인 인증  - 필수 항목: 이름, 생년월일, 성별, 내외국인 정보, 휴대폰번호, 통신사 정보 (휴대폰 인증 시), 신용카드사 정보 (신용카드 인증 시), 중복가입 확인 정보(DI), 암호화된 동일인 식별 정보(CI)
 
본 개인정보 처리방침은 2025년 1월 1일부터 시행됩니다.

`;
