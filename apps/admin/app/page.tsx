"use client";
import Clarity from "@microsoft/clarity";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center bg-slate-100">
      메인 페이지
      <button type="button" onClick={() => Clarity.event("signupStep")}>
        ㅁㄴㅇㄹㅁㄴㅇㄹ
      </button>
    </div>
  );
}
