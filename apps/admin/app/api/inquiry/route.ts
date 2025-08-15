import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accountIdCookie = request.cookies.get("account_id");

  const account_id = accountIdCookie?.value;

  if (!account_id) {
    return NextResponse.json({
      result: "failure",
      message: "잘못된 요청입니다",
    });
  }

  const inquiryGetURL = process.env.LOGIN_AUTH_URL + "cs.CustomerService/GetCustomerQuestions";
  const response = await fetch(inquiryGetURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
    },
    body: JSON.stringify({
      account_id: account_id,
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
    inquiry: data.customer_questions,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const accountIdCookie = request.cookies.get("account_id");
  const account_id = accountIdCookie?.value;

  if (!account_id || !body.title || !body.content) {
    return NextResponse.json({
      result: "failure",
      message: "잘못된 요청입니다",
    });
  }

  const inquiryPostURL = process.env.LOGIN_AUTH_URL + "cs.CustomerService/CreateCustomerQuestion";
  const response = await fetch(inquiryPostURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
    },
    body: JSON.stringify({
      account_id: account_id,
      title: body.title,
      content: body.content,
      append: JSON.stringify(body.appendFile),
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
  });
}
