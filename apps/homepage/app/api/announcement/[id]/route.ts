import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const url = process.env.AWS_API_URL + "gm.NoticeService/GetNotice";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { result: "failure", message: "알 수 없는 이유로 공지사항 정보를 가져올 수 없습니다" },
      { status: 400 },
    );
  }

  const responseData = await response.json();

  if (!responseData.success) {
    if (responseData.error_message.includes("not found")) {
      return NextResponse.json(
        {
          result: "failure",
          message: "존재하지 않는 ID입니다",
        },
        { status: 404 },
      );
    } else {
      return NextResponse.json(
        { result: "failure", message: "공지사항 정보를 가져올 수 없습니다" },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({
    result: "success",
    announcement: responseData.notice,
  });
}
