"use client";
import { useState } from "react";
import Link from "next/link";

export default function Floating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-10 right-10 text-white">
      {!isOpen ? (
        <button type="button" onClick={() => setIsOpen(true)}>
          오픈하기
        </button>
      ) : (
        <div className="relative">
          <button
            type="button"
            className="absolute bottom-0 right-0"
            onClick={() => setIsOpen(false)}
          >
            닫기
          </button>
          <Link href="/faq" className="absolute bottom-0 right-20">
            FAQ
          </Link>
          <Link href="/inquiry" className="absolute bottom-20 right-20 w-full">
            문의하기
          </Link>
          <Link href="/" className="absolute bottom-20 right-0">
            목록 보기
          </Link>
        </div>
      )}
    </div>
  );
}
