import Image from "next/image";
import Link from "next/link";

export default function IconButton({
  link,
  icon,
  text,
}: {
  link: string;
  icon: string;
  text: string;
}) {
  return (
    <Link
      href={link}
      className="relative flex w-full rounded-md border border-gray-300 bg-[#e5e9f9] p-3"
    >
      <div className="flex w-full items-center justify-center gap-4">
        <div className="absolute left-5 top-3 flex items-center justify-center">
          <Image width={20} height={20} src={icon} alt={text} />
        </div>
        <div className="mt-[3px] flex items-center text-left">{text}</div>
      </div>
    </Link>
  );
}
