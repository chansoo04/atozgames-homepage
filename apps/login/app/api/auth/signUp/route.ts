import { NextRequest, NextResponse } from "next/server";
import * as AUTH from "../auth.service";
import { GpSign } from "common/cookie";

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data, "data");

  if (!data.provider) {
    return NextResponse.json({
      error: "provider is null",
    });
  }

  if (!data.credential) {
    return NextResponse.json({
      error: "credential is null",
    });
  }

  if (!data.userId) {
    return NextResponse.json({
      error: "userId is null",
    });
  }

  const url = process.env.GRPC_API_URL + "game.AuthService/AccountSignUp";
  console.log(url, "url");
  const req = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify(data),
  });

  console.log(req, "req!!!");

  if (!req.ok) {
    throw new Error(req.statusText);
  }

  const res = await req.json();
  console.log(res, "res");
  if (!res.success) {
    return NextResponse.json({
      error: res.errorMessage,
    });
  }

  const gpSign = await AUTH.getSign(data.provider, {
    uid: res.firebaseUid,
  } as GpSign);

  gpSign.id = data.credential.user?.email;
  gpSign.token = res.idToken;
  gpSign.uid = res.firebaseUid;
  gpSign.provider = data.provider;
  gpSign.lastLogin = true;

  return NextResponse.json(res);
}
