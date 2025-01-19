import type { Metadata } from "next";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

export const metadata: Metadata = {
  title: "아토즈포커 - 공정한 포커 플랫폼",
  description: "아토즈포커는 보안과 신뢰, 공정성을 최우선으로 하는 온라인 포커 플랫폼입니다.",
  openGraph: {
    title: "아토즈포커 - 공정한 포커 플랫폼",
    description: "아토즈포커는 보안과 신뢰, 공정성을 최우선으로 하는 온라인 포커 플랫폼입니다.",
    siteName: "아토즈포커",
  },
};

export default async function App() {
  return (
    <>
      <div className="flex-col items-center bg-gray-100 h-screen">작업중인 페이지입니다</div>
      <div className="h-screen">asdf</div>
    </>
  );
}
