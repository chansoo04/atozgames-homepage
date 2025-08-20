import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
  const accountIdCookie = request.cookies.get("account_id");
  const account_id = accountIdCookie?.value;
  const { id } = params;

  if (!account_id || !id) {
    return NextResponse.json({
      result: "failure",
      message: "잘못된 요청입니다",
    });
  }

  const inquiryGetURL = process.env.AWS_API_URL + "cs.CustomerService/GetCustomerQuestion";
  const response = await fetch(inquiryGetURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({
      account_id: account_id,
      cs_id: id,
    }),
  });

  const data = await response.json();

  if (data.success === false) {
    return NextResponse.json({
      result: "failure",
      message: data.error_message ?? "",
    });
  }

  return NextResponse.json({
    result: "success",
    inquiry: data.customer_question,
  });
}
