import ssr from "lib/fetcher/ssr";

async function getPageData() {
  return await ssr.get("announcement").json();
}

export default async function Page() {
  const announcements = await getPageData();
  console.log(announcements);

  return (
    <>
      <div>공지사항 목록</div>
    </>
  );
}
