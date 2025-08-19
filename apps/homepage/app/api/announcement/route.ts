import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const announcementGetURL = process.env.LOGIN_AUTH_URL + "gm.NoticeService/GetNoticeList";
  const response = await fetch(announcementGetURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
    },
  });

  const data = await response.json();

  if (!data.success) {
    return NextResponse.json(
      {
        result: "failure",
        message: "알 수 없는 오류로 정보를 불러올 수 없습니다",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    result: "success",
    announcement: data.notice,
  });
}
