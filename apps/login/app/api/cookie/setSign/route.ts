import { NextRequest, NextResponse } from "next/server";
import { setSign } from "../../auth/auth.service";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const result = await setSign(data.sign);

  return NextResponse.json(result);
}
