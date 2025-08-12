import ssr from "lib/fetcher/ssr";
import ClientComponent from "./ClientComponent";

type Announcement = {
  id: number;
  order: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
  append: string;
  is_active: string;
  status: string;
};

async function getData() {
  const result = await ssr
    .get("announcement")
    .json<{ result: string; announcement: Announcement[] }>();
  return result.announcement;
}

export default async function Page() {
  const announcements = await getData();

  return <ClientComponent announcements={announcements} />;
}
