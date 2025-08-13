"use client";
import useSWR from "swr";
import ClientComponent from "./ClientComponent";

export type FAQ = {
  id: number;
  category: string;
  title: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
};

export default function Page() {
  const { data } = useSWR<{ result: string; faq: FAQ[] }>("faq");

  return <ClientComponent faqs={data?.faq ?? []} />;
}
