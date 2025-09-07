import { NextRequest, NextResponse } from "next/server";
import { getClient, promisifyUnary } from "lib/grpc/registry";

// FIXME: FETCH로 바꿔야함..
export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data, "datas");

  // const url = process.env.GRPC_API_URL + "user.AccountService/getNickByFirebaseUid";
  // const req = await fetch(url, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-api-key": process.env.AWS_API_KEY as string,
  //     "x-api-secret": process.env.AWS_API_SECRET as string,
  //   },
  //   body: JSON.stringify({ firebaseUid: JSON.stringify(data.firebaseUid) }),
  // });
  // console.log(req, "req");
  //
  // if (!req.ok) {
  //   throw new Error(req.statusText);
  // }
  //
  // const res = await req.json();
  // console.log(res, "res");
  //
  // return NextResponse.json(res);

  const client = getClient<any>("user.AccountService");
  const req = await promisifyUnary((req_, cb) => client.getNickByFirebaseUid(req_, cb), {
    firebase_uid: data.firebaseUid,
  });
  console.log(req, "REQ");

  return NextResponse.json(req);
}
