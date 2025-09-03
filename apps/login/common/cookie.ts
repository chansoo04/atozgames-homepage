export enum GpSignProvider {
  "ID" = "ID",
  "PASSWORD" = "PASSWORD",
  "GOOGLE" = "GOOGLE",
  "APPLE" = "APPLE",
  "KAKAO" = "KAKAO",
  "NAVER" = "NAVER",
}

export interface GpSign {
  /** sign 계정명 */
  id?: string;
  // /** PASSWORD 일때만 사용 */
  // password?: string;
  /** Firebase에서 발급받은 uid */
  uid?: string;
  /** Firebase에서 발급받은 idToken */
  token?: string;
  /** 마지막 sign 계정 여부 */
  lastLogin?: boolean;

  //! not saved
  provider?: string | GpSignProvider;
}

export interface GpSignList {
  list: GpSign[];
}

export interface GpCookie {
  PASSWORD?: GpSignList;
  GOOGLE?: GpSignList;
  APPLE?: GpSignList;
  KAKAO?: GpSignList;
  NAVER?: GpSignList;
}

const COOKIE_PASSWORD = "GP_COOKIE_PASSWORD";
const COOKIE_GOOGLE = "GP_COOKIE_GOOGLE";
const COOKIE_APPLE = "GP_COOKIE_APPLE";
const COOKIE_KAKAO = "GP_COOKIE_KAKAO";
const COOKIE_NAVER = "GP_COOKIE_NAVER";

export const PROVIDER_COOKIE_MAP: Record<string, string> = {
  PASSWORD: COOKIE_PASSWORD,
  GOOGLE: COOKIE_GOOGLE,
  APPLE: COOKIE_APPLE,
  KAKAO: COOKIE_KAKAO,
  NAVER: COOKIE_NAVER,
};

export class GpSignProviderConverter {
  public static ID = "ID";
  public static PASSWORD = "PASSWORD";
  public static GOOGLE = "GOOGLE";
  public static APPLE = "APPLE";
  public static KAKAO = "KAKAO";
  public static NAVER = "NAVER";
}
