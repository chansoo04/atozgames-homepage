import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "청소년 보호정책",
  description: "아토즈포커는 청소년 보호정책을 수립 운영하고 있습니다",
  openGraph: {
    title: "청소년 보호정책",
    description: "아토즈포커는 청소년 보호정책을 수립 운영하고 있습니다",
    siteName: "아토즈포커 청소년 보호정책",
  },
};

export default function Page() {
  return (
    <>
      <div>청소년 보호정책</div>
    </>
  );
}
