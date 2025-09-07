import { NextRequest, NextResponse } from "next/server";
import {
  getClient,
  grpcErrorToHttpStatus,
  promisifyUnary,
  listAvailableServices,
} from "lib/grpc/registry";

export async function GET(request: NextRequest) {
  const data = { firebaseUid: ["kakao:4263838777"] };
  console.log(listAvailableServices());

  const client = getClient<any>("user.AccountService");
  console.log("methods:", Object.keys(Object.getPrototypeOf(client)));
  const channel = client.getChannel?.();
  console.log("gRPC target:", channel?.getTarget?.());
  console.log("ENV:", {
    addr: process.env.GRPC_USER_ACCOUNT_SERVICE_ADDR || process.env.GRPC_DEFAULT_ADDR,
    tls: process.env.GRPC_USER_ACCOUNT_SERVICE_TLS || process.env.GRPC_DEFAULT_TLS,
    servername:
      process.env.GRPC_USER_ACCOUNT_SERVICE_SERVERNAME || process.env.GRPC_DEFAULT_SERVERNAME,
  });

  const req = await promisifyUnary((req_, cb) => client.isExistEmail(req_, cb), {
    email: "hello@atozgames.nt",
  });
  console.log(req, "REQ@@@");

  return NextResponse.json({
    result: "hi",
  });
}
