import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")!;
  const state = searchParams.get("state")!;
  console.log(code, "code");
  console.log(state, "state");

  // TODO: STEP1. 서버로 code값을 보냄(createCustomToken) -> 파이어베이스 로그인 할 수 있는 토큰을 줌
  // TODO: STEP2. firebase 토큰을 받아서 signIn을 다시 해야해(firebase login 필요, signinWithCustom Token을 해야한다) -> 이거 하면 credentials가 나옴
  // TODO: STEP3. credential을 가지고 atoz서버 login을 하면 됨

  // 토큰 교환
  const tokenRes = await fetch(
    `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${state}`,
  );
  console.log(tokenRes, "tokenRes");
  const { access_token } = await tokenRes.json();
  console.log(access_token, "access_token");

  // 프로필 조회
  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await profileRes.json();

  return NextResponse.json(profile);
}
