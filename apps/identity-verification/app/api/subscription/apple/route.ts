import { NextRequest, NextResponse } from "next/server";
import { JWTPayload, SignJWT, createRemoteJWKSet, importJWK, importPKCS8, jwtVerify } from "jose";
import { initializeDataSource } from "../../data-source";

const APPLE_KEY_ID = process.env.APPLE_KEY_ID!; // ex: "AB12CD34EF"
const APPLE_ISSUER_ID = process.env.APPLE_ISSUER_ID!; // ex: "1a2b3c4d-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY!; // -----BEGIN PRIVATE KEY----- 로 시작하는 PEM

async function generateAppStoreJWT(): Promise<string> {
  try {
    const privateKey = await importPKCS8(APPLE_PRIVATE_KEY, "ES256");

    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: APPLE_KEY_ID })
      .setIssuer(APPLE_ISSUER_ID)
      .setAudience("appstoreconnect-v1")
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 20 * 60) // 20분 유효
      .sign(privateKey);

    return jwt;
  } catch (err) {
    console.error("[AppStoreJWT Error]", err);
    throw new Error("JWT 생성 실패");
  }
}

function decodeBase64Url(str: string): string {
  if (!str) return "";
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);

  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch (err) {
    console.error("[decodeBase64Url Error]", err);
    return "";
  }
}

function decodeJWT(jwt: string) {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const header = JSON.parse(Buffer.from(parts[0], "base64").toString("utf8"));
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
  const signature = parts[2];
  return { header, payload, signature };
}

const APPLE_JWKS_URLS = {
  Sandbox: "https://api.storekit-sandbox.itunes.apple.com/inApps/v1/notifications/jwsPublicKeys",
  Production: "https://api.storekit.itunes.apple.com/inApps/v1/notifications/jwsPublicKeys",
};

function getAppleJWKS(environment: string) {
  const url = environment === "Sandbox" ? APPLE_JWKS_URLS.Sandbox : APPLE_JWKS_URLS.Production;
  return createRemoteJWKSet(new URL(url));
}

async function verifyAppleSignedPayload(signedPayload: string): Promise<JWTPayload> {
  try {
    let jwks = getAppleJWKS("Sandbox");
    let result;

    try {
      result = await jwtVerify(signedPayload, jwks, {
        algorithms: ["ES256"],
      });
    } catch (err) {
      jwks = getAppleJWKS("Production");
      result = await jwtVerify(signedPayload, jwks, {
        algorithms: ["ES256"],
      });
    }

    const { payload } = result;
    const environment = (payload.environment as string) || "Production";

    console.log(` Apple Payload verified (${environment})`);
    console.log(" Payload:", JSON.stringify(payload, null, 2));

    return payload;
  } catch (err) {
    console.error("Apple payload verification failed:", err);
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const dataSource = await initializeDataSource();
    const dataObj = await request.json();
    const signedPayload = dataObj.body.signedPayload;
    console.log(`signedPayload: ${signedPayload}`);
    const payload = await verifyAppleSignedPayload(signedPayload);
    //const decoded = decodeJWT(signedPayload);
    //const payload = decoded.payload;

    const data = payload.data as any;
    const notificationType = payload.notificationType;
    const transactionAll = decodeJWT(data.signedTransactionInfo);
    const transaction = transactionAll.payload;

    const originalTransactionId = transaction.originalTransactionId;
    const transactionId = transaction.transactionId;
    const expiresDate = transaction.expiresDate;
    const purchaseDate = transaction.purchaseDate;
    const revocationDate = transaction.revocationDate ?? null;
    const productId = transaction.productId;
    const paymentState = 0;
    const cancelReason = 0;
    const qr = dataSource.createQueryRunner();
    await qr.connect();
    try {
      const [result_query] = await qr.query(`CALL sp_purchase_subscription(?, ?, ?, ?, ?, ?, ?)`, [
        "APPLE",
        notificationType,
        originalTransactionId,
        transactionId,
        expiresDate,
        purchaseDate,
        revocationDate,
        productId,
        paymentState,
        cancelReason,
      ]);
      const resultRow = result_query[0];
      console.log(result_query);
      console.log(resultRow);
    } finally {
      await qr.release();
    }

    return NextResponse.json({ result: "success" }, { status: 200 });
  } catch (e: any) {
    console.error("[ingame-token] issue error::", e?.message || e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
