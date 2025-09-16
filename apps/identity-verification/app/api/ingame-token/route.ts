// app/api/ingame-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

// ✅ 반드시 Node 런타임 (Buffer/crypto 사용)
export const runtime = "nodejs";

const PRIV_PEM = process.env.INGAME_JWT_PRIVATE_PEM!;
const ISS = process.env.INGAME_JWT_ISS || "atoz-auth";
const AUD = process.env.INGAME_JWT_AUD || "ingame-webview";
const TTL_SEC = parseInt(process.env.INGAME_JWT_TTL_SEC || "30", 10); // 10~60초 권장

// Node의 crypto.randomBytes 사용 (ES5 호환, for..of 불필요)
function randomJti(bytes: number) {
  // require를 쓰면 번들러/타깃 이슈 최소화
  // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
  const crypto = require("crypto");
  const buf = crypto.randomBytes(bytes); // Buffer
  // base64 → base64url 수동 변환 (Node 버전 상관없이 안전)
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function POST(_req: NextRequest) {
  try {
    if (!PRIV_PEM) {
      return NextResponse.json({ error: "missing_private_key" }, { status: 500 });
    }

    const alg = "RS256";
    const key = await importPKCS8(PRIV_PEM, alg);
    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({
      jti: randomJti(16), // 128bit 랜덤 ID
    })
      .setProtectedHeader({ alg, typ: "JWT" })
      .setIssuer(ISS)
      .setAudience(AUD)
      .setIssuedAt(now)
      .setExpirationTime(now + TTL_SEC)
      .sign(key);

    return NextResponse.json({ token: jwt });
  } catch (e) {
    // 최소한의 로깅
    // eslint-disable-next-line no-console
    console.error("[ingame-token] issue error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
