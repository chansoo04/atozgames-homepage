export default function Test() {
  return (
    <>
      {/* 모바일(<640)에서만 보임 */}
      <footer className="tablet:hidden desktop:hidden">모바일</footer>

      {/* 태블릿(≥640 & <1024)에서만 보임 */}
      <footer className="hidden tablet:block desktop:hidden">태블릿</footer>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <footer className="hidden tablet:hidden desktop:block">PC</footer>
    </>
  );
}
