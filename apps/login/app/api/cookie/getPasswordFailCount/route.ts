import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession, IronSession } from "iron-session";

interface CookieKeys {
  [key: string]: string;
}
const UTILITY_COOKIE = "GP_UTILITY_COOKIE";
const PASSWORD_FAIL_COUNT = "PASSWORD_FAIL_COUNT";

export async function POST(request: NextRequest) {
  const cookiePassword = process.env.COOKIE_PASSWORD;
  const cookie = await getIronSession<CookieKeys>(cookies() as any, {
    cookieName: UTILITY_COOKIE,
    password: cookiePassword!,
    cookieOptions: {
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  });
  console.log(cookie, "cookie");

  const count = cookie[PASSWORD_FAIL_COUNT];
  return NextResponse.json({ PASSWORD_FAIL_COUNT: Number(count || 0) });
}
