export default function Loading() {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center gap-4 bg-[#b9c2e2]"
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>

      <div
        className="size-5 animate-[loading-bounce_1s_ease-in-out_infinite] rounded-full bg-[#005fcc] opacity-25 motion-reduce:animate-none"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="size-5 animate-[loading-bounce_1s_ease-in-out_infinite] rounded-full bg-[#005fcc] opacity-25 motion-reduce:animate-none"
        style={{ animationDelay: "0.1s" }}
      />
      <div
        className="size-5 animate-[loading-bounce_1s_ease-in-out_infinite] rounded-full bg-[#005fcc] opacity-25 motion-reduce:animate-none"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="size-5 animate-[loading-bounce_1s_ease-in-out_infinite] rounded-full bg-[#005fcc] opacity-25 motion-reduce:animate-none"
        style={{ animationDelay: "0.3s" }}
      />

      {/* styled-jsx 없이 일반 <style> 사용 → TS 오류 없음 */}
      <style>{`
        @keyframes loading-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.25; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
