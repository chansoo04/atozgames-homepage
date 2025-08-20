import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const faqGetURL = process.env.AWS_API_URL + "cs.FAQService/GetFAQs";
  const response = await fetch(faqGetURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
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
    faq: data.faq_list,
  });
}
