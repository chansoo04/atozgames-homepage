import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const authCode = url.searchParams.get("code") as string;
  const wv = url.searchParams.get("state") as string;

  const hostUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL;
  const redirectUri = `${hostUrl}/naver?code=${authCode}&wv=${wv}`;

  return NextResponse.redirect(redirectUri);
}
