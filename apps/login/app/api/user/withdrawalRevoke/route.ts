import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();

  // TODO: API 가 없어요..
  // result = await client.user.account.withdrawalRevoke(data);
}
