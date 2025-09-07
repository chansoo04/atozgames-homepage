import { NextRequest, NextResponse } from "next/server";
import { GpCookie, GpSignList, GpSignProvider, PROVIDER_COOKIE_MAP } from "common/cookie";
import { getSessionByProvider } from "../cookie.service";

export async function POST(request: NextRequest) {
  const result: GpCookie = {};
  for (const provider of Object.keys(PROVIDER_COOKIE_MAP)) {
    const session = await getSessionByProvider(provider);
    result[provider as keyof GpCookie] = session || [];
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Cookie not found");
  }

  console.log(result, "result");

  return NextResponse.json(result);
}
