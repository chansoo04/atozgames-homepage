import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data, "data");

  const url = process.env.GRPC_API_URL + "user.UserService/GetUser";
  const req = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({ userId: data.options.userId }),
  });

  if (!req.ok) {
    throw new Error(req.statusText);
  }

  const res = await req.json();

  return NextResponse.json(res);
}
