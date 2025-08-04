import ClientComponent from "./ClientComponent";

export default async function Page() {
  // TODO: api 연결하기
  const announcements = [
    {
      id: 1,
      title: "[이벤트] 아토즈 포커 런칭 기념 이벤트",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 2,
      title: "[이벤트] 아토즈 포커 런칭 기념 이벤트",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 3,
      title: "[이벤트] 아토즈 포커 런칭 기념 이벤트",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 4,
      title: "[이벤트] 아토즈 포커 런칭 기념 이벤트",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
    {
      id: 5,
      title: "[이벤트] 아토즈 포커 런칭 기념 이벤트",
      content: "2025.03.22에 진행한 아토즈 포커 런칭 기념 이벤트 당첨자를 안내드립니다",
      created_at: "2025.04.22",
    },
  ];
  return <ClientComponent announcements={announcements} />;
}
