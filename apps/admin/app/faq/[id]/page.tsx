import ssr from "lib/fetcher/ssr";
import { notFound } from "next/navigation";

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
  const faq = await getPageData(id);

  return (
    <>
      <div>개별 FAQ</div>
    </>
  );
}
