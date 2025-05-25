"use client";
import { useState, FormEvent } from "react";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { auth } from "lib/firebaseClient";
import { setCookie } from "cookies-next";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 👉 실제 로그인 로직
  const handleAtozLogin = async () => {
    try {
      const atozAuth = await signInWithEmailAndPassword(auth, id + "@atozgames.net", password);

      const response = await fetch("/api/oauth/atoz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(atozAuth),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      const data = await response.json();

      if (data.result === "success") {
        setCookie("token", data.token);
        setCookie("uid", data.uid);
        window.location.href = searchParams.get("redirect_uri") ?? "/";
      }
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("Firebase"))
        return alert("로그인에 실패했습니다\n아이디, 비밀번호를 확인해주세요");
      alert(err?.message ?? "애플 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  // 👉 Enter 또는 버튼 클릭 시 모두 실행되는 submit 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    if (!id || !password) return; // 빈 값 보호
    await handleAtozLogin();
  };

  return (
    <main className="w-full desktop:flex desktop:min-h-screen desktop:w-full desktop:flex-col desktop:bg-[url(/bg_desktop.png)] desktop:bg-cover desktop:bg-center desktop:bg-no-repeat">
      <TopBar />

      {/* 모바일(<640)에서만 보임 */}
      <section
        className="tablet:hidden mt-[60px] flex min-h-[85vh] flex-col items-center px-5 pb-10 pt-8 desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
        }}
      >
        <h1 className="text-lg font-bold leading-relaxed text-gray-700">로그인</h1>

        {/* 🔑 입력 영역을 form으로 감싸고 onSubmit 사용 */}
        <form onSubmit={handleSubmit} className="mt-20 flex w-full flex-col">
          {/* 아이디 입력 */}
          <label className="text-left text-base font-medium text-gray-700">
            아이디
            <input
              type="text"
              className="mt-2.5 w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent p-2 text-base outline-none focus:border-b-gray-400 focus:ring-0"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </label>

          {/* 비밀번호 입력 */}
          <label className="mt-8 text-left text-base font-medium text-gray-700">
            비밀번호
            <input
              type="password"
              className="mt-2.5 w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent p-2 text-base outline-none focus:border-b-gray-400 focus:ring-0"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {/* 버튼은 submit 타입으로 둬야 Enter 시에도 동일 로직 */}
          <button
            type="submit"
            disabled={!id || !password}
            className="mt-8 w-full bg-primary py-2.5 text-base font-semibold text-white disabled:bg-gray-400"
          >
            로그인
          </button>
        </form>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="hidden desktop:mt-60 desktop:block desktop:min-h-screen desktop:flex-1 ">
        <div className="desktop:mx-auto desktop:flex desktop:w-full desktop:max-w-[1200px] desktop:flex-col">
          <h1 className="desktop:text-center desktop:text-5xl desktop:font-bold desktop:text-white">
            로그인
          </h1>
          <form
            onSubmit={handleSubmit}
            className="mb-20 min-h-[600px] desktop:mt-20 desktop:flex desktop:flex-col desktop:justify-center desktop:rounded-[25px] desktop:bg-[#16172D]/70 desktop:px-[50px]"
          >
            <label className="text-left text-base font-medium text-white">
              아이디
              <input
                type="text"
                className="mt-2.5 w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent p-2 text-base outline-none focus:border-b-gray-400 focus:ring-0"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>

            {/* 비밀번호 입력 */}
            <label className="mt-8 text-left text-base font-medium text-white">
              비밀번호
              <input
                type="password"
                className="mt-2.5 w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent p-2 text-base outline-none focus:border-b-gray-400 focus:ring-0"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {/* 버튼은 submit 타입으로 둬야 Enter 시에도 동일 로직 */}
            <button
              type="submit"
              disabled={!id || !password}
              className="mt-8 w-full bg-serve py-4 text-base font-semibold text-white disabled:bg-gray-400"
            >
              로그인
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
