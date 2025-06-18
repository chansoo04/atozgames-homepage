"use client";
import { useState, FormEvent } from "react";
import TopBar from "app/_components/TopBar";
import Footer from "app/_components/Footer";
import { auth } from "lib/firebaseClient";
import { setCookie } from "cookies-next";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import { mobileSizeCalc, desktopSizeCalc } from "app/_components/sizeCalculator";
import useWindowSize from "app/_components/useWindowSize";

export default function Page() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { ratio } = useWindowSize();

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
        setCookie("account_id", data.account_id);
        window.location.href = searchParams.get("redirect_uri") ?? "/";
      }
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes("Firebase"))
        return alert("로그인에 실패했습니다\n아이디, 비밀번호를 확인해주세요");
      alert(err?.message ?? "아토즈 로그인에 실패했습니다!\n잠시 후 다시 시도해주세요");
    }
  };

  // 👉 Enter 또는 버튼 클릭 시 모두 실행되는 submit 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 새로고침 방지
    if (!id || !password) return; // 빈 값 보호
    await handleAtozLogin();
  };

  return (
    <main className="relative w-full">
      {/* 모바일(<640)에서만 보임 */}
      <section
        className="flex flex-col items-center desktop:hidden"
        style={{
          background: "linear-gradient(0deg, #F5F5F8 0%, #DCEFFF 100%)",
          minHeight: mobileSizeCalc(783, ratio),
          paddingBottom: mobileSizeCalc(40, ratio),
          paddingTop: mobileSizeCalc(92, ratio),
        }}
      >
        <TopBar />
        <h1
          className="font-bold text-gray-700"
          style={{
            fontSize: mobileSizeCalc(18, ratio),
            lineHeight: mobileSizeCalc(26, ratio),
          }}
        >
          로그인
        </h1>

        {/* 🔑 입력 영역을 form으로 감싸고 onSubmit 사용 */}
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col"
          style={{
            marginTop: mobileSizeCalc(80, ratio),
            paddingLeft: mobileSizeCalc(20, ratio),
            paddingRight: mobileSizeCalc(20, ratio),
          }}
        >
          {/* 아이디 입력 */}
          <label
            className="text-left font-medium text-gray-700"
            style={{
              fontSize: mobileSizeCalc(16, ratio),
            }}
          >
            아이디
            <input
              type="text"
              className="w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent outline-none focus:border-b-gray-400 focus:ring-0"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{
                marginTop: mobileSizeCalc(10, ratio),
                padding: mobileSizeCalc(8, ratio),
                fontSize: mobileSizeCalc(16, ratio),
              }}
            />
          </label>

          {/* 비밀번호 입력 */}
          <label
            className="text-left font-medium text-gray-700"
            style={{
              marginTop: mobileSizeCalc(32, ratio),
              fontSize: mobileSizeCalc(16, ratio),
            }}
          >
            비밀번호
            <input
              type="password"
              className="w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent outline-none focus:border-b-gray-400 focus:ring-0"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                marginTop: mobileSizeCalc(10, ratio),
                padding: mobileSizeCalc(8, ratio),
                fontSize: mobileSizeCalc(16, ratio),
              }}
            />
          </label>

          {/* 버튼은 submit 타입으로 둬야 Enter 시에도 동일 로직 */}
          <button
            type="submit"
            disabled={!id || !password}
            className="w-full bg-primary font-semibold text-white disabled:bg-gray-400"
            style={{
              marginTop: mobileSizeCalc(32, ratio),
              paddingTop: mobileSizeCalc(10, ratio),
              paddingBottom: mobileSizeCalc(10, ratio),
              fontSize: mobileSizeCalc(16, ratio),
            }}
          >
            로그인
          </button>
        </form>
      </section>

      {/* 데스크탑(≥1024)에서만 보임 */}
      <section className="relative hidden desktop:block desktop:aspect-[1920/2086] desktop:w-full desktop:bg-[url('/bg_desktop2.png')] desktop:bg-[length:100%_auto] desktop:bg-top desktop:bg-repeat-y">
        <TopBar />

        <div
          className="desktop:flex desktop:flex-col desktop:items-center desktop:pt-60"
          style={{
            paddingTop: desktopSizeCalc(240, ratio),
          }}
        >
          <h1
            className="desktop:text-center desktop:font-bold desktop:text-white"
            style={{
              fontSize: desktopSizeCalc(50, ratio),
              lineHeight: desktopSizeCalc(50, ratio),
            }}
          >
            로그인
          </h1>

          <form
            onSubmit={handleSubmit}
            className="desktop:flex desktop:flex-col desktop:justify-center desktop:rounded-[25px] desktop:bg-[#16172D]/70"
            style={{
              marginBottom: desktopSizeCalc(80, ratio),
              marginTop: desktopSizeCalc(80, ratio),
              minHeight: desktopSizeCalc(600, ratio),
              width: desktopSizeCalc(1200, ratio),
              paddingLeft: desktopSizeCalc(50, ratio),
              paddingRight: desktopSizeCalc(50, ratio),
            }}
          >
            <label
              className="text-left font-medium text-white"
              style={{
                fontSize: desktopSizeCalc(16, ratio),
              }}
            >
              아이디
              <input
                type="text"
                className="w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent outline-none focus:border-b-gray-400 focus:ring-0"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                style={{
                  marginTop: desktopSizeCalc(10, ratio),
                  padding: desktopSizeCalc(8, ratio),
                  fontSize: desktopSizeCalc(16, ratio),
                }}
              />
            </label>

            {/* 비밀번호 입력 */}
            <label
              className="text-left font-medium text-white"
              style={{
                marginTop: desktopSizeCalc(32, ratio),
                fontSize: desktopSizeCalc(16, ratio),
              }}
            >
              비밀번호
              <input
                type="password"
                className="w-full border-x-0 border-b border-t-0 border-gray-400 bg-transparent outline-none focus:border-b-gray-400 focus:ring-0"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  marginTop: desktopSizeCalc(10, ratio),
                  padding: desktopSizeCalc(8, ratio),
                  fontSize: desktopSizeCalc(16, ratio),
                }}
              />
            </label>

            {/* 버튼은 submit 타입으로 둬야 Enter 시에도 동일 로직 */}
            <button
              type="submit"
              disabled={!id || !password}
              className="w-full bg-serve font-semibold text-white disabled:bg-gray-400"
              style={{
                marginTop: desktopSizeCalc(32, ratio),
                fontSize: desktopSizeCalc(16, ratio),
                paddingTop: desktopSizeCalc(16, ratio),
                paddingBottom: desktopSizeCalc(16, ratio),
              }}
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
