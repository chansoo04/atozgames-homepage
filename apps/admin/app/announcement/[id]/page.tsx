import ssr from "lib/fetcher/ssr";
import { notFound } from "next/navigation";

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
  const announcement = await getPageData(id);
  console.log(announcement);
  return (
    <>
      <div>개별 공지사항</div>
    </>
  );
}
