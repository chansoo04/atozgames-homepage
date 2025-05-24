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
    .get(`announcement/${id}`)
    .json()
    .catch((error) => {
      notFound();
    });
}

export default async function Page({ params }: { params: { id: number } }) {
  const { id } = params;
  const announcement: any = await getPageData(id);

  return (
    <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">공지사항</h1>
        <div className="mt-5 w-full rounded-[20px] bg-gray-100 px-5 pb-[30px] pt-5">
          <div className="py-[15px]">
            <div
              className={`inline-block rounded-full px-2.5 text-sm font-semibold ${announcement.category === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
            >
              {announcement.category}
            </div>
            <div className="mt-2.5 whitespace-pre-line text-base font-medium leading-relaxed text-gray-700">
              {announcement.title}
            </div>
            <div className="mt-[15px] flex items-center gap-x-1">
              <Image src="/clock.png" alt="작성일" width={14} height={14} />
              <div className="text-sm font-normal text-gray-500">
                {changeDate(announcement.created_at)}
              </div>
            </div>
          </div>
          <div className="whitespace-pre-line py-5 text-sm font-normal leading-tight text-gray-700">
            {announcement.content}
          </div>
        </div>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1">
        <div className="desktop:mx-auto desktop:flex desktop:w-[1200px] desktop:flex-col">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            공지사항
          </h1>
          <div className="desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            <div className="flex justify-between pt-10">
              <div
                className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${announcement.category === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
              >
                {announcement.category}
              </div>
              <div className="flex items-center gap-x-1">
                <Image src="/clock.png" alt="작성일" width={20} height={20} />
                <div className="text-lg font-medium text-gray-400">
                  {changeDate(announcement.created_at)}
                </div>
              </div>
            </div>
            <h3 className="mt-[15px] border-b border-gray-600 pb-10 text-xl font-bold text-white">
              {announcement.title}
            </h3>

            <div className="mt-[35px] whitespace-pre-line pb-80 text-lg font-normal text-white">
              {announcement.content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
