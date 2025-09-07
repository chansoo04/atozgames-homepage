import { NextRequest, NextResponse } from "next/server";

interface FormData {
  id?: string;
  token?: string;
  error?: string;
}

class NaverOauthError extends Error {
  code: string;
  constructor(code: string, message: string, err?: Error) {
    super(message);
    this.code = code;
    // 필요시 원본 에러를 로그에 남김
    // logger.error(`[${code}] ${message}`, err);
  }
}

export async function GET(request: NextRequest) {
  const formData: FormData = {};
  try {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    const url = new URL(request.url);
    const authCode = url.searchParams.get("code") as string;
    const state = url.searchParams.get("state"); // state 데이터를 추출한다.
    const authError = url.searchParams.get("error"); // error 데이터를 추출한다.
    const authErrorDescription = url.searchParams.get("error_description"); // error_description 데이터를 추출한다.

    console.log(authCode, "code");
    console.log(state, "state");
    console.log(authError, "authError");
    console.log(authErrorDescription, "authErrorDescription");

    if (authError) {
      throw new NaverOauthError(
        "NAVER_AUTH_FAILURE",
        "네이버 인증 실패",
        new Error(authErrorDescription!),
      );
    }

    // 네이버 인증 확인
    const naverAuthUrl = [
      `https://nid.naver.com/oauth2.0/token`,
      `?grant_type=authorization_code`,
      `&client_id=${clientId}`,
      `&client_secret=${clientSecret}`,
      `&code=${authCode}`,
      `&state=${state}`,
    ].join("");

    const naverAuthReq = await fetch(naverAuthUrl, {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": clientId as string,
        "X-Naver-Client-Secret": clientSecret as string,
      },
    });

    console.log("REQ: ", naverAuthReq);

    if (!naverAuthReq.ok) {
      throw new NaverOauthError("NAVER_AUTH_REQUEST_FAILURE", "네이버 인증 요청 실패");
    }

    const naverAuthRes = await naverAuthReq.json();
    console.log("RES: ", naverAuthRes);
    if (naverAuthRes.error) {
      throw new NaverOauthError(
        "NAVER_AUTH_REQUEST_FAILURE",
        `네이버 인증 실패 ${naverAuthRes.error}`,
        new Error(naverAuthRes.error_description),
      );
    } else if (!naverAuthRes.access_token) {
      throw new NaverOauthError("NAVER_AUTH_FAILURE", "네이버 인증 실패");
    }

    // 네이버 데이터 조회
    const naverAuthToken = naverAuthRes.access_token;
    const naverDataReq = await fetch("https://openapi.naver.com/v1/nid/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${naverAuthToken}`,
      },
    });

    if (!naverDataReq.ok) {
      throw new NaverOauthError("NAVER_DATA_REQUEST_FAILURE", "네이버 데이터 조회 실패");
    }

    const naverDataRes = await naverDataReq.json();
    console.log("RES: ", naverDataRes);
    if (!naverDataRes.response.id) {
      throw new NaverOauthError("NAVER_DATA_FAILURE", "네이버 데이터 조회 실패");
    }

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
        token: naverAuthToken,
        provider: "naver",
      }),
    });

    if (!createCustomTokenReq.ok) {
      throw new NaverOauthError(
        "NAVER_AUTH_FAILURE",
        "Custom Token 생성 실패",
        new Error(createCustomTokenReq.statusText),
      );
    }

    const createCustomTokenRes = await createCustomTokenReq.json();
    console.log(createCustomTokenRes, "createCustomTokenRes");

    if (createCustomTokenRes.success === false) {
      throw new NaverOauthError(
        "FAILURE_CREATE_CUSTOM_TOKEN",
        "Custom Token 생성 실패",
        new Error(createCustomTokenRes.errorMessage),
      );
    }

    formData.id = buildId(naverDataRes.response);
    formData.token = createCustomTokenRes.custom_token;
    return redirect(formData);
  } catch (err) {
    console.error("ERR!!", err);
    if (err instanceof NaverOauthError) {
      // 네이버 인증 관련 에러 처리
      // logger.error(`NaverOauthError: ${err.code}`, err);
      formData.error = err.code;
      return redirect(formData);
    }

    // logger.error(`Unexpected error in GET`, err);
    formData.error = "UNEXPECTED_ERROR";
    return redirect(formData);
  }
}

function buildId(naverData: { name?: string; nickname?: string }): string {
  const { name, nickname } = naverData;

  let redactedName = "";
  if (name) {
    if (name.length === 1) {
      redactedName = `${name[0]}**`;
    } else if (name.length === 2) {
      redactedName = `${name[0]}*${name[1]}`;
    } else if (name.length >= 3) {
      redactedName = `${name[0]}*${name[2]}`;
    }
  }

  if (name && nickname) {
    return `${nickname}(${redactedName})`;
  } else if (nickname) {
    return nickname;
  } else if (name) {
    return redactedName;
  }

  return "";
}

async function redirect(formData: FormData) {
  const hostUrl = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL;
  const url = `${hostUrl}/login/naver`;

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
