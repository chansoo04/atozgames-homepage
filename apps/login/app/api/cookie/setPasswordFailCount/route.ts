import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const PASSWORD_FAIL_COUNT = "PASSWORD_FAIL_COUNT";

interface CookieKeys {
  [key: string]: string;
}
const UTILITY_COOKIE = "GP_UTILITY_COOKIE";

export async function POST(request: NextRequest) {
  const data = await request.json();

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

  cookie[PASSWORD_FAIL_COUNT] = String(data.count);
  await cookie.save();

  return NextResponse.json({ PASSWORD_FAIL_COUNT: data.count });
}
