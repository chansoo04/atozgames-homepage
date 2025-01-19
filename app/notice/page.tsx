import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description: "아토즈포커의 최신 이벤트와 중요 이슈를 확인할 수 있는 게시판입니다.",
  openGraph: {
    title: "공지사항",
    description: "아토즈포커의 최신 이벤트와 중요 이슈를 확인할 수 있는 게시판입니다.",
    siteName: "아토즈포커 공지사항",
  },
};

export default function NoticePage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen px-5 md:px-20 py-10">
      <h1 className="text-2xl font-bold mb-6">공지사항</h1>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <ul className="flex space-x-5 border-b md:border-none pb-2 md:pb-0">
          <li className="font-bold border-b-2 border-blue-500">전체</li>
          <li className="hover:text-blue-500 cursor-pointer">공지</li>
          <li className="hover:text-blue-500 cursor-pointer">점검</li>
          <li className="hover:text-blue-500 cursor-pointer">GM소식</li>
        </ul>
        <div className="mt-4 md:mt-0">
          <input
            type="text"
            placeholder="제목 검색"
            className="border rounded px-3 py-2 w-full md:w-64"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded ml-2">검색</button>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded shadow">
        <ul>
          {[
            { type: "공지", title: "1/19(일) 미라클 타임 진행 시간 정정 안내", date: "2025.01.17" },
            {
              type: "점검",
              title: "[점검완료] 1/17(금) 챌린저스 1~4 월드 채널점검",
              date: "2025.01.17",
            },
            {
              type: "점검",
              title: "[패치완료] 1/17(금) ver1.2.399 마이너(4) 패치",
              date: "2025.01.16",
            },
            {
              type: "점검",
              title: "[패치완료] 1/16(목) ver1.2.399 마이너버전(3) 패치",
              date: "2025.01.16",
            },
            { type: "공지", title: "챔피언 레이드 이용제한 보상 안내", date: "2025.01.16" },
          ].map((notice, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b last:border-none px-5 py-4"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded text-white text-sm ${
                    notice.type === "공지" ? "bg-blue-500" : "bg-green-500"
                  }`}
                >
                  {notice.type}
                </span>
                <p>{notice.title}</p>
              </div>
              <span className="text-gray-500 text-sm">{notice.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center space-x-2 mt-6">
        <button className="px-3 py-1 border rounded text-gray-500">1</button>
        <button className="px-3 py-1 border rounded text-gray-500">2</button>
        <button className="px-3 py-1 border rounded text-gray-500">3</button>
        <button className="px-3 py-1 border rounded text-gray-500">4</button>
        <button className="px-3 py-1 border rounded text-gray-500">5</button>
      </div>
    </div>
  );
}
