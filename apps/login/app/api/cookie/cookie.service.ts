import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";
import { GpCookie, GpSignList, GpSignProvider, PROVIDER_COOKIE_MAP } from "common/cookie";

function providerValidator(provider: string | GpSignProvider): boolean {
  if (typeof provider === "string") {
    provider = provider.toUpperCase() as GpSignProvider;
  }
  switch (provider) {
    case GpSignProvider.ID:
    case GpSignProvider.PASSWORD:
    case GpSignProvider.GOOGLE:
    case GpSignProvider.KAKAO:
    case GpSignProvider.NAVER:
    case GpSignProvider.APPLE:
      return true;
    default:
      return false;
  }
}

// provider별 세션을 가져오는 함수
async function getSessionByProvider(provider: string): Promise<IronSession<GpSignList>> {
  const cookiePassword = process.env.COOKIE_PASSWORD;
  const cookieName = PROVIDER_COOKIE_MAP[provider];
  // logger.warning(`getSessionByProvider ${provider} cookieName: ${cookieName}`);
  if (!cookieName) {
    // logger.error('getSessionByProvider', `Invalid provider ${provider}`);
    throw new Error("Invalid provider");
  }
  const cookie = await getIronSession<GpSignList>(cookies(), {
    cookieName,
    password: cookiePassword!,
    cookieOptions: {
      secure: process.env["RUN_MODE"] === "local" ? false : true,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  });
  // logger.debug(`getSessionByProvider ${provider}`, cookie);
  if (!Array.isArray(cookie.list) || cookie.list.length === 0) {
    // 초기화
    cookie.list = [];
    await cookie.save();
  }

  cookie.list = cookie.list.map((sign) => {
    // provider가 없으면 추가
    if (!sign.provider) {
      sign.provider = provider;
    } else if (typeof sign.provider === "string") {
      // 문자열로 되어있으면 enum으로 변환
      switch (sign.provider) {
        case "ID":
        case "PASSWORD":
          sign.provider = GpSignProvider.ID;
          break;
        case "GOOGLE":
          sign.provider = GpSignProvider.GOOGLE;
          break;
        case "APPLE":
          sign.provider = GpSignProvider.APPLE;
          break;
        case "KAKAO":
          sign.provider = GpSignProvider.KAKAO;
          break;
        case "NAVER":
          sign.provider = GpSignProvider.NAVER;
          break;
        default:
          throw new Error("Invalid Provider");
      }
    }
    return sign;
  });

  return cookie;
}

// provider별로 쿠키를 읽어와 GpCookie로 합치는 함수
export async function getAll(): Promise<GpCookie> {
  const result: GpCookie = {};
  for (const provider of Object.keys(PROVIDER_COOKIE_MAP)) {
    const session = await getSessionByProvider(provider);
    result[provider as keyof GpCookie] = session || [];
  }
  return result;
}

//
