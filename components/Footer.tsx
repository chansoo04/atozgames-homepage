import Link from "next/link";

/*
1. 카피바라 사업자번호: 564-81-03136
2. 대표 전화번호(CS): 010-
3. 주소지: 서울특별시 강서구 공항대로 59길 8, 415호(등촌동, 우현빌딩)
4. 대표이사: 오우열
5. 이메일 주소: atoz@atozgames.net
6. 통신판매업신고번호: 제 2024-서울강서-3600 호
* */

// TODO: 전화번호 변경 필요
export default function Footer() {
  return (
    <>
      {/* 모바일 푸터 */}
      <footer className="md:hidden bg-gray-50 py-10 px-5 text-sm text-gray-700">
        <div className="flex flex-col gap-3">
          <div>카피바라 주식회사</div>
          <div>사업자번호: 564-81-03136</div>
          <div>대표 전화번호(CS): 010-5265-6590</div>
          <div>
            주소지: 서울특별시 강서구 공항대로 59길 8, 415호
            <br />
            (등촌동, 우현빌딩)
          </div>
          <div>이메일 주소: atoz@atozgames.net</div>
          <div>통신판매업신고번호: 제 2024-서울강서-3600 호</div>
          <div className="flex flex-col gap-2 mt-5">
            <Link href="/terms-of-use" className="text-gray-700 font-medium">
              이용약관
            </Link>
            <Link href="/privacy-policy" className="text-gray-700 font-medium">
              개인정보 처리방침
            </Link>
            <Link href="/youth-protection-policy" className="text-gray-700 font-medium">
              청소년 보호정책
            </Link>
          </div>
        </div>
      </footer>

      {/* PC 푸터 */}
      <footer className="hidden md:flex bg-gray-50 py-10 px-20 text-sm text-gray-700">
        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-3 gap-10">
          <div className="space-y-3">
            <div>카피바라 주식회사</div>
            <div>사업자번호: 564-81-03136</div>
            <div>대표 전화번호(CS): 010-5265-6590</div>
            <div>
              주소지: 서울특별시 강서구 공항대로 59길 8, 415호
              <br />
              (등촌동, 우현빌딩)
            </div>
            <div>이메일 주소: atoz@atozgames.net</div>
            <div>통신판매업신고번호: 제 2024-서울강서-3600 호</div>
          </div>
          <div className="col-span-2 flex justify-end space-x-10">
            <Link href="/terms-of-use" className="text-gray-700 font-medium">
              이용약관
            </Link>
            <Link href="/privacy-policy" className="text-gray-700 font-medium">
              개인정보 처리방침
            </Link>
            <Link href="/youth-protection-policy" className="text-gray-700 font-medium">
              청소년 보호정책
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
