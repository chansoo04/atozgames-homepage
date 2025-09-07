"use client";

import "./modal.css";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useRouter } from "next/navigation";

const locales = ["ko", "en", "ch"] as const;
type LocaleTypes = (typeof locales)[number];

type ModalType = "DEFAULT" | "ROUTING" | "ACTION";
type ModalContextType = {
  locale: LocaleTypes;
  isOpen: boolean;
  message: string[];
  type: ModalType;
  routingUrl?: string;
  btnText?: string;
  action: () => void;
  openModal: (params: {
    msg: string[];
    locale?: LocaleTypes;
    type?: ModalType;
    routingUrl?: string;
    btnText?: string;
    action?: () => void | Promise<void>;
  }) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};

const PORTAL_CONTAINER_ID = "app-modal-portal-root";

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [locale, setLocale] = useState("ko" as LocaleTypes);
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState<string[]>([]);
  const [type, setType] = useState<ModalType>("DEFAULT");
  const [routingUrl, setRoutingUrl] = useState<string | undefined>(undefined);
  const [btnText, setBtnText] = useState<string | undefined>(undefined);
  const [action, setAction] = useState<() => void>(() => () => {});
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  // body 끝에 포털 컨테이너 1회 생성 (컨테이너에는 클래스 주지 않음)
  useEffect(() => {
    if (typeof document === "undefined") return;

    let el = document.getElementById(PORTAL_CONTAINER_ID) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = PORTAL_CONTAINER_ID;
      el.role = "dialog";
      el.ariaModal = "true";
      el.onclick = () => {
        closeModal();
      };
      document.body.appendChild(el);
    }
    setPortalEl(el);

    return () => {
      // 컨테이너는 재사용 원하면 유지, 필요 시 제거
      // el?.parentNode?.removeChild(el);
    };
  }, []);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");

    const el = document.getElementById(PORTAL_CONTAINER_ID) as HTMLDivElement | null;
    if (el) {
      if (isOpen) {
        el.classList.add("modal-open");
      } else {
        el.classList.remove("modal-open");
      }
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const openModal = (params: {
    msg: string[];
    locale?: LocaleTypes;
    type?: ModalType;
    routingUrl?: string;
    btnText?: string;
    action?: () => void;
  }) => {
    setMessage(params.msg);
    setLocale(params.locale ?? "ko");
    setType(params.type ?? "DEFAULT");
    setRoutingUrl(params.routingUrl);
    setBtnText(params.btnText);
    setAction(() => params.action ?? (() => {}));
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handlePrimary = useCallback(() => {
    try {
      action?.();
      if (type === "ROUTING" && routingUrl) router.push(routingUrl);
    } finally {
      closeModal();
    }
  }, [action, router, routingUrl, type]);

  // 🔥 오버레이를 JSX로 직접 렌더 → Tailwind JIT가 100% 인식
  const overlay = (
    <div
      className="z-50 rounded-md bg-white"
      style={{ width: "45vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex w-full items-center justify-center border-b-2 border-[#e8e8e8] px-4 py-3">
        <span className="text-xl font-bold">안내</span>
        <button
          className="absolute inset-y-0 right-5 text-gray-500 hover:text-gray-700"
          aria-label="닫기"
          onClick={closeModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-5">
        <div className="flex flex-col items-center justify-center gap-2 py-4 text-sm font-semibold">
          {(message?.length ? message : [""]).map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>

        <div className="mt-5 flex w-full items-center justify-center gap-3 pb-4">
          <div
            role="button"
            aria-label="닫기"
            className="flex h-9 items-center justify-center rounded-[4px] bg-[#2d56ff]"
            tabIndex={0}
            style={{ width: "100%" }}
            onClick={handlePrimary}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePrimary()}
          >
            <div className="text-sm font-semibold text-white">{btnText ?? "닫기"}</div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );

  return (
    <ModalContext.Provider
      value={
        {
          locale,
          isOpen,
          message,
          type,
          routingUrl,
          btnText,
          action,
          openModal,
          closeModal,
        } as ModalContextType
      }
    >
      {children}
      {/* 포털 컨테이너는 비어있고, 오버레이/카드는 JSX에서 렌더 → 중앙 정렬 확정 */}
      {isOpen && portalEl && ReactDOM.createPortal(overlay, portalEl)}
    </ModalContext.Provider>
  );
};
