import { UserCredential } from "firebase/auth";
import { adminAuth } from "lib/firebaseAdmin";
import {
  GpSign,
  GpSignProvider,
  GpCookie,
  PROVIDER_COOKIE_MAP,
  GP_SIGN_AUTH_CODE,
} from "common/cookie";
import {
  providerValidator,
  providerToString,
  getSessionByProvider,
} from "../cookie/cookie.service";

export async function verifyCredential(userCredential: UserCredential) {
  try {
    const user = userCredential.user;
    const stsTokenManager = (user as any)["stsTokenManager"];
    const idToken = await adminAuth.verifyIdToken(stsTokenManager.accessToken, true);

    return {
      accountName: user.email ?? "",
      accessToken: stsTokenManager.accessToken,
      refreshToken: stsTokenManager.refreshToken,
      idToken,
    };
  } catch (err: any) {
    throw new Error(err.message);
  }
}

/**
 * check supported provider
 * OR
 * detect provider from firebase.sign_in_provider
 */
export function checkProvider(provider: string): string {
  let result = undefined;
  switch (provider) {
    // group of not used firebase providers
    case "facebook.com":
    case "github.com":
    case "twitter.com":
    case "microsoft.com":
    case "yahoo.com":
    case "phone":
    case "playgames.google.com":
    case "gc.apple.com":
    case "linkedin.com":
      throw new Error("not supported provider");

    // group of normal providers
    case "password":
      result = "id";
      break;
    case "google.com":
    case "google":
    case "apple.com":
    case "apple":
      result = provider.split(".")[0];
      break;

    default: {
      // case 'saml.provider':
      const isSAML = RegExp(/^saml\./).test(provider);
      if (isSAML) result = provider;

      // case 'oidc.provider':
      const isOIDC = RegExp(/^oidc\./).test(provider);
      if (isOIDC) result = provider;

      // case 'custom':
      // case 'anonymous':
      const allow3rdParty = [...["naver", "naver.com"], ...["kakao", "kakao.com"]];
      if (allow3rdParty.includes(provider?.toLowerCase())) {
        result = provider.split(".")[0];
      }
    }
  } // end switch

  // empty or not supported
  if (result === undefined) {
    throw new Error("not supported provider");
  }

  result = result.toUpperCase();
  return result;
}

// provider별로 쿠키에서 sign을 찾는 함수
export async function getSign(
  provider: string | GpSignProvider,
  element: Partial<GpSign>,
): Promise<GpSign> {
  // logger.debug(`getSign ${provider}`, element);
  if (providerValidator(provider) === false) {
    console.log(provider, "provider!!!");
    console.log(element, "element");
    // logger.error("getSign", `Invalid provider ${provider}`);
    throw new Error("Invalid provider");
  }
  provider = providerToString(provider);
  const session = await getSessionByProvider(provider);
  let key: keyof GpSign | undefined;
  for (const [k, v] of Object.entries(element)) {
    if (v) key = k as keyof GpSign;
  }
  if (!key) {
    // logger.debug("getSign No key found in element:", element);
    return {} as GpSign;
  }
  let find: GpSign | undefined;
  switch (key) {
    case "id":
      find = session.list.find((s) => s.id === element.id);
      break;
    case "token":
      find = session.list.find((s) => s.token === element.token);
      break;
    case "uid":
      find = session.list.find((s) => s.uid === element.uid);
      break;
  }
  if (!find) {
    // logger.debug("getSign No sign found");
    return {} as GpSign;
  }
  find.provider = provider;
  // logger.debug("getSign", find);
  return find;
}

// 모든 provider의 lastLogin을 찾아 반환
export async function getLastSign(): Promise<GpSign | null> {
  const allData: GpCookie = {};
  for (const provider of Object.keys(PROVIDER_COOKIE_MAP)) {
    const session = await getSessionByProvider(provider);
    allData[provider as keyof GpCookie] = session || [];
  }

  if (!allData) {
    return null;
  }

  const allProviders = Object.keys(allData);
  for (const provider of allProviders) {
    const signs = allData[provider as keyof GpCookie]?.list;
    for (const sign of signs || []) {
      if (sign.lastLogin) {
        sign.provider = provider;
        // logger.debug('getLastSign', sign);
        return sign;
      }
    }
  }
  return null;
}

// provider별로 sign을 추가/수정
export async function setSign(sign: GpSign): Promise<boolean> {
  if (!sign || !sign.uid) {
    throw new Error("Invalid sign object");
  }

  if (providerValidator(sign.provider as string) === false) {
    throw new Error("Invalid provider");
  }

  sign.provider = providerToString(sign.provider as string);
  const session = await getSessionByProvider(sign.provider);
  const signList = session.list;

  if (signList.length === 5) {
    throw new Error("save limit");
  }

  delete sign.provider;
  const index = signList.findIndex((s) => s.uid === sign.uid);
  if (index !== -1) {
    signList[index] = sign;
  } else {
    signList.push(sign);
  }
  await session.save();
  // logger.debug('setSign', sign);
  return true;
}

export async function handleSign(gpSign: GpSign, res: any) {
  // * 로그인 성공
  if (res.success) {
    // logger.debug('handelSign res.success true');
    if (res.authCode) {
      // logger.debug('handelSign res.authCode true');
      // * 토큰 만료 및 갱신
      if (res.authCode === GP_SIGN_AUTH_CODE.EXPIRED_AND_RENEWED) {
        gpSign.token = res.idToken;
      } else {
        // logger.error('Unhandled authCode:', res.authCode);
      }
    } else if (res.idToken) {
      // logger.debug('handelSign res.authCode false');
      gpSign.token = res.idToken;
      gpSign.uid = res.firebaseUid;
    }

    const lastSign = await getLastSign();
    if (lastSign && lastSign.uid !== gpSign.uid) {
      lastSign.lastLogin = false;
      await setSign(lastSign);
    }

    gpSign.lastLogin = true;
    await setSign(gpSign);

    // * 정상 로그인
    return true;
  }
  // * 로그인 실패 - 기본적으로는 front에서 처리
  // 토큰 관련 처리가 필요할 경우
  else {
    // logger.error('handelSign res.success false');
    // * 실패 사유에 따라 처리
    if (res.authCode) {
      const code = res.authCode as GP_SIGN_AUTH_CODE;
      switch (code as GP_SIGN_AUTH_CODE) {
        case GP_SIGN_AUTH_CODE.ALREADY_SIGND: // * 이미 로그인 되어있음
        case GP_SIGN_AUTH_CODE.NEED_CREDENTIAL: // * 자격 증명 필요
        case GP_SIGN_AUTH_CODE.RELOGIN_REQUIRED: // * 재로그인 필요
        case GP_SIGN_AUTH_CODE.INVALID_TOKEN: // * 잘못된 토큰
          console.error("Sign in failed:", code);
          break;
        default: {
          console.error("Undefined authCode:", code);
        }
      }
    }
    // * 알수 없는 에러
    else {
      console.error("Unknown error occurred:", res.errorMessage);
      // logger.error("Unknown error occurred:", res.errorMessage);
    }
  }
  return false;
}
