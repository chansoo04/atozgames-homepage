import { NextRequest, NextResponse } from "next/server";
import {
  GpCookie,
  GpSignList,
  GpSignProvider,
  GpSignProviderConverter,
  PROVIDER_COOKIE_MAP,
} from "common/cookie";
import { getSessionByProvider, providerValidator, providerToString } from "../cookie.service";

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data, "data");

  const isValid = providerValidator(data.provider);
  if (isValid === false) {
    throw new Error("Invalid provider");
  }
  data.provider = providerToString(data.provider);
  const session = await getSessionByProvider(data.provider);
  console.log(session, "session");

  return NextResponse.json(session.list);
}
