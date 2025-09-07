import { NextRequest, NextResponse } from "next/server";

class KakaoOauthError extends Error {
  code: string;
  constructor(code: string, message: string, err?: Error) {
    super(message);
    this.code = code;
    // 필요시 원본 에러를 로그에 남김
    // logger.error(`[${code}] ${message}`, err);
  }
}

interface FormData {
  id?: string;
  token?: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  const formData: FormData = {};
  try {
    const url = new URL(request.url);
    const authCode = url.searchParams.get("code") as string;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY as string;
    const redirectUri = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/oauth/kakao";

    const tokenParams = new URLSearchParams();
    tokenParams.set("grant_type", "authorization_code");
    tokenParams.set("client_id", apiKey);
    tokenParams.set("redirect_uri", redirectUri);
    tokenParams.set("code", authCode);

    // 카카오 인증 확인
    const kakaoAuthReq = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: tokenParams,
    });

    if (!kakaoAuthReq.ok) {
      throw new KakaoOauthError("KAKAO_AUTH_FAILURE", "카카오 인증 실패");
    }

    const kakaoAuthRes = await kakaoAuthReq.json();
    console.log(kakaoAuthRes, "kakauAuthRes");

    const kakaoAuthToken = kakaoAuthRes.access_token;

    // 카카오 데이터 조회
    const kakaoDataReq = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${kakaoAuthToken}`,
      },
    });

    if (!kakaoDataReq.ok) {
      throw new KakaoOauthError("KAKAO_DATA_FAILURE", "카카오 데이터 조회 실패");
    }

    const kakaoDataRes = await kakaoDataReq.json();
    console.log(kakaoDataRes, "kakauAuthRes");

    // createCustomToken 생성
    const createCustomTokenUrl = process.env.GRPC_API_URL + "game.AuthService/CreateCustomToken";
    const createCustomTokenReq = await fetch(createCustomTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.AWS_API_KEY as string,
        "x-api-secret": process.env.AWS_API_SECRET as string,
      },
      body: JSON.stringify({
        token: kakaoAuthToken,
        provider: "kakao",
      }),
    });

    console.log(createCustomTokenReq);

    if (!createCustomTokenReq.ok) {
      throw new KakaoOauthError(
        "KAKAO_AUTH_FAILURE",
        "Custom Token 생성 실패",
        new Error(createCustomTokenReq.statusText),
      );
    }

    const createCustomTokenRes = await createCustomTokenReq.json();
    console.log(createCustomTokenRes, "createCustomTokenRes");

    if (createCustomTokenRes.success === false) {
      throw new KakaoOauthError(
        "FAILURE_CREATE_CUSTOM_TOKEN",
        "Custom Token 생성 실패",
        new Error(createCustomTokenRes.errorMessage),
      );
    }

    formData.id = kakaoDataRes?.kakao_account?.email;
    formData.token = createCustomTokenRes.custom_token;
    return redirect(formData);
  } catch (err) {
    console.error("ERR!!", err);
    if (err instanceof KakaoOauthError) {
      // 카카오 인증 관련 에러 처리
      // logger.error(`KakaoOauthError: ${err.code}`, err);
      formData.error = err.code;
      return redirect(formData);
    }

    // logger.error(`Unexpected error in GET`, err);
    formData.error = "UNEXPECTED_ERROR";
    return redirect(formData);
  }
}

async function redirect(formData: FormData) {
  const hostUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL;
  const url = `${hostUrl}/login/kakao`;

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

  return NextResponse.redirect(redirectUrl);
}
