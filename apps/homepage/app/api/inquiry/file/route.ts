import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1) req.formData()로 FormData 파싱 :contentReference[oaicite:8]{index=8}
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // STEP 1. 파일 검증
  const fileType = file.type.split("/")[1];
  if (!["jpg", "png", "jpeg"].includes(fileType)) {
    return NextResponse.json({
      result: "failure",
      message: "올바르지 않은 파일타입입니다",
    });
  }

  // STEP 2. presignedURL 만들기
  const generatePresignedURL = process.env.S3_POST_URL as string;
  const presignedURLReq = await fetch(generatePresignedURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.LOGIN_AUTH_X_API_KEY as string,
      "x-api-secret": process.env.LOGIN_AUTH_X_API_SECRET as string,
    },
    body: JSON.stringify({
      ContentType: fileType,
    }),
  });
  const presignedURLResp = await presignedURLReq.json();

  const uploadURL = presignedURLResp.uploadUrl;
  const key = presignedURLResp.key;

  // STEP 3. 파일 업로드
  const uploadReq = await fetch(uploadURL, {
    method: "PUT",
    body: file,
  });

  if (!uploadReq.ok) {
    return NextResponse.json({
      result: "failure",
      message: "파일 업로드에 실패했습니다. 잠시 후 다시 시도해주세요",
    });
  }

  const resourceURL = process.env.S3_RESOURCE_URL + key;

  return NextResponse.json({
    result: "success",
    message: "",
    url: resourceURL,
  });
}
