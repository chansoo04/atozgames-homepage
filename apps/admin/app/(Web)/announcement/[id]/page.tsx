import ssr from "lib/fetcher/ssr";
import { notFound } from "next/navigation";
import ClientPage from "./ClientPage";

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

  return <ClientPage announcement={announcement} />;
}
