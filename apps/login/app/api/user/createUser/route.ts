import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.warn("!!createuser 시작합니다!!");
  const data = await request.json();
  console.log(data, "DATA");

  const url = process.env.GRPC_API_URL + "user.UserService/CreateUser";
  const req = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify(data),
  });

  console.log(req, "req");

  if (!req.ok) {
    throw new Error(req.statusText);
  }

  const res = await req.json();
  console.log(res, "res");

  return NextResponse.json(res);
}
