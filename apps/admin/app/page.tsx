import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export default function Page() {
  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section className="relative aspect-[1440/3040] w-full flex-col items-center bg-[url('/bg_mobile.png')] bg-[length:100%_auto] bg-top bg-repeat-y pb-10 pt-[92px] desktop:hidden">
        <TopBar />
        <h1 className="text-center text-lg font-bold leading-relaxed  text-white">
          사전예약 모집 준비중입니다
        </h1>
        <div className="px-5 ">
          <div className="mt-5 flex w-full flex-col whitespace-pre-line rounded-[20px] bg-gray-100 p-5 text-sm font-normal leading-tight text-gray-700">
            잠시만 기다려주세요
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            사전예약 모집 준비중입니다
          </h1>
          <div className="max-w-[1200px] desktop:mb-52 desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            <div className="whitespace-pre-line pb-20 pt-10 text-lg font-normal text-white">
              잠시만 기다려주세요
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
