import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";

export default function Page() {
  return (
    <main className="relative w-full">
      {/* 모바일 */}
      <section
        className="flex min-h-[90vh] flex-col items-center pb-10 pt-[92px] desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">RNG 인증 및 공정성</h1>
        <TopBar />
      </section>

      {/*  PC*/}
      <section className="relative hidden aspect-[1920/2080] desktop:block desktop:w-full desktop:bg-[url('/bg_desktop.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-no-repeat">
        <TopBar />

        <div className="desktop:pt-60">야호</div>
      </section>
      <Footer />
    </main>
  );
}
