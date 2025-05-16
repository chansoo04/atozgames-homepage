import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams, "searchParams");
  const code = searchParams.get("code")!;
  console.log(code, "code");

  // TODO: STEP1. 서버로 code값을 보냄(createCustomToken) -> 파이어베이스 로그인 할 수 있는 토큰을 줌
  // TODO: STEP2. firebase 토큰을 받아서 signIn을 다시 해야해(firebase login 필요, signinWithCustom Token을 해야한다) -> 이거 하면 credentials가 나옴
  // TODO: STEP3. credential을 가지고 atoz서버 login을 하면 됨

  // 토큰 교환
  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_REST_API_KEY!,
      redirect_uri: process.env.KAKAO_REDIRECT_URI!,
      code,
    }),
  });
  console.log(tokenRes, "tokenRes");
  const { access_token } = await tokenRes.json();
  console.log(access_token, "access_token");

  // 프로필 조회
  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await profileRes.json();

  // 예: 세션 설정 후 리디렉션
  return NextResponse.json(profile);
}
