"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

type ToastType = "info" | "error" | "success";

type ToastContextType = {
  isOpen: boolean;
  message: string;
  type: ToastType;
  displayTime: number;
  openToast: (params: { msg: string; type?: ToastType; displayTime?: number }) => void;
  closeToast: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info"); // 대소문자 통일
  const [displayTime, setDisplayTime] = useState(1000);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const closeToast = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, []);

  const openToast: ToastContextType["openToast"] = useCallback(
    ({ msg, type = "info", displayTime = 1000 }) => {
      clearTimer();
      setMessage(msg);
      setType(type);
      setDisplayTime(displayTime);
      setOpen(true);

      // 자동 닫힘 타이머 세팅
      timerRef.current = window.setTimeout(() => {
        setOpen(false);
        timerRef.current = null;
      }, displayTime);
    },
    [],
  );

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => clearTimer();
  }, []);

  // UI: Provider 자체가 토스트를 렌더 (포털 불필요, Tailwind 스코프 이슈 회피)
  // 하단 중앙 고정. 클릭은 토스트에만 반응하도록 포인터 이벤트 제어.
  return (
    <ToastContext.Provider
      value={{
        isOpen,
        message,
        type,
        displayTime,
        openToast,
        closeToast,
      }}
    >
      {children}

      {/* 토스트 앵커 - 하단 중앙, 최상위 레이어 */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2147483647] flex items-end justify-center pb-[60px]">
        {isOpen && (
          <div
            role="status"
            aria-live="polite"
            className={[
              "pointer-events-auto w-[80vw] min-w-[344px] max-w-[568px]",
              "rounded-md p-[16px] text-white",
              "shadow-lg transition-all duration-300",
              "translate-y-0 opacity-100",
              type === "info" ? "bg-[#454549]" : "",
              type === "error" ? "bg-[#dc362e]" : "",
              type === "success" ? "bg-[#0064ff]" : "",
            ].join(" ")}
          >
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};
