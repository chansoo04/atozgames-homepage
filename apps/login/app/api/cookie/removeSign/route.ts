import { NextRequest, NextResponse } from "next/server";
import { getSessionByProvider, providerToString, providerValidator } from "../cookie.service";

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log(data, "data");
  const isValid = providerValidator(data.gpSign.provider);
  if (isValid === false) {
    throw new Error("Invalid provider");
  }

  data.gpSign.provider = providerToString(data.gpSign.provider);
  const session = await getSessionByProvider(data.gpSign.provider);
  const signList = session.list;
  const index = signList.findIndex((s) => s.id === data.gpSign.id);
  if (index !== -1) {
    signList.splice(index, 1);
  }
  await session.save();

  return NextResponse.json({
    success: true,
  });
}
