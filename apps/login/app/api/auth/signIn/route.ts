import { NextRequest, NextResponse } from "next/server";
import { getSign } from "../auth.service";
import { GpSign } from "common/cookie";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const gpSign = await getSign(data.provider, {
    uid: data.uid,
  } as GpSign);

  // TODO:
  // signIn(GRPC: GrpcClient, gpSign: GpSign) => 이거 처리해야함.. ㅅㅂ..
}
