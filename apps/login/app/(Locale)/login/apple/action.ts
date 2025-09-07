"use client";
import { signUpIdentity, signWithCredential } from "../action";
import { FirebaseError } from "firebase/app";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "lib/firebaseClient";
import { GpSignProvider, GP_SIGN_AUTH_CODE } from "common/cookie";

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

export const signInWithApple = async (
  token: string,
): Promise<{ success: boolean; code?: GP_SIGN_AUTH_CODE | string }> => {
  try {
    const credential = await signInWithCustomToken(auth, token);

    const user = credential.user;
    const firebaseUid = user.uid;
    const req = await fetch("/api/user/isExistAccount", {
      method: "POST",
      body: JSON.stringify({ options: { firebaseUid } }),
    });

    if (!req.ok) {
      throw new Error("FETCH FAILED");
    }

    const res = await req.json();

    // 계정이 존재한다면
    if (res.is_exist) {
      return await signWithCredential(credential, GpSignProvider.APPLE);
    }
    // 계정이 없다면
    else {
      await signUpIdentity(credential, GpSignProvider.APPLE);
      return { success: true };
    }
  } catch (err) {
    let code = "FB_UNKNOWN_ERROR";
    if (err instanceof FirebaseError) {
      switch (err.code) {
        // * Popup Error Codes
        case "auth/popup-closed-by-user":
          code = "FB_POPUP_CLOSED_BY_USER";
          break;
        case "auth/popup-blocked":
          code = "FB_POPUP_BLOCKED";
          break;
        // * Firebase Auth Error Codes
        case "auth/invalid-email":
          code = "FB_INVALID_EMAIL";
          break;
        case "auth/user-disabled":
          code = "FB_USER_DISABLED";
          break;
        case "auth/too-many-requests":
          code = "FB_TOO_MANY_REQUESTS";
          break;
        case "auth/invalid-credential":
          code = "FB_WRONG_PASSWORD";
          break;
      }
      // logger.error('Firebase error occurred:', err.code);
      return {
        success: false,
        code: code as GP_SIGN_AUTH_CODE,
      };
    } else if (err instanceof SignFailError) {
      // logger.error('Sign fail error occurred:', err.code);
      return {
        success: false,
        code: err.code as GP_SIGN_AUTH_CODE,
      };
    }

    // logger.error('Unknown error occurred:', err);
    return {
      success: false,
    };
  }
};
