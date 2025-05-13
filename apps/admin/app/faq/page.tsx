import ssr from "lib/fetcher/ssr";

async function getPageData() {
  return await ssr.get("faq").json();
}

export default async function Page() {
  const faqs = await getPageData();
  console.log(faqs);

  return (
    <>
      <div>FAQ 목록</div>
    </>
  );
}
