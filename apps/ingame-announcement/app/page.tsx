"use client";
import useSWR from "swr";

// import ssr from "lib/fetcher/ssr";
import ClientComponent from "./ClientComponent";

export type Announcement = {
  id: number;
  order: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  append: string;
  is_active: string;
  status: string;
};
//
// async function getData() {
//   const result = await ssr
//     .get("announcement")
//     .json<{ result: string; announcement: Announcement[] }>();
//   return result.announcement;
// }

export default function Page() {
  const { data } = useSWR<{ result: string; announcement: Announcement[] }>("announcement");
  console.log(data, "data");

  return <ClientComponent announcements={data?.announcement ?? []} />;
}
