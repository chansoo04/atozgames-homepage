import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      {
        result: "failure",
        message: "존재하지 않는 정보입니다",
      },
      {
        status: 400,
      },
    );
  }

  const url = process.env.AWS_API_URL + "user.AccountService/GetAccount";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({ firebase_uid: uid }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        result: "failure",
        message: "알 수 없는 오류로 정보를 불러올 수 없습니다",
      },
      { status: 400 },
    );
  }

  const data = await response.json();

  return NextResponse.json({
    result: "success",
    account: data.account,
  });
}
