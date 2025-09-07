import { NextRequest, NextResponse } from "next/server";
import { getLastSign, getSign, setSign } from "../auth.service";
import { GpSign, GP_SIGN_AUTH_CODE } from "common/cookie";

export async function POST(request: NextRequest) {
  const data = await request.json();

  const gpSign = await getSign(data.gpSign.provider, {
    uid: data.gpSign.uid,
  } as GpSign);

  const url = process.env.GRPC_API_URL + "game.AuthService/AccountSignIn";
  const req = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.AWS_API_KEY as string,
      "x-api-secret": process.env.AWS_API_SECRET as string,
    },
    body: JSON.stringify({
      uid: gpSign.uid,
      idToken: gpSign.token,
    }),
  });

  if (!req.ok) {
    throw new Error("FETCH FAILED");
  }

  const res = await req.json();

  if (res.success) {
    if (res.auth_code) {
      // 토큰 만료 및 갱신
      if (res.auth_code === GP_SIGN_AUTH_CODE.EXPIRED_AND_RENEWED) {
        gpSign.token = res.id_token;
      } else {
        // error
      }
    } else if (res.id_token) {
      gpSign.token = res.id_token;
      gpSign.uid = res.firebase_uid;
    }

    const lastSign = await getLastSign();
    if (lastSign && lastSign.uid !== gpSign.uid) {
      lastSign.lastLogin = false;
      await setSign(lastSign);
    }

    // 정상 로그인
    gpSign.lastLogin = true;
    await setSign(gpSign);
  }
  // * 로그인 실패 - 기본적으로는 front에서 처리
  // 토큰 관련 처리가 필요할 경우
  else {
    // * 실패 사유에 따라 처리
    if (res.auth_code) {
      const code = res.auth_code as GP_SIGN_AUTH_CODE;
      switch (code as GP_SIGN_AUTH_CODE) {
        case GP_SIGN_AUTH_CODE.ALREADY_SIGND: // * 이미 로그인 되어있음
        case GP_SIGN_AUTH_CODE.NEED_CREDENTIAL: // * 자격 증명 필요
        case GP_SIGN_AUTH_CODE.RELOGIN_REQUIRED: // * 재로그인 필요
        case GP_SIGN_AUTH_CODE.INVALID_TOKEN: // * 잘못된 토큰
          console.error(code, "code");
          throw new Error("Sign in Failed");
          // logger.error('Sign in failed:', code);
          break;
        default: {
          console.error(code, "code");
          throw new Error("Undefined authCode");
          // logger.error('Undefined authCode:', code);
        }
      }
    }
    // * 알수 없는 에러
    else {
      console.error(res.error_message, "errorMessage");
      throw new Error("Unknown error occured");
      // logger.error('Unknown error occurred:', res.errorMessage);
    }
  }

  if (!res.id_token) {
    res.id_token = gpSign.token;
  }

  return NextResponse.json(res);
}
