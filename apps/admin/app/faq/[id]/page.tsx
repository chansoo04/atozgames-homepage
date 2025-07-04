import ssr from "lib/fetcher/ssr";
import { notFound } from "next/navigation";
import ClientPage from "./ClientPage";

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
    <ClientPage faq={faq} />
    // <main className="relative w-full">
    //   {/* 모바일(<640)에서만 보임 */}
    //   <section
    //     className="flex min-h-[90vh] flex-col items-center pb-10 pt-[92px] desktop:hidden"
    //     style={{
    //       background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
    //     }}
    //   >
    //     <TopBar />
    //     <h1 className="text-lg font-bold leading-relaxed text-gray-700">자주 묻는 질문</h1>
    //
    //     <div className="w-full px-5">
    //       <div className="mt-5 w-full rounded-[20px] bg-gray-100 px-5 pb-[30px] pt-5">
    //         <div className="py-[15px]">
    //           <div
    //             className={`inline-block rounded-full px-2.5 text-sm font-semibold ${faq.subcategory === "공지" ? "bg-serve text-gray-100" : "bg-primary text-gray-700"}`}
    //           >
    //             {faq.subcategory}
    //           </div>
    //           <div className="mt-2.5 whitespace-pre-line text-base font-medium leading-relaxed text-gray-700">
    //             {faq.title}
    //           </div>
    //           <div className="mt-[15px] flex items-center gap-x-1">
    //             <Image src="/clock.png" alt="작성일" width={14} height={14} />
    //             <div className="text-sm font-normal text-gray-500">
    //               {changeDate(faq.created_at)}
    //             </div>
    //           </div>
    //         </div>
    //         <div className="whitespace-pre-line py-5 text-sm font-normal leading-tight text-gray-700">
    //           {faq.content}
    //         </div>
    //       </div>
    //     </div>
    //   </section>
    //
    //   {/* 데스크탑(≥1024)에서만 보임 */}
    //   <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop1.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
    //     <TopBar />
    //
    //     <div className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60">
    //       <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
    //         자주 묻는 질문
    //       </h1>
    //
    //       <div className="w-[1200px] desktop:mt-20 desktop:flex desktop:flex-col desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px] desktop:py-5">
    //         <div className="flex justify-between pt-10">
    //           <div
    //             className={`flex h-[30px] w-[64px] items-center justify-center rounded-full text-lg font-medium ${faq.category === "공지" ? "bg-serve text-white" : "bg-primary text-gray-700"}`}
    //           >
    //             {faq.subcategory}
    //           </div>
    //           <div className="flex items-center gap-x-1">
    //             <Image src="/clock.png" alt="작성일" width={20} height={20} />
    //             <div className="text-lg font-medium text-gray-400">
    //               {changeDate(faq.created_at)}
    //             </div>
    //           </div>
    //         </div>
    //         <h3 className="mt-[15px] border-b border-gray-600 pb-10 text-xl font-bold text-white">
    //           {faq.title}
    //         </h3>
    //
    //         <div className="mt-[35px] whitespace-pre-line pb-80 text-lg font-normal text-white">
    //           {faq.content}
    //         </div>
    //       </div>
    //     </div>
    //   </section>
    //
    //   <Footer />
    // </main>
  );
}
