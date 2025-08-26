import { UserCredential } from "firebase/auth";
import { adminAuth } from "lib/firebaseAdmin";

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
