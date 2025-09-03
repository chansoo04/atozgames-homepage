import { NextRequest, NextResponse } from "next/server";
import * as COOKIE from "./cookie.service";
import { GpCookie, GpSignList } from "common/cookie";

type CookieAction = {
  action:
    | "getAll"
    | "getSign"
    | "getByProvider"
    | "setSign"
    | "removeSign"
    | "removeByProvider"
    | "removeAll"
    | "destroy";
  provider?: any;
  sign?: any;
  gpSign?: any;
};

export async function POST(req: NextRequest) {
  const { action, sign, provider } = (await req.json()) as CookieAction;
  console.log(action, "action");

  let result;
  // COOKIE.

  switch (action) {
    // case "getAll":
    //   result = await COOKIE.getAll();
    //   console.log(result, "result");
    //   return NextResponse.json(result);
    case "getSign":
    case "getByProvider":
      result = await COOKIE.getAll();
      if (result[provider as keyof GpCookie]?.list) {
        return NextResponse.json(result[provider as keyof GpCookie]?.list);
      }
      throw new Error("Invalid provider");
    case "setSign":
    case "removeSign":
    case "removeByProvider":
    case "removeAll":
    case "destroy":
    default:
      throw new Error("Invalid action");
  }
}
