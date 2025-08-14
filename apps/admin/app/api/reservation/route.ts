import { NextResponse } from "next/server";

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // getMonth()는 0~11
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function POST(request: Request) {
  const data = await request.json();
  const now = new Date();
  data.created_at = formatDate(now);

  const url = process.env.LOGIN_AUTH_URL + "gm.ReservationService/CreateReservation";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return NextResponse.json(
      { result: "failure", message: "알 수 없는 이유로 사전예약에 실패했습니다" },
      { status: 400 },
    );
  }

  const responseData = await response.json();

  if (!responseData.success) {
    return NextResponse.json(
      {
        result: "failure",
        message: "사전예약에 실패했습니다",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    result: "success",
  });
}
