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
  const announcements: any = await getPageData();

  return (
    <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop2.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="tablet:hidden mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
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
              href={`/apps/admin/app/(Web)/announcement/${item.id}`}
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

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1 ">
        <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[1200px] desktop:flex-col">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            공지사항
          </h1>
          <div className="mb-20 min-h-[1150px] desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
            {announcements.map((announcement: any) => (
              <Link
                key={announcement.id.toString()}
                href={`/apps/admin/app/(Web)/announcement/${announcement.id}`}
                className="flex w-full justify-between border-b border-gray-600 py-10"
              >
                <div className="flex items-center gap-x-4">
                  <div
                    className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${announcement.category === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
                  >
                    {announcement.category}
                  </div>
                  <div className="w-[500px] truncate text-lg font-medium text-white">
                    {announcement.title}
                  </div>
                </div>
                <div className="flex items-center gap-x-1">
                  <Image src="/clock.png" alt="작성일" width={20} height={20} />
                  <div className="text-lg font-medium text-gray-400">
                    {changeDate(announcement.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
