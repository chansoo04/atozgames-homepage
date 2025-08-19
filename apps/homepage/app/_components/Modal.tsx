import { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  // 모달 열릴 때 스크롤 잠금, 닫힐 때 해제
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      // 컴포넌트 언마운트 시 반드시 해제
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} aria-hidden="true" />

      {/* 모달 내용 */}
      {children}
    </div>,
    document.body,
  );
};

export default Modal;
