import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // 1) req.formData()로 FormData 파싱 :contentReference[oaicite:8]{index=8}
  const formData = await request.formData();
  console.log(formData, "formData");
  const file = formData.get("file") as File;
  console.log(file, "file");

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
  console.log(presignedURLReq, "presignedURLReq");
  const presignedURLResp = await presignedURLReq.json();
  console.log(presignedURLResp, "presignedURLResp");

  // 2) 파일 데이터 접근 (Blob → ArrayBuffer 등으로 변환)
  const arrayBuffer = await file.arrayBuffer();
  console.log(arrayBuffer, "arrayBuffer");
  // ...파일 저장 로직(예: AWS S3 업로드, 로컬 디스크 저장 등)

  return NextResponse.json({
    result: "success",
  });
}
