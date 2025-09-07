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
  // ⬇️ 액션은 동기/비동기 모두 지원
  action: (() => void | Promise<void>) | null;
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

  const [locale, setLocale] = useState<LocaleTypes>("ko");
  const [isOpen, setOpen] = useState(false);
  const [message, setMessage] = useState<string[]>([]);
  const [type, setType] = useState<ModalType>("DEFAULT");
  const [routingUrl, setRoutingUrl] = useState<string | undefined>(undefined);
  const [btnText, setBtnText] = useState<string | undefined>(undefined);

  // ⬇️ 액션은 null 가능 + 비동기 허용
  const [action, setAction] = useState<(() => void | Promise<void>) | null>(null);

  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);

  // ⬇️ 액션 실행 중 버튼/백드롭 닫힘 방지
  const [busy, setBusy] = useState(false);

  // 포털 컨테이너 1회 생성
  useEffect(() => {
    if (typeof document === "undefined") return;

    let el = document.getElementById(PORTAL_CONTAINER_ID) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = PORTAL_CONTAINER_ID;
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      document.body.appendChild(el);
    }
    setPortalEl(el);

    return () => {
      // 재사용할 거면 제거하지 않음
    };
  }, []);

  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, busy]);

  // 바디 스크롤 잠금 + 컨테이너 클래스 토글
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");

    const el = document.getElementById(PORTAL_CONTAINER_ID) as HTMLDivElement | null;
    if (el) {
      if (isOpen) el.classList.add("modal-open");
      else el.classList.remove("modal-open");
    }

    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  // ⬇️ 백드롭 클릭으로 닫기 (busy일 땐 닫히지 않게)
  useEffect(() => {
    if (!portalEl) return;
    const onBackdropClick = (e: MouseEvent) => {
      if (e.target === portalEl && !busy) closeModal();
    };
    portalEl.addEventListener("click", onBackdropClick);
    return () => portalEl.removeEventListener("click", onBackdropClick);
  }, [portalEl, busy]);

  const openModal = (params: {
    msg: string[];
    locale?: LocaleTypes;
    type?: ModalType;
    routingUrl?: string;
    btnText?: string;
    action?: () => void | Promise<void>;
  }) => {
    setMessage(params.msg);
    setLocale(params.locale ?? "ko");
    setType(params.type ?? "DEFAULT");
    setRoutingUrl(params.routingUrl);
    setBtnText(params.btnText);
    // ⬇️ 함수 “참조”를 그대로 저장 (실행 X)
    setAction(() => params.action ?? null);
    setOpen(true);
  };

  const closeModal = () => {
    if (busy) return; // 실행 중이면 닫기 금지(선택)
    setOpen(false);
    setAction(null);
    setBusy(false);
  };

  const handlePrimary = useCallback(async () => {
    try {
      setBusy(true);
      // ⬇️ 비동기/동기 모두 지원
      await action?.();

      if (type === "ROUTING" && routingUrl) {
        router.push(routingUrl);
      }
    } catch (err) {
      // 필요 시 에러 토스트/로깅
      console.error("modal action error:", err);
    } finally {
      setBusy(false);
      closeModal();
    }
  }, [action, router, routingUrl, type]);

  // 카드 내용
  const card = (
    <div
      className="z-50 rounded-md bg-white"
      style={{ width: "45vh" }}
      onClick={(e) => e.stopPropagation()} // 내부 클릭은 백드롭으로 전파 방지
    >
      <div className="relative flex w-full items-center justify-center border-b-2 border-[#e8e8e8] px-4 py-3">
        <span className="text-xl font-bold">안내</span>
        <button
          className="absolute inset-y-0 right-5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          aria-label="닫기"
          onClick={closeModal}
          disabled={busy}
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
          <button
            type="button"
            aria-label="확인"
            className="flex h-9 w-full items-center justify-center rounded-[4px] bg-[#2d56ff] text-sm font-semibold text-white disabled:opacity-50"
            onClick={handlePrimary}
            disabled={busy}
          >
            {busy ? "처리중..." : (btnText ?? "닫기")}
          </button>
        </div>
      </div>
    </div>
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
      {isOpen && portalEl && ReactDOM.createPortal(card, portalEl)}
    </ModalContext.Provider>
  );
};
