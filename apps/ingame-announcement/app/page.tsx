export default function Page() {
  return (
    <main
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        // backgroundImage: `url('/background.png')`,
        // backgroundSize: "100% auto", // 가로 기준 꽉 채움
        // backgroundPosition: "center center", // 세로 중앙 정렬
        // backgroundRepeat: "no-repeat",
      }}
      className="overflow-hidden bg-black"
    >
      {/*<div className="size-full px-[6.3vw] pb-[10vh] pt-[5.6vh] text-white">asdfasdf</div>*/}
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
      <div className="text-white">테스트</div>
    </main>
  );
}
