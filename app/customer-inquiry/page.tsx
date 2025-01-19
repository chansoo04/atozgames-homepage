import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "1:1 문의",
  description: "아토즈포커 유저가 고객센터에 자유롭게 신고, 문의, 질문을 할 수 있는 페이지입니다.",
  openGraph: {
    title: "1:1 문의",
    description:
      "아토즈포커 유저가 고객센터에 자유롭게 신고, 문의, 질문을 할 수 있는 페이지입니다.",
    siteName: "아토즈포커 1:1 문의",
  },
};

export default function CustomerInquiryPage() {
  return (
    <div className="bg-white text-gray-900 min-h-screen px-5 md:px-20 py-10">
      <h1 className="text-2xl font-bold mb-6">1:1 문의</h1>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <ul className="flex space-x-5 border-b md:border-none pb-2 md:pb-0">
          <li className="font-bold border-b-2 border-blue-500">전체</li>
          <li className="hover:text-blue-500 cursor-pointer">내 문의내역</li>
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

      {/* 문의 목록 */}
      <div className="bg-white rounded shadow">
        <ul>
          {[
            { type: "진행중", title: "결제 오류 문의", date: "2025.01.17" },
            { type: "완료", title: "계정 복구 요청", date: "2025.01.16" },
            { type: "완료", title: "게임 충전 관련 문의", date: "2025.01.15" },
          ].map((inquiry, index) => (
            <li
              key={index}
              className="flex justify-between items-center border-b last:border-none px-5 py-4"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded text-white text-sm ${
                    inquiry.type === "진행중" ? "bg-yellow-500" : "bg-green-500"
                  }`}
                >
                  {inquiry.type}
                </span>
                <p>{inquiry.title}</p>
              </div>
              <span className="text-gray-500 text-sm">{inquiry.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* "1:1 문의하기" 버튼 */}
      <div className="flex justify-end mt-6">
        <button className="bg-blue-500 text-white px-6 py-3 rounded text-lg font-bold">
          1:1 문의하기
        </button>
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
