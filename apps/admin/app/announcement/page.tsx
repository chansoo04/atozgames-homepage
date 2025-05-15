import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import ssr from "lib/fetcher/ssr";
import Link from "next/link";
import Image from "next/image";

async function getPageData() {
  return await ssr.get("announcement").json();
}

const changeDate = (date: number) => {
  const createdAt = new Date(date).toISOString();
  return createdAt.slice(0, 10).replaceAll("-", ".");
};

export default async function Page() {
  const announcements = await getPageData();

  return (
    <main className="w-full">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 tablet:hidden desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">공지사항</h1>
        <div className="mt-5 flex w-full flex-col rounded-[20px] bg-gray-100 p-5">
          {(announcements as any)?.map((item: any) => (
            <Link
              key={item.id.toString()}
              className="flex w-full flex-col gap-y-2.5 border-b border-gray-200 py-[15px]"
              href={`/announcement/${item.id}`}
            >
              <div className="grid grid-cols-[45px_1fr] items-center gap-x-2.5">
                <div
                  className={`rounded-full px-2.5 text-sm font-semibold ${item.category === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
                >
                  {item.category}
                </div>
                <div className="truncate text-base font-medium leading-tight text-gray-700">
                  {item.title}
                </div>
              </div>
              <div className="flex items-center gap-x-[5px]">
                <Image src="/clock.png" alt="작성일" width={14} height={14} />
                <div className="text-sm font-normal text-gray-500">
                  {changeDate(item.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 태블릿(≥640 & <1024)에서만 보임 */}
      <section className="hidden tablet:block desktop:hidden">태블릿</section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden tablet:hidden desktop:block">PC</section>

      <Footer />
    </main>
  );
}
