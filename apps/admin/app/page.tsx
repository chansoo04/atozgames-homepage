import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export default function Page() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-[url(/bg_mobile.png)] bg-cover bg-center bg-no-repeat desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <div className="min-h-screen flex-1 desktop:hidden">
        <section className="flex w-full flex-col items-center desktop:hidden">
          <div className="mt-36 h-48 w-80 rounded-lg bg-gray-300"></div>
          <button
            type="button"
            className="mt-8 h-12 w-56 rounded-xl bg-gradient-to-b from-indigo-700 via-indigo-900 to-indigo-900"
            style={{
              boxShadow: "-1px -1px 3px #4852b0 inset, 1px 1px 2.9px #6a72d2 inset",
              background:
                "linear-gradient(107.24deg, #4751af 15.87%, #363882 25.48%, #4751af 36.54%, #2a2c68 66.89%)",
            }}
          >
            <span
              className="text-[18px] font-semibold leading-relaxed"
              style={{
                background:
                  "linear-gradient(98deg, #FAF9FB 10.67%, #8294BA 28.23%, #FAF9FB 45.78%, #72809D 86.35%, #FAF9FB 125.7%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text", // -webkit-background-clip
                WebkitTextFillColor: "transparent", // -webkit-text-fill-color
              }}
            >
              사전예약하기
            </span>
          </button>
        </section>
      </div>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <div className="hidden desktop:block desktop:min-h-screen desktop:flex-1">
        <section className="hidden desktop:flex desktop:w-full"></section>
      </div>

      <Footer />
    </main>
  );
}
