import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY!,
    redirect_uri: process.env.KAKAO_REDIRECT_URI!,
    response_type: "code",
  });
  return NextResponse.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
}
