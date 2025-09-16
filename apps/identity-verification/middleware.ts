// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, importSPKI } from "jose";

export const config = {
  matcher: ["/identity-verification/:path*", "/kakao/:path*", "/naver/:path*"],
};

const PUB_PEM = process.env.INGAME_JWT_PUBLIC_PEM!;
const ISS = process.env.INGAME_JWT_ISS || "atoz-auth";
const AUD = process.env.INGAME_JWT_AUD || "ingame-webview";

// 캐시 변수 (전역)
let PUBLIC_KEY: CryptoKey | null = null;

async function getPublicKey(): Promise<CryptoKey> {
  if (PUBLIC_KEY) return PUBLIC_KEY;
  if (!PUB_PEM) throw new Error("INGAME_JWT_PUBLIC_PEM missing");
  // RS256 공개키(SPKI) 임포트
  PUBLIC_KEY = await importSPKI(PUB_PEM, "RS256");
  return PUBLIC_KEY;
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("wv");
  if (!token) {
    return NextResponse.redirect(new URL("/blocked?reason=missing_token", req.url));
  }

  try {
    const k = await getPublicKey();
    await jwtVerify(token, k, {
      algorithms: ["RS256"],
      issuer: ISS,
      audience: AUD,
      // clockTolerance: "1s", // 필요 시
    });

    // 사용자/디바이스 클레임은 아예 요구하지 않음(요청대로 stateless attestation)
    return NextResponse.next();
  } catch (_e) {
    return NextResponse.redirect(new URL("/blocked?reason=bad_token", req.url));
  }
}
