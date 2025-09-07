"use client";
import { UserCredential } from "firebase/auth";
import { GpSignProvider, GpSign, GP_SIGN_AUTH_CODE } from "common/cookie";
import { toUnity } from "lib/unityUtil";

class SignFailError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message);
    this.name = "SignFailError";
    this.code = code;
  }
}

export const signUpIdentity = async (credential: UserCredential, provider: GpSignProvider) => {
  const win = window as any;

  const url = `${process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL}api/mok/mok_std_request`;
  if (win.MOBILEOK) {
    try {
      win.MOBILEOK.process(url, "MWV", "result");
    } catch (error) {
      alert("MOK 인증을 시작하는데 실패했습니다. 팝업이 허용되어 있는지 확인해주세요.");
      return Promise.reject(new Error("MOK 인증을 시작하는데 실패했습니다."));
    }
  } else {
    alert("MOK 인증을 시작하는데 실패했습니다");
  }

  return new Promise<void>((ok, no) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).result = async (mokResult: any) => {
      // TODO: from '/api/mok/[...nextPath]/route.ts mok_std_result'
      const data = JSON.parse(mokResult);

      if (data.error) {
        alert(`MOK 인증에 실패했습니다. ${data.error}`);
        return no(new SignFailError("MOK_FAIL", `MOK 인증에 실패했습니다. ${data.error}`));
      }

      const url = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/user/createUser";
      const req = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!req.ok) {
        throw new Error(req.statusText);
      }

      const res = await req.json();
      const signUser = res; // as CreateUserResponse

      if (!signUser || !signUser.user_id) {
        alert("유저 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return no(new SignFailError("USER_CREATION_FAILED", "유저 생성에 실패했습니다."));
      }

      const url_getUser = process.env.NEXT_PUBLIC_ATOZ_LOGIN_URL + "api/user/getUser";
      const req_getUser = await fetch(url_getUser, {
        method: "POST",
        body: JSON.stringify({ action: "getUser", options: { userId: signUser.user_id } }),
      });

      if (!req_getUser.ok) {
        throw new Error(req_getUser.statusText);
      }

      const res_getUser = await req_getUser.json();
      console.log(res_getUser);

      // 5개 이상인 경우 막기
      if (res_getUser.accountCount >= 5) {
        alert("5개 계정 초과로 계정생성이 불가합니다.");
        return no(new SignFailError("ACCOUNT_LIMIT_EXCEEDED", "5개 계정 초과로 회원가입 불가."));
        // return (window.location.href = "/login");
      }

      await signUp(credential, provider, signUser.user_id);

      // const lessThen5 = await getUser(signUser.userId);
      // if (lessThen5) await signUp(credential, provider, signUser.userId);
      // else {
      return no(new SignFailError("ACCOUNT_LIMIT_EXCEEDED", "5개 계정 초과로 회원가입 불가."));
      // }
      return ok();
    };
  });
};

const signUp = async (credential: UserCredential, provider: string, userId?: string) => {
  const params: {
    provider: string;
    credential: UserCredential;
    userId?: string;
  } = {
    provider,
    credential,
    userId,
  };

  const req = await fetch("/api/auth/signUp", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (!req.ok) {
    return {
      success: false,
      code: "FETCH FAILD", // as GP_SIGN_AUTH_CODE,
    };
  }

  const res = await req.json();

  await signHandler(res);
};

export const getAccountState = async (firebaseUid: string) => {
  try {
    const req = await fetch("/api/user/isExistAccount", {
      method: "POST",
      body: JSON.stringify({ firebaseUid }),
    });

    if (!req.ok) {
      throw new Error(req.statusText);
    }

    const res = await req.json();
    return res;
  } catch (err) {
    if (err instanceof Error) {
      alert(`잠시 후 다시 시도해주세요.${err.message}`);
      return;
    }
  }
};

export const checkPublic = async (firebaseUid: string): Promise<string> => {
  const state = await getAccountState(firebaseUid);
  console.log("STATE: ", state);

  if (!state) {
    return "STATE_UNDEFINED";
  } else if (!state.is_public) {
    /**
     *  withdrawal: string(Date) // 탈퇴시간
     *  pause: string(Date) // 일시정지 해제시간
     *  disable: bool // 영구정지 여부
     *  dormant: bool // 휴면계정 여부
     *  is_public: bool // 계정 이용 제한 여부
     *  is_active: bool // 삭제 여부
     */
    if (state.isWithdrawal) {
      if (!state.is_withdrawal) {
        // logger.error('삭제된 계정', state);
        return "STATE_NOT_ACTIVE";
      }
      // logger.error('탈퇴한 계정', state);
      return "STATE_WITHDRAWAL";
    }
    if (state.is_pause) {
      // logger.error('일시정지된 계정', state);
      return "STATE_PAUSE";
    }
    if (state.is_disable) {
      // logger.error('영구정지된 계정', state);
      return "STATE_DISABLE";
    }
    if (state.is_dormant) {
      // logger.error('휴면계정', state);
      return "STATE_DORMANT";
    }
    if (!state.is_public) {
      // logger.error('계정 이용 제한된 계정', state);
      return "STATE_NOT_PUBLIC";
    }
  }

  return "";
};

// 로그인
export const signIn = async (
  gpSign: GpSign,
): Promise<{ success: boolean; code?: GP_SIGN_AUTH_CODE | string; uid?: string }> => {
  try {
    console.log("signIn 함수 시작!!");
    console.log("gpSign: ", gpSign);
    if (gpSign === undefined) {
      return { success: false };
    }

    // 계정 상태 확인
    if (gpSign.uid) {
      const isPublic = await checkPublic(gpSign.uid as string);
      if (isPublic) {
        return {
          success: false,
          code: isPublic,
          uid: gpSign.uid,
        };
      }
    }

    const req = await fetch("/api/auth/signIn", {
      method: "POST",
      body: JSON.stringify({ gpSign }),
    });

    if (!req.ok) {
      return { success: false, code: "FETCH FAILED" as GP_SIGN_AUTH_CODE };
    }

    const res = await req.json();
    console.log(res, "RES!!!!!!!! auth/signIn");
    return await signHandler(res);
  } catch (err) {
    return { success: false };
  }
};

export const signWithCredential = async (credential: UserCredential, provider: GpSignProvider) => {
  const params: {
    provider: string;
    credential: UserCredential;
    userId?: string;
  } = {
    provider,
    credential,
  };
  console.log(credential, "CREDENTIAL!!!!!");
  console.log(params, "PARAMS!!!!");
  const firebaseUid = credential.user?.uid;

  // 계정 상태 확인
  if (firebaseUid) {
    const isPublic = await checkPublic(firebaseUid);
    if (isPublic) {
      return {
        success: false,
        code: isPublic,
        uid: firebaseUid,
      };
    }
  }

  const req = await fetch("/api/auth/signWithCredential", {
    method: "POST",
    body: JSON.stringify({ params }),
  });

  if (!req.ok) {
    return { success: false };
  }

  const res = await req.json();
  console.log(res, "RES!!!!!!");

  const hi = await signHandler(res);
  console.log(hi, "HI");
  return hi;
};

const signHandler = async (res: any) => {
  // 계정 상태 확인
  const isPublic = await checkPublic(res.firebaseUid);
  if (isPublic) {
    return {
      success: false,
      code: isPublic,
      uid: res.firebaseUid,
    };
  }
  console.log("TO UNITY 전 RES 체크", res);

  // 로그인 성공
  if (res.success) {
    if (res.account_id && res.firebase_uid && res.id_token) {
      // * 유효 계정 - unity로 전송
      toUnity(res.account_id, res.firebase_uid, res.id_token);
    }
    return { success: true };
  }
  // 로그인 실패
  else {
    const code = res.auth_code as GP_SIGN_AUTH_CODE;
    switch (code) {
      case GP_SIGN_AUTH_CODE.ALREADY_SIGND: {
        // * 이미 로그인 되어있음
        // logger.error("Already signed in", code);
        return {
          success: false,
          code,
        };
      }
      case GP_SIGN_AUTH_CODE.INVALID_TOKEN: {
        // * 잘못된 토큰
        // logger.error("Invalid token", code);
        return {
          success: false,
          code: GP_SIGN_AUTH_CODE.INVALID_TOKEN,
        };
      }
      default: {
        // logger.error("Unknown error occurred:", code ?? "code is undefined");
        return {
          success: false,
          code: "Unknown error occurred" as GP_SIGN_AUTH_CODE,
        };
      }
    }
  }
};

export const withdrawalRevoke = async (accountId: string) => {
  try {
    const req = await fetch("/api/user/withdrawalRevoke", {
      method: "POST",
      body: JSON.stringify({ options: { accountId } }),
    });

    if (!req.ok) {
      throw new Error(req.statusText);
    }

    const res = await req.json();
    return res;
  } catch (err) {
    return undefined;
  }
};
