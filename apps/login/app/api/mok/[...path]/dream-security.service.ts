// app/api/mok/[...path]/dream-security.service.ts
export const runtime = "nodejs";

// ✅ Webpack 간섭 회피: 런타임 require
const nodeRequire: NodeRequire = eval("require");
const fs = nodeRequire("node:fs");
const path = nodeRequire("node:path");
const { fileURLToPath } = nodeRequire("node:url");

// 벤더 로드 + 실제 파일 위치 디렉터리 반환
function loadMobileOK() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // ① 빌드 산출물 옆( .next/server/... )
  const candVendor1 = path.join(__dirname, "mok_Key_Manager_v1.0.3.js");
  // ② 소스 경로(개발 모드, CWD 기준)
  const candVendor2 = path.join(process.cwd(), "app/api/mok/[...path]/mok_Key_Manager_v1.0.3.js");

  for (const p of [candVendor1, candVendor2]) {
    if (fs.existsSync(p)) {
      return { mod: nodeRequire(p), dir: path.dirname(p) };
    }
  }

  throw new Error(`mok_Key_Manager_v1.0.3.js not found.\n- ${candVendor1}\n- ${candVendor2}`);
}

const { mod: mobileOK, dir: vendorDir } = loadMobileOK();

// 🔐 키 파일 경로 결정 로직
function resolveKeyFilePath(fileName: string): string {
  // A. 절대 경로가 환경변수로 넘어오면 그걸 최우선 사용
  const absFromEnv = process.env.DREAM_SECURITY_KEY_ABS_PATH;
  if (absFromEnv && fs.existsSync(absFromEnv)) return absFromEnv;

  // B. 벤더 파일이 있는 디렉터리 옆에 키 파일이 있는 경우
  const cand1 = path.join(vendorDir, fileName);

  // C. 소스 경로(개발) – CWD 기준
  const cand2 = path.join(process.cwd(), "app/api/mok/[...path]/", fileName);

  // D. 혹시 CWD 루트에 바로 두었을 수도…
  const cand3 = path.join(process.cwd(), fileName);

  for (const p of [cand1, cand2, cand3]) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error(
    `Key file not found: ${fileName}\nTried:\n- ${cand1}\n- ${cand2}\n- ${cand3}${
      absFromEnv ? `\n- ${absFromEnv} (from DREAM_SECURITY_KEY_ABS_PATH)` : ""
    }`,
  );
}

// ---- 초기화 ----
const fileName = process.env.DREAM_SECURITY_KEY_FILE!;
const password = process.env.DREAM_SECURITY_KEY_PASSWORD!;
const keyPath = resolveKeyFilePath(fileName);

// 필요 시 Web Crypto를 기대하는 코드에 대비
(globalThis as any).crypto ??= nodeRequire("node:crypto").webcrypto;

// 실제 초기화
mobileOK.keyInit(keyPath, password);

type DreamSecurityMeta = string;

interface PersonalIdentifyAuthRequest {
  comType: "test" | "dreamsecurity";
  data: TestMeta | DreamSecurityMeta;
}

interface PersonalIdentifyAuthResponse {
  ci: string;
  di?: string;
  name?: string;
  telCode?: number;
  tel?: number;
  birth?: string;
  gender?: string;
  foreign?: boolean;
}

interface TestMeta {
  name: string;
  telCode: number;
  tel: bigint;
}

interface AuthData {
  userName: string; // 사용자 이름
  siteId: string; // 이용기관 ID
  clientTxId: string; // 이용기관 거래 ID
  txId: string; // 본인확인 거래 ID
  providerId: string; // 서비스제공자(인증사업자) ID
  serviceType: string; // 이용 서비스 유형
  ci: string; // 사용자 CI
  di: string; // 사용자 DI
  userPhone: string; // 사용자 전화번호
  userBirthday: string; // 사용자 생년월일
  userGender: string; // 사용자 성별 (1: 남자, 2: 여자)
  userNation: string; // 사용자 국적 (0: 내국인, 1: 외국인)
  reqAuthType: string; // 본인확인 인증 종류
  reqDate: string; // 본인확인 요청 시간
  issuer: string; // 본인확인 인증 서버
  issueDate: string; // 본인확인 인증 시간
}

export function clientTxId(): { serviceId: string; encClientTxId: string } {
  try {
    const clientPrefix = process.env.DREAM_SECURITY_CLIENT_PREFIX;
    const clientTxId = `${clientPrefix + uuid()}|${getCurrentDate()}`;
    const encClientTxId = mobileOK.RSAEncrypt(clientTxId);
    return { serviceId: mobileOK.getServiceId(), encClientTxId };
  } catch (error) {
    console.error(error);
    throw new Error("드림시큐리티 생성 실패");
  }
}

function uuid() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

function getCurrentDate() {
  const newDate = new Date();
  newDate.toLocaleString("ko-kr");

  const year = newDate.getFullYear();
  const mon = newDate.getMonth() + 1;
  const date = newDate.getDate();
  const hour = newDate.getHours();
  const min = newDate.getMinutes();
  const sec = newDate.getSeconds();

  const _mon = mon < 10 ? `0${mon}` : `${mon}`;
  const _date = date < 10 ? `0${date}` : `${date}`;
  const _hour = hour < 10 ? `0${hour}` : `${hour}`;
  const _min = min < 10 ? `0${min}` : `${min}`;
  const _sec = sec < 10 ? `0${sec}` : `${sec}`;

  const reqDate = year + _mon + _date + _hour + _min + _sec;

  return reqDate;
}

export async function getAuthData(req: any): Promise<PersonalIdentifyAuthResponse> {
  // STEP 1. 본인확인 결과 타입별 결과 처리
  // eslint-disable-next-line no-case-declarations
  let encryptMOKResult;

  if (req === null) {
    throw new Error("-1|본인확인 MOKToken 인증결과 응답이 없습니다.");
  } else {
    /* 2.1 본인확인 결과 타입 : MOKToken */
    /* 2.1.1 본인확인 결과요청 입력정보 설정 */
    const authResultRequestObject = {
      // encryptMOKKeyToken: resultRequestObject.encryptMOKKeyToken,
      encryptMOKKeyToken: req,
    };
    /* 2.1.2 본인확인 결과요청 */
    const resultResponseObject = await fetch(process.env.DREAM_SECURITY_URL as string, {
      method: "POST",
      body: JSON.stringify(authResultRequestObject),
    });

    if (!resultResponseObject.ok || typeof resultResponseObject === "undefined") {
      throw new Error("-0|본인확인 서버통신(결과요청)에 실패했습니다.");
    }

    const res = await resultResponseObject.json();
    console.log(res, "res");
    encryptMOKResult = res.encryptMOKResult;

    /* 2.1.3 본인확인 결과요청 실패시 */
    if (res.resultCode !== "2000") {
      throw new Error("본인확인 결과요청에 실패했습니다.");
    }
  }

  if (
    encryptMOKResult === null ||
    encryptMOKResult === "" ||
    typeof encryptMOKResult === "undefined"
  ) {
    throw new Error("-1|본인확인 MOKToken 가 없습니다.");
  }

  // encryptMOKResult 복호화가 실패하는 경우
  let decryptMOKResultJson = null;
  try {
    decryptMOKResultJson = mobileOK.getResult(encryptMOKResult);
  } catch (error) {
    throw new Error("-3|본인확인 결과 복호화 오류");
  }

  const metadata: Partial<AuthData> = JSON.parse(decryptMOKResultJson);
  console.log(metadata, "metadata");

  // * 필수값만 추출
  const result: PersonalIdentifyAuthResponse = {
    ci: metadata.ci as string,
    di: metadata.di,
    name: metadata.userName,
    telCode: 82,
    tel: Number(metadata?.userPhone) ?? 0, // 1012341234n
    birth: metadata?.userBirthday?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") ?? "",
    foreign: metadata.userNation === "1",
    gender: metadata.userGender === "1" ? "M" : "F",
  };

  return result;
}
