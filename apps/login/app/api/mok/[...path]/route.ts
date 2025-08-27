import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const { path = [] } = params;

  if (path.length === 0) {
    return NextResponse.json({ message: "[POST] Base /api/mok endpoint" });
  }
  console.log(params, "params");
  const nextUrl = path.join("/");

  try {
    const result = null;

    // switch (nextUrl) {
    //   case "mok_std_request":
    //     const
    // }
  } catch (error: any) {}

  return NextResponse.json({
    hi: "bye",
  });
}
