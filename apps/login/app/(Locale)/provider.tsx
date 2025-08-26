"use client";

import { ModalProvider } from "common/modal";
import { ToastProvider } from "common/toast";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ModalProvider>{children}</ModalProvider>
    </ToastProvider>
  );
}
