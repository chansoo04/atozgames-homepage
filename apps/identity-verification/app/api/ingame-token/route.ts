import { NextRequest, NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
import { createPrivateKey } from "crypto";

// 반드시 Node 런타임 (엣지/웹 atob 경로 회피)
export const runtime = "nodejs";

/**
 * 환경변수:
 * - INGAME_JWT_PRIVATE_PEM : PKCS#8(-----BEGIN PRIVATE KEY-----) 또는 PKCS#1(-----BEGIN RSA PRIVATE KEY-----)
 * - INGAME_JWT_ISS         : 발급자(issuer)
 * - INGAME_JWT_AUD         : 대상(audience)
 * - INGAME_JWT_TTL_SEC     : 만료(초)
 */
const RAW_PEM_ENV = process.env.INGAME_JWT_PRIVATE_PEM || "";
const ISS = process.env.INGAME_JWT_ISS || "atoz-auth";
const AUD = process.env.INGAME_JWT_AUD || "ingame-webview";
const TTL_SEC = parseInt(process.env.INGAME_JWT_TTL_SEC || "30", 10);

// ENV 문자열을 PEM으로 정규화 (\\n → 실제 개행, base64url → base64 교정)
function normalizePemFromEnv(input: string): { pem: string; kind: "PKCS8" | "PKCS1" } {
  if (!input) throw new Error("INGAME_JWT_PRIVATE_PEM missing");

  // 1) 리터럴 "\n" 복원
  const s = input.replace(/\\n/g, "\n").trim();

  // 2) PEM 헤더가 있으면 그대로 사용
  if (s.includes("-----BEGIN")) {
    if (s.includes("BEGIN PRIVATE KEY")) {
      return { pem: s, kind: "PKCS8" };
    }
    if (s.includes("BEGIN RSA PRIVATE KEY")) {
      return { pem: s, kind: "PKCS1" };
    }
    throw new Error("Unsupported PEM header type");
  }

  // 3) 헤더가 없으면 base64/base64url 인코딩된 PEM 텍스트로 가정 → 디코드
  const b64 = /[-_]/.test(s) ? s.replace(/-/g, "+").replace(/_/g, "/") : s;
  const txt = Buffer.from(b64, "base64").toString("utf8").trim();

  if (!txt.includes("-----BEGIN")) throw new Error("Decoded text is not PEM");
  if (txt.includes("BEGIN PRIVATE KEY")) return { pem: txt, kind: "PKCS8" };
  if (txt.includes("BEGIN RSA PRIVATE KEY")) return { pem: txt, kind: "PKCS1" };
  throw new Error("Unsupported PEM header type after decode");
}

// 안전한 JTI 생성 (base64url)
function randomJti(bytes: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const buf: Buffer = require("crypto").randomBytes(bytes);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// PKCS#8은 jose.importPKCS8, PKCS#1은 Node KeyObject로 처리
async function importRsaPrivateKey(pem: string, kind: "PKCS8" | "PKCS1"): Promise<unknown> {
  const alg = "RS256";
  if (kind === "PKCS8") {
    return importPKCS8(pem, alg);
  }
  // PKCS#1 (-----BEGIN RSA PRIVATE KEY-----)
  // jose v6의 타입을 직접 임포트하지 않고 KeyObject를 그대로 사용
  return createPrivateKey({ key: pem, format: "pem", type: "pkcs1" });
}

export async function POST(_req: NextRequest) {
  try {
    const { pem, kind } = normalizePemFromEnv(RAW_PEM_ENV);
    const key = await importRsaPrivateKey(pem, kind);

    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({ jti: randomJti(16) })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(ISS)
      .setAudience(AUD)
      .setIssuedAt(now)
      .setExpirationTime(now + TTL_SEC)
      // jose의 sign()은 KeyLike | Uint8Array를 받지만, Node KeyObject도 수용됩니다.
      .sign(key as any);

    return NextResponse.json({ token: jwt });
  } catch (e: any) {
    console.error("[ingame-token] issue error:", e?.message || e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
