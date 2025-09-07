import { NextRequest, NextResponse } from "next/server";
import {
  getClient,
  grpcErrorToHttpStatus,
  promisifyUnary,
  listAvailableServices,
} from "lib/grpc/registry";

// FIXME: fetch로 변경,, 안됨..
export async function POST(request: NextRequest) {
  console.warn("!!isExist Email API 시작!!");
  const data = await request.json();

  const client = getClient<any>("user.AccountService");
  const req = await promisifyUnary((req_, cb) => client.isExistEmail(req_, cb), data);

  return NextResponse.json(req);
}
