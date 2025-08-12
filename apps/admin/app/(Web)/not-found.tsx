import { redirect } from "next/navigation";

export default function NotFound() {
  // 페이지를 못 찾으면 루트로 리디렉션
  redirect("/");
}
