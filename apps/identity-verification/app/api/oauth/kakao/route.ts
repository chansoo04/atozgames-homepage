import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("시작!!!!!!!!");
  const url = new URL(request.url);
  const authCode = url.searchParams.get("code") as string;
  const wv = url.searchParams.get("state") as string;
  console.log(wv, "wV");
  console.log(url, "url");

  const hostUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL;
  const redirectUri = `${hostUrl}kakao?code=${authCode}&wv=${wv}`;
  console.log("REDIRECT!!!!", redirectUri);

  return NextResponse.redirect(redirectUri);
}
