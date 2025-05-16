import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import ssr from "lib/fetcher/ssr";
import { notFound } from "next/navigation";
import Image from "next/image";

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

async function getPageData(id: number) {
  return await ssr
    .get(`faq/${id}`)
    .json()
    .catch((error) => {
      notFound();
    });
}

export default async function Page({ params }: { params: { id: number } }) {
  const { id } = params;
  const faq: any = await getPageData(id);

  return (
    <main className="w-full">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="tablet:hidden mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">자주 묻는 질문</h1>
        <div className="mt-5 w-full rounded-[20px] bg-gray-100 px-5 pb-[30px] pt-5">
          <div className="py-[15px]">
            <div
              className={`inline-block rounded-full px-2.5 text-sm font-semibold ${faq.subcategory === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
            >
              {faq.subcategory}
            </div>
            <div className="mt-2.5 whitespace-pre-line text-base font-medium leading-relaxed text-gray-700">
              {faq.title}
            </div>
            <div className="mt-[15px] flex items-center gap-x-1">
              <Image src="/clock.png" alt="작성일" width={14} height={14} />
              <div className="text-sm font-normal text-gray-500">{changeDate(faq.created_at)}</div>
            </div>
          </div>
          <div className="whitespace-pre-line py-5 text-sm font-normal leading-tight text-gray-700">
            {faq.content}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="tablet:hidden hidden desktop:block">PC</section>

      <Footer />
    </main>
  );
}
