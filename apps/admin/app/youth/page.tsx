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
          청소년 보호정책
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
            {youth}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:min-w-[1280px] desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
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
            청소년 보호정책
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
              {youth}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

const youth = `
제1조 (목적)
본 청소년 보호정책(이하 "본 정책")은 카피바라㈜(이하 "회사")가 제공하는 모바일 포커 게임 서비스(이하 "서비스")와 관련하여, 청소년이 유해정보에 노출되는 것을 방지하고 건전한 이용 환경을 조성하기 위해 필요한 기준과 절차를 정함을 목적으로 합니다.

제2조 (용어의 정의)

"청소년"이라 함은 만 19세 미만의 자를 말합니다.

"유해정보"라 함은 사행성, 음란성, 폭력성 등 청소년에게 유해하다고 판단되는 모든 정보를 의미합니다.

제3조 (청소년 유해정보의 차단 및 관리)

연령확인 절차
① 사용자는 서비스 최초 실행 또는 로그인 시 휴대폰 본인확인, PASS, 아이핀 등 인증 수단을 통해 성인 여부를 확인합니다.
② 성인 인증이 완료되지 않은 사용자는 서비스에 접속할 수 없습니다.

등급 및 경고표시
① 서비스 초기 화면에 '청소년이용불가' 등급 아이콘과 "19세 미만 이용불가" 문구를 3초 이상 노출합니다.
② 게임 플레이 중 1시간마다 동일한 경고 문구를 3초 이상 노출합니다.

스토어 고지
구글 플레이스토어 및 애플 앱스토어 설명란 상단에 게임물관리위원회 등급번호와 "19세 미만 이용불가" 문구를 표기합니다.

환전 및 현금거래 금지
① 게임머니 및 아이템은 현금ㆍ재화 등과 교환할 수 없습니다.
② 현금거래 시도 적발 시, 회사는 계정을 영구 정지하고 관련 재화를 몰수할 수 있습니다.

제4조 (정보통신업무 종사자 교육)
회사는 모든 임직원을 대상으로 연 2회 이상 청소년유해정보 식별 및 대응 교육을 실시하며, 교육 기록은 3년간 보관합니다.

제5조 (피해 상담 및 신고 절차)

고객센터

전화: 070-7757-5252

이메일: atoz@atozgames.net

청소년 상담 전화 1388(국번 없이 1388) 이용 안내

방송통신심의위원회 신고 전화 1377 안내

접수된 민원에 대하여 회사는 24시간 이내 1차 답변을 제공하며, 7일 이내 최종 처리 결과를 통보합니다.

제6조 (청소년보호책임자)

성   명: 오정환

직   책: 정보보호최고책임자(CISO) 겸 청소년보호책임자

전화번호: 070-7757-5252

E-mail: atoz@atozgames.net
청소년보호책임자는 본 정책의 시행, 유해정보 차단 시스템 관리, 종사자 교육 및 피해상담 업무를 총괄합니다.

제7조 (개인정보 보호)

회사는 주민등록번호 등 고유식별정보를 수집하지 않습니다.

클라우드 서버가 국외 리전에 위치할 경우, 이전 국가, 목적, 보유기간 및 안전조치를 개인정보처리방침에 고지하고 별도의 동의를 받습니다.

제8조 (정책 변경)

본 정책은 관련 법령 및 서비스 변경 시 개정될 수 있습니다.

정책 개정 시 회사는 최소 7일 전(중대한 사항의 경우 30일 전) 서비스 내 공지사항을 통해 변경 내용을 고지합니다.

부칙

(제정) 본 정책은 2025년 07월 15일부터 시행합니다.

(개정) 이후 개정 이력은 시행일과 함께 공개합니다.
`;
