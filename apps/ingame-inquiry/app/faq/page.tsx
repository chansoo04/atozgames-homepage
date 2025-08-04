import ClientComponent from "./ClientComponent";

export default async function Page() {
  // TODO: api 연결하기
  const faqs = [
    {
      id: 1,
      title: "제목1",
      content:
        "제목1제목1제목1제목12025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 2,
      title: "제목2",
      content:
        "제목2제목2제목2제목22025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 3,
      title: "제목3",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 4,
      title: "제목4",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 5,
      title: "제목5",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 6,
      title: "제목6",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 7,
      title: "제목7",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 8,
      title: "제목8",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 9,
      title: "제목9",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 10,
      title: "제목10",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
  ];

  return <ClientComponent faqs={faqs} />;
}
