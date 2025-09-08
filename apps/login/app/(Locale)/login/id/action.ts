"use client";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "lib/firebaseClient";
import { GpSignProvider, GP_SIGN_AUTH_CODE } from "common/cookie";
import { checkPublic, signUpIdentity, signWithCredential } from "../action";
import { toUnity } from "lib/unityUtil";

export const signInWithIDPASSWORD = async (
  rawId: string,
  password: string,
): Promise<{
  success: boolean;
  code?: GP_SIGN_AUTH_CODE | string;
  uid?: string;
  res?: any; // TODO: 지우기!!
}> => {
  let id;
  if (!rawId.includes("@")) {
    id = `${rawId}@atozgames.net`;
  } else {
    id = rawId;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, id, password);

    const req = await fetch("/api/auth/signWithCredential", {
      method: "POST",
      body: JSON.stringify({
        id: rawId,
        provider: GpSignProvider.PASSWORD,
        credential,
      }),
    });

    console.log(req, "REQ");
    if (!req.ok) {
      console.error("ERROR: ", req.statusText);
      return {
        success: false,
        code: "FETCH FAILED" as GP_SIGN_AUTH_CODE,
      };
    }

    const res = await req.json();

    // 로그인 성공
    if (res.success) {
      // 계정 상태 확인
      const isPublic = await checkPublic(res.firebaseUid); // TODO: 확인하기!!
      if (isPublic) {
        return {
          success: false,
          code: isPublic,
          uid: res.firebaseUid,
        };
      }

      // FIXME!!! res 없애고, toUnity 살리기
      // toUnity(res.account_id, res.firebase_uid, res.id_token);
      return { success: true, res: res };
    }
    // 로그인 실패
    else {
      const code = res.authCode as GP_SIGN_AUTH_CODE;
      switch (code) {
        case GP_SIGN_AUTH_CODE.ALREADY_SIGND: {
          // * 이미 로그인 되어있음
          // logger.error('Already signed in', code);
          return {
            success: false,
            code,
          };
        }
        case GP_SIGN_AUTH_CODE.INVALID_TOKEN: {
          // * 잘못된 토큰
          // logger.error('Invalid token', code);
          return {
            success: false,
            code: GP_SIGN_AUTH_CODE.INVALID_TOKEN,
          };
        }
        default: {
          // logger.error(
          //   'Unknown error occurred:',
          //   code ?? 'code is undefined',
          // );
          return {
            success: false,
            code: "Unknown error occurred" as GP_SIGN_AUTH_CODE,
          };
        }
      }
    }
  } catch (err) {
    let code = "FB_UNKNOWN_ERROR";
    if (err instanceof FirebaseError) {
      switch (err.code) {
        // * deprecated error codes
        // case 'auth/user-not-found':
        // case 'auth/invalid-email':
        //   code = 'FB_INVALID_EMAIL';
        //   break;
        // case 'auth/user-disabled':
        //   code = 'FB_USER_DISABLED';
        //   break;
        case "auth/too-many-requests":
          code = "FB_TOO_MANY_REQUESTS";
          break;
        case "auth/invalid-credential": {
          // * 아이디나 비밀번호가 잘못된 경우

          // 아이디가 존재하는지 확인
          const req = await fetch("/api/user/isExistEmail", {
            method: "POST",
            body: JSON.stringify({ email: id }),
          });

          if (!req.ok) {
            code = "FB_INVALID_EMAIL";
          } else {
            const res = await req.json();
            if (res.is_exist) {
              code = "FB_WRONG_PASSWORD";
            } else {
              code = "FB_INVALID_EMAIL";
            }
          }

          break;
        }
      }
      // logger.error('Firebase error occurred:', err.code);
      return {
        success: false,
        code: code as GP_SIGN_AUTH_CODE,
      };
    }
    // logger.error('Unknown error occurred:', err);
    return {
      success: false,
    };
  }
};
