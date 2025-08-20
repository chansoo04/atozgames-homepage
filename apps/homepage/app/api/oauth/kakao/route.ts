import { NextResponse } from "next/server";

// 카카오 로그인 코드로 콜백을 받아서, atoz custom token 만들기
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")!;

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

  const { access_token, id_token, refresh_token, ...otherResponse } = await tokenRes.json();

  const atozUrl = process.env.AWS_API_URL + "web.WebAuthService/CreateCustomToken";
  const atozRes = await fetch(atozUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({
      token: access_token,
      provider: "kakao",
    }),
  });

  if (!atozRes.ok) {
    if (atozRes.status === 404) {
      return NextResponse.json(
        {
          result: "failure",
          message: "존재하지 않는 계정입니다",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { result: "failure", message: "알 수 없는 이유로 로그인이 실패했습니다" },
      { status: 400 },
    );
  }

  const atozResResult = await atozRes.json();

  // 예: 세션 설정 후 리디렉션
  const redirect_url =
    process.env.NEXT_PUBLIC_ATOZ_HOMEPAGE_URL +
    "login/kakao?custom_token=" +
    atozResResult.custom_token;
  return NextResponse.redirect(redirect_url);
}

export async function POST(request: Request) {
  const data = await request.json();

  const url = process.env.AWS_API_URL + "web.WebAuthService/AccountSignIn";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({ credential: JSON.stringify(data) }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return NextResponse.json(
        {
          result: "failure",
          message: "존재하지 않는 계정입니다",
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { result: "failure", message: "알 수 없는 이유로 로그인이 실패했습니다" },
      { status: 400 },
    );
  }

  const responseData = await response.json();

  return NextResponse.json({
    result: "success",
    account_id: responseData.account.account_id,
    token: responseData.token,
    uid: responseData.account.uid,
  });
}
