"use client";
import { useState, useEffect } from "react";

type WindowSize = {
  width: number;
  height: number;
  ratio: number;
};

export default function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? Math.round(window.innerWidth) : 0,
    height: typeof window !== "undefined" ? Math.round(window.innerHeight) : 0,
    ratio:
      typeof window !== "undefined"
        ? Math.round((window.innerHeight / window.innerWidth) * 100) / 100
        : 0,
  });

  useEffect(() => {
    // 리사이즈 시 상태 갱신
    const handleResize = () =>
      setSize({
        width: Math.round(window.innerWidth),
        height: Math.round(window.innerHeight),
        ratio: Math.round((window.innerHeight / window.innerWidth) * 100) / 100,
      });

    handleResize(); // 첫 마운트 시 값 동기화
    window.addEventListener("resize", handleResize);

    // cleanup ― 메모리 누수 방지 :contentReference[oaicite:0]{index=0}
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
