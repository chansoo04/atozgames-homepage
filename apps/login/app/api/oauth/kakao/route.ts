import { NextRequest, NextResponse } from "next/server";

// TODO: 카카오부터 내일..
export async function POST(request: NextRequest) {
  const formData: FormData = {};

  const data = await request.json();

  console.log(data, "data");
}
