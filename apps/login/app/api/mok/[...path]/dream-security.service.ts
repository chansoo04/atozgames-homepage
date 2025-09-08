// app/api/mok/[...path]/dream-security.service.ts
// ✅ Node 런타임 강제
export const runtime = "nodejs";

/**
 * 드림시큐리티 MobileOK 연동 유틸
 * - 벤더 JS(mok_Key_Manager_v1.0.3.js) 위치 자동 탐색
 * - 키 파일(dev_mok_keyInfo.dat 등) 경로 자동 탐색 + ENV 절대경로 우선
 * - keyInit 실행 및 serviceId 로깅/주입
 * - 클라이언트 거래 ID 생성(RSAEncrypt) 및 결과 복호화(getResult)
 *
 * 필요 ENV:
 *   DREAM_SECURITY_KEY_FILE=dev_mok_keyInfo.dat          // 키파일명
 *   DREAM_SECURITY_KEY_PASSWORD=********                 // 키파일 비밀번호
 *   DREAM_SECURITY_CLIENT_PREFIX=ATOZ                    // 거래ID prefix (선택)
 *   DREAM_SECURITY_URL=https://...                       // 결과요청 서버 URL (getAuthData에서 사용)
 *   DREAM_SECURITY_SERVICE_ID=YOUR_SERVICE_ID            // 라이브러리 필요 시 주입(선택)
 *   DREAM_SECURITY_KEY_ABS_PATH=/abs/path/to/key.dat     // 절대경로로 고정하고 싶으면 (선택)
 */

// ⚠️ ESM 환경에서 require 사용(Next App Router)
const nodeRequire: NodeRequire = eval("require");
const fs = nodeRequire("node:fs");
const path = nodeRequire("node:path");
const { fileURLToPath } = nodeRequire("node:url");

// --- 벤더 JS 로드 ------------------------------------------------------------
function loadMobileOK() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // ① 빌드 산출물 옆(.next/server/**/app/api/mok/[...path]/)
  const cand1 = path.join(__dirname, "mok_Key_Manager_v1.0.3.js");

  // ② 모노레포 소스 경로(CWD 기준)
  const cand2 = path.join(
    process.cwd(),
    "apps/login/app/api/mok/[...path]/mok_Key_Manager_v1.0.3.js",
  );

  for (const p of [cand1, cand2]) {
    if (fs.existsSync(p)) {
      console.log(`[DREAM] vendor found: ${p}`);
      return { mod: nodeRequire(p), dir: path.dirname(p) };
    } else {
      console.warn(`[DREAM] vendor not found try: ${p}`);
    }
  }

  throw new Error(`mok_Key_Manager_v1.0.3.js not found.\n- ${cand1}\n- ${cand2}`);
}

const { mod: mobileOK, dir: vendorDir } = loadMobileOK();

// --- 키 파일 경로 결정 --------------------------------------------------------
function resolveKeyFilePath(fileName: string): string {
  // A. 절대경로 ENV가 있으면 최우선
  const absFromEnv = process.env.DREAM_SECURITY_KEY_ABS_PATH;
  if (absFromEnv && fs.existsSync(absFromEnv)) {
    console.log(`[DREAM] key(abs) used: ${absFromEnv}`);
    return absFromEnv;
  }

  // B. 벤더 파일 옆
  const cand1 = path.join(vendorDir, fileName);

  // C. 모노레포 소스 경로
  const cand2 = path.join(process.cwd(), "apps/login/app/api/mok/[...path]/", fileName);

  // D. CWD 루트
  const cand3 = path.join(process.cwd(), fileName);

  for (const p of [cand1, cand2, cand3]) {
    if (fs.existsSync(p)) {
      console.log(`[DREAM] key(found): ${p}`);
      return p;
    } else {
      console.warn(`[DREAM] key(not found try): ${p}`);
    }
  }

  throw new Error(
    `Key file not found: ${fileName}\nTried:\n- ${cand1}\n- ${cand2}\n- ${cand3}${absFromEnv ? `\n- ${absFromEnv} (from DREAM_SECURITY_KEY_ABS_PATH)` : ""}`,
  );
}

// --- 초기화 (keyInit / serviceId) --------------------------------------------
const fileName = process.env.DREAM_SECURITY_KEY_FILE!;
const password = process.env.DREAM_SECURITY_KEY_PASSWORD!;

if (!fileName || !password) {
  throw new Error(`[DREAM] env missing: DREAM_SECURITY_KEY_FILE or DREAM_SECURITY_KEY_PASSWORD`);
}

const keyPath = resolveKeyFilePath(fileName);
console.log(`[DREAM] keyPath=${keyPath}`);

// Node 20 글로벌 fetch/crypto 사용 (crypto 없으면 주입)
(globalThis as any).crypto ??= nodeRequire("node:crypto").webcrypto;

// keyInit 실행
try {
  const ret = mobileOK.keyInit(keyPath, password);
  console.log(`[DREAM] keyInit ret=`, ret);
} catch (e) {
  console.error(`[DREAM] keyInit throw:`, e);
  throw e;
}

// serviceId 확인/주입(라이브러리가 제공하는 경우에만)
try {
  const currentSvc = mobileOK.getServiceId && mobileOK.getServiceId();
  if (!currentSvc && process.env.DREAM_SECURITY_SERVICE_ID && mobileOK.setServiceId) {
    mobileOK.setServiceId(process.env.DREAM_SECURITY_SERVICE_ID);
    console.log(`[DREAM] setServiceId(${process.env.DREAM_SECURITY_SERVICE_ID})`);
  }
  const svc = mobileOK.getServiceId && mobileOK.getServiceId();
  console.log(`[DREAM] serviceId=`, svc);
} catch (e) {
  console.warn(`[DREAM] serviceId check error:`, e);
}

// --- 공개 타입 ---------------------------------------------------------------
type DreamSecurityMeta = string;

interface PersonalIdentifyAuthRequest {
  comType: "test" | "dreamsecurity";
  data: TestMeta | DreamSecurityMeta;
}

export interface PersonalIdentifyAuthResponse {
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
  userName: string;
  siteId: string;
  clientTxId: string;
  txId: string;
  providerId: string;
  serviceType: string;
  ci: string;
  di: string;
  userPhone: string;
  userBirthday: string;
  userGender: string; // "1" 남 / "2" 여
  userNation: string; // "0" 내국인 / "1" 외국인
  reqAuthType: string;
  reqDate: string;
  issuer: string;
  issueDate: string;
}

// --- 유틸 --------------------------------------------------------------------
function uuid() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCurrentDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mm = `${d.getMinutes()}`.padStart(2, "0");
  const ss = `${d.getSeconds()}`.padStart(2, "0");
  return `${y}${m}${day}${hh}${mm}${ss}`;
}

// --- 공개 함수 ---------------------------------------------------------------

/**
 * clientTxId 생성 및 암호화
 * - serviceId: 라이브러리 내부/주입된 값
 * - encClientTxId: RSAEncrypt 결과
 */
export function clientTxId(): { serviceId: string; encClientTxId: string } {
  try {
    const clientPrefix = process.env.DREAM_SECURITY_CLIENT_PREFIX || "";
    const raw = `${clientPrefix}${uuid()}|${getCurrentDate()}`;

    const encClientTxId = mobileOK.RSAEncrypt(raw);
    const serviceId = mobileOK.getServiceId && mobileOK.getServiceId();

    if (!encClientTxId) throw new Error(`[DREAM] RSAEncrypt returned empty`);
    if (!serviceId) throw new Error(`[DREAM] getServiceId returned empty`);

    return { serviceId, encClientTxId };
  } catch (error) {
    console.error(`[DREAM] clientTxId error:`, error);
    throw new Error("드림시큐리티 생성 실패");
  }
}

/**
 * DreamSecurity 결과 요청 → 복호화 → 필수 항목만 반환
 * @param req encryptMOKKeyToken or 전체 결과 객체
 */
export async function getAuthData(req: any): Promise<PersonalIdentifyAuthResponse> {
  let encryptMOKResult: string | null = null;

  try {
    if (req == null) {
      throw new Error("-1|본인확인 MOKToken 인증결과 응답이 없습니다.");
    }

    const url = process.env.DREAM_SECURITY_URL as string;
    if (!url) {
      throw new Error("DREAM_SECURITY_URL env is missing");
    }

    // 서버로 결과 요청
    const resultResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encryptMOKKeyToken: req }),
    });

    if (!resultResponse.ok) {
      const text = await resultResponse.text().catch(() => "");
      console.error(`[DREAM] resultResponse not ok`, {
        status: resultResponse.status,
        statusText: resultResponse.statusText,
        body: text.slice(0, 400),
      });
      throw new Error("-0|본인확인 서버통신(결과요청)에 실패했습니다.");
    }

    const res = await resultResponse.json();
    console.log(`[DREAM] resultResponse.json()`, res);

    if (res.resultCode !== "2000") {
      throw new Error("본인확인 결과요청에 실패했습니다.");
    }

    encryptMOKResult = res.encryptMOKResult ?? null;

    if (!encryptMOKResult) {
      throw new Error("-1|본인확인 MOKToken 가 없습니다.");
    }
  } catch (e) {
    console.error(`[DREAM] getAuthData request error:`, e);
    throw e;
  }

  // 복호화
  try {
    const decryptMOKResultJson = mobileOK.getResult(encryptMOKResult);
    const metadata: Partial<AuthData> = JSON.parse(decryptMOKResultJson);
    console.log(`[DREAM] metadata`, metadata);

    const result: PersonalIdentifyAuthResponse = {
      ci: metadata.ci as string,
      di: metadata.di,
      name: metadata.userName,
      telCode: 82,
      tel: Number(metadata?.userPhone) || 0,
      birth: metadata?.userBirthday?.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") || "",
      foreign: metadata.userNation === "1",
      gender: metadata.userGender === "1" ? "M" : "F",
    };
    return result;
  } catch (e) {
    console.error(`[DREAM] decrypt/getResult error:`, e);
    throw new Error("-3|본인확인 결과 복호화 오류");
  }
}
