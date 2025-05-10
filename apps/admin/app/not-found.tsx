import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full  flex-col px-5">
      <div className="flex grow items-center justify-center pb-32">
        <main className=" flex flex-col items-center gap-y-10 text-3xl font-semibold text-gray-600">
          <div>페이지를 찾을 수 없거나, 접근이 불가능한 페이지입니다.</div>
          <Link href="/">홈으로 이동하기</Link>
        </main>
      </div>
    </div>
  );
}
