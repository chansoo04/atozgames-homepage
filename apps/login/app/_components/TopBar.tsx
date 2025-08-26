"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopBar({
  visible,
  type,
  actionUrl,
}: {
  visible: boolean;
  type: "CLOSE" | "BACK";
  actionUrl?: string;
}) {
  const router = useRouter();

  if (!visible) {
    return null;
  }

  if (type === "CLOSE") {
    return (
      <div className="absolute right-0 top-0 flex w-full items-center justify-end gap-4 px-4 py-2">
        <Link className="flex size-[40px] items-center bg-transparent" href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>
    );
  }

  if (type === "BACK") {
    return (
      <div className="absolute left-0 top-0 flex w-full items-center justify-start gap-4 px-4 py-2">
        <button
          className="size-[40px] bg-transparent"
          onClick={() => {
            if (actionUrl) {
              router.push(actionUrl!);
            } else {
              router.back();
            }
          }}
        >
          <svg
            className="size-3 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 8 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"
            />
          </svg>
        </button>
      </div>
    );
  }

  return null;
}
