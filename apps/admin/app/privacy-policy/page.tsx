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
본 개인정보 처리방침(이하 "본 방침")은 카피바라㈜(이하 "회사")가 제공하는 모든 모바일 포커 게임 서비스(이하 "서비스")에 적용되며, 이용자의 개인정보를 보호하고 권익을 존중하기 위해 다음과 같이 규정합니다.

1. 수집하는 개인정보 항목 및 수집 방법

필수 항목
① 계정 식별정보(이메일·소셜로그인 ID, 닉네임, 프로필사진, 회원번호)
② 휴대폰번호·통신사 정보(PASS 본인확인)
③ 결제 식별정보(구매 영수증 번호, 결제토큰)

자동 수집 항목
① 단말기 정보(OS, 모델, ADID/IDFA)
② 접속 로그·IP·쿠키
③ 게임 이용 기록·베팅 내역·게임머니 거래 내역 (불법 거래 탐지 목적)

수집 방법
① 회원가입, 게임 실행·결제 과정에서 입력 또는 자동 수집
② 고객센터 문의 시 전송

2. 개인정보의 이용 목적
서비스 가입 및 본인확인, 연령 확인
게임 플레이, 랭킹·친구 기능 제공
결제 처리 및 환불, 고객 상담
불법 거래 탐지·제재 및 분쟁 해결
신규 서비스·이벤트 알림(마케팅 수신 동의한 경우)

3. 개인정보의 보유·이용 기간
계약·결제 및 정산 내역 – 전자상거래법 – 5년
소비자 불만·분쟁 처리 기록 – 전자상거래법 – 3년
접속 로그·IP(불법 거래 탐지) – 게임산업진흥법 및 운영정책 – 3년
본인확인 기록 – 정보통신망법 시행령 – 6개월
로그인 기록 – 통신비밀보호법 – 1년
그 외 항목 – 목적 달성 시 또는 법정 보관기간 종료 시까지

4. 개인정보 제3자 제공
회사는 원칙적으로 개인정보를 외부에 제공하지 않습니다. 다만, 다음 경우에는 예외로 합니다.
이용자가 사전에 동의한 경우
법령에 특별한 규정이 있거나 수사기관이 적법한 절차에 따라 요구한 경우

5. 개인정보 처리 위탁
Amazon Web Services, Inc. – 클라우드 인프라 호스팅·백업 – 위탁계약 종료 시 또는 회원 탈퇴 후 1년
㈜드림시큐리티 – 휴대폰 본인확인(PASS) – 본인확인 후 즉시 파기

6. 개인정보 파기 절차 및 방법
파기절차: 목적 달성 후 별도 DB로 이동, 법정 기간 종료 즉시 파기
파기방법:
① 전자파일 – 복구 불가한 방법으로 삭제
② 출력물 – 분쇄 또는 소각

7. 이용자 및 법정대리인의 권리와 행사 방법
이용자는 언제든지 개인정보 열람·정정·삭제·처리정지 요청 가능
atoz@atozgames.net 연락 → 10일 이내 결과 통보
만 14세 미만 아동의 경우 법정대리인이 권리 행사

8. 개인정보의 안전성 확보조치
관리적 대책: 최소 권한 부여, 연2회 이상 보안·개인정보 교육
기술적 대책: 방화벽, 침입탐지, 주기적 취약점 점검, 암호화 저장
물리적 대책: 서버 접근 통제, CCTV 운영

9. 광고식별자(ADID/IDFA)·쿠키 사용
서비스 품질 개선 및 맞춤형 광고를 위해 쿠키·광고식별자를 사용할 수 있으며, 이용자는 단말기 설정에서 수집·이용을 거부할 수 있습니다.

10. 청소년·아동의 개인정보 보호
본 서비스는 19세 미만 청소년 이용불가 게임으로 만 14세 미만 아동의 개인정보를 수집하지 않습니다.
아동의 개인정보가 수집된 사실이 확인될 경우 즉시 파기하고 보호자에게 통보합니다.

11. 개인정보 보호책임자 및 담당부서
개인정보 보호책임자: 오정환
• 전화: 070-7757-5252
• 이메일: atoz@atozgames.net
개인정보 보호 담당부서: 보안팀
• 이메일: atoz@atozgames.net

12. 고지의 의무
본 방침은 2025‑07‑15 제정·시행됩니다. 
내용 추가·삭제·수정이 있을 경우 최소 7일 전(중대한 변경 30일 전) 서비스 공지사항을 통해 고지합니다.

`;
