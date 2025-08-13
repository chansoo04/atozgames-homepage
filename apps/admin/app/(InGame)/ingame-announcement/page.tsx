"use client";
import useSWR from "swr";
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

export default function Page() {
  const { data } = useSWR<{ result: string; announcement: Announcement[] }>("announcement");

  return <ClientComponent announcements={data?.announcement ?? []} />;
}
