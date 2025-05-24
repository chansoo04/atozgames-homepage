import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();

  const url = process.env.LOGIN_AUTH_URL + "web.WebAuthService/AccountSignIn";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
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
    token: responseData.token,
    uid: responseData.account.uid,
  });
}
