import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

// ✅ 미들웨어는 Edge 런타임(기본)
export const config = {
  matcher: ["/identity-verification/:path*", "/kakao/:path*", "/naver/:path*", "/blocked"],
};

const PUB_PEM_RAW = process.env.INGAME_JWT_PUBLIC_PEM || "";
const ISS = process.env.INGAME_JWT_ISS || "atoz-auth";
const AUD = process.env.INGAME_JWT_AUD || "ingame-webview";
const DEBUG = process.env.INGAME_JWT_DEBUG === "true";

// 전역 캐시
let PUBLIC_KEY: CryptoKey | null = null;
let INIT_ERR: string | null = null;

// PEM 문자열 정규화: \n 복원 + 최소 헤더 점검
function normalizeSpkiPem(input: string): string {
  const s = input.replace(/\\n/g, "\n").trim();
  if (!s.includes("-----BEGIN PUBLIC KEY-----")) {
    throw new Error(
      "Public key must be SPKI with '-----BEGIN PUBLIC KEY-----' header (PKCS#1 'RSA PUBLIC KEY'는 변환 필요)",
    );
  }
  return s;
}

async function getPublicKey(): Promise<CryptoKey> {
  if (PUBLIC_KEY) return PUBLIC_KEY;
  try {
    if (!PUB_PEM_RAW) throw new Error("INGAME_JWT_PUBLIC_PEM missing");
    const pem = normalizeSpkiPem(PUB_PEM_RAW);
    PUBLIC_KEY = await importSPKI(pem, "RS256");
    return PUBLIC_KEY;
  } catch (e: any) {
    INIT_ERR = e?.message || String(e);
    throw e;
  }
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  return;

  // // 🔓 /blocked 자체는 무조건 통과(리다이렉트 루프 방지)
  // if (url.pathname.startsWith("/blocked")) {
  //   return NextResponse.next();
  // }
  //
  // const token = url.searchParams.get("wv");
  // if (!token) {
  //   if (DEBUG) console.error("[mw] no token, redirect → /blocked?reason=missing_token");
  //   return NextResponse.redirect(new URL("/blocked?reason=missing_token", req.url));
  // }
  //
  // try {
  //   const key = await getPublicKey();
  //   await jwtVerify(token, key, {
  //     algorithms: ["RS256"],
  //     issuer: ISS,
  //     audience: AUD,
  //     clockTolerance: 10, // 시계 오차 10초 허용
  //   });
  //   return NextResponse.next();
  // } catch (e: any) {
  //   if (DEBUG) console.error("[mw] verify fail:", e?.message || e, "initErr=", INIT_ERR);
  //   return NextResponse.redirect(new URL("/blocked?reason=bad_token", req.url));
  // }
}
