import { NextRequest, NextResponse } from "next/server";
import { decodeJwt, importPKCS8, SignJWT } from "jose";

interface FormData {
  id?: string;
  token?: string;
  error?: string;
}

class oauthError extends Error {
  code: string;
  constructor(code: string, message: string, err?: Error) {
    super(message);
    this.code = code;
    // 필요시 원본 에러를 로그에 남김
    // logger.error(`[${code}] ${message}`, err);
  }
}

// TODO: 서버 띄우고 검증 한번 해봐야함
export async function POST(request: NextRequest) {
  const formData: FormData = {};

  try {
    const redirectUri = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/oauth/apple";
    const form = await request.formData();

    // * handle user cancel
    const hasError = form.get("error") as string | null;
    if (hasError?.toLowerCase() === "user_cancelled_authorization") {
      formData.error = "USER_CANCELLED_AUTHORIZATION";
      return redirect(formData);
    }

    const authCode = form.get("code") as string | null;
    const now = Math.floor(Date.now() / 1000);
    const privateKey = await getPrivateKey(process.env.APPLE_PRIVATE_KEY as string);

    const clientSecret = await new SignJWT({
      iss: process.env.APPLE_TEAM_ID,
      aud: "https://appleid.apple.com",
      sub: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
    })
      .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID })
      .setIssuedAt(now)
      .setExpirationTime(now + 60 * 60)
      .sign(privateKey);

    const params = new URLSearchParams();
    params.append("client_id", process.env.NEXT_PUBLIC_APPLE_CLIENT_ID as string);
    params.append("client_secret", clientSecret);
    params.append("code", authCode!);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", redirectUri);

    const tokenRes = await (async () => {
      try {
        const res = await fetch("https://appleid.apple.com/auth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        });

        if (!res.ok) {
          // 에러 응답을 최대한 살려서 래핑
          const ct = res.headers.get("content-type") ?? "";
          let errPayload: unknown;
          try {
            errPayload = ct.includes("application/json") ? await res.json() : await res.text();
          } catch {
            /* ignore parse error */
          }
          throw new oauthError(
            "APPLE_AUTH_REQUEST_FAILURE",
            `Apple 인증 요청 실패 (HTTP ${res.status})`,
            errPayload instanceof Error
              ? errPayload
              : new Error(typeof errPayload === "string" ? errPayload : JSON.stringify(errPayload)),
          );
        }

        return await res.json(); // axios의 res.data와 동일
      } catch (err) {
        if (err instanceof oauthError) throw err;
        throw new oauthError(
          "APPLE_AUTH_REQUEST_FAILURE",
          "Apple 인증 요청 실패 (on fetch)",
          err as Error,
        );
      }
    })();

    /*
  {
  "iss": "https://appleid.apple.com",
  "aud": "...",
  "exp": ...,
  "iat": ...,
  "sub": "0012345....",
  "email": "...",
  "email_verified": "true",
  ...
  }
  */

    const decoded: {
      iss: string;
      aud: string;
      exp: number;
      iat: number;
      sub: string;
      email?: string;
      email_verified?: boolean;
    } = decodeJwt(tokenRes.id_token);
    if (!decoded || !decoded.sub) {
      throw new oauthError("APPLE_AUTH_FAILURE", "Apple 인증 실패: ID 토큰이 유효하지 않음");
    }

    // TODO: API가 작동을 안해요
    // * Firebase Custom Token 생성
    // const token = await GRPC.auth.game2.createCustomToken(
    //   CreateCustomTokenRequest.create({
    //     token: JSON.stringify({
    //       sub: decoded.sub,
    //       email: decoded.email,
    //     }),
    //     provider: 'apple',
    //   }),
    // );
    //
    // if (token.success === false) {
    //   throw new oauthError(
    //     'FAILURE_CREATE_CUSTOM_TOKEN',
    //     'Custom Token 생성 실패',
    //     new Error(token.errorMessage),
    //   );
    // }
    //
    // // * success
    // logger.verbose('Custom Token 생성 성공 ', token.customToken);
    // formData.id = decoded.email;
    // formData.token = token.customToken;
    // return redirect(formData);
  } catch (err) {
    if (err instanceof oauthError) {
      // 인증 관련 에러 처리
      // logger.error(`outhError: ${err.code}`, err);
      formData.error = err.code;
      return redirect(formData);
    }
    // 예상치 못한 에러 처리
    // logger.error(`Unexpected error in oauth`, err);
    formData.error = "UNEXPECTED_ERROR";
    return redirect(formData);
  }
}

async function redirect(formData: FormData) {
  const hostUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL;
  const url = `${hostUrl}login/apple`;

  const params = Object.entries(formData)
    .map(([key, value]) => {
      if (value) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("&");

  const redirectUrl = `${url}?${params}`;

  return Response.redirect(redirectUrl);
}

let cachedKey: CryptoKey | null = null;
async function getPrivateKey(key: string) {
  if (!cachedKey) {
    cachedKey = await importPKCS8(key, "ES256");
  }
  return cachedKey;
}
