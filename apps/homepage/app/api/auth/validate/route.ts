import { NextResponse, NextRequest } from "next/server";

// token validation
export async function GET(request: NextRequest) {
  // 'token'이라는 이름의 쿠키를 꺼냅니다.
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value; // 없으면 undefined

  const uidCookie = request.cookies.get("uid");
  const uid = uidCookie?.value;

  if (!token || !uid) {
    return NextResponse.json({
      result: "failure",
      message: "Invalid token",
    });
  }

  const tokenValidationURL = process.env.AWS_API_URL + "web.WebAuthService/VerifyIdToken";
  const response = await fetch(tokenValidationURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({
      uid,
      token,
    }),
  });

  const data = await response.json();

  if (data.success === false) {
    return NextResponse.json({
      result: "failure",
      message: data.error_message,
    });
  }

  return NextResponse.json({
    result: "success",
  });
}
