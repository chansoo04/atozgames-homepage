import ssr from "lib/fetcher/ssr";
import Tabs from "./Tabs";

async function getPageData() {
  return await ssr.get("faq").json();
}

export default async function Page() {
  const faqs = await getPageData();

  return <Tabs faqs={faqs} />;
}
