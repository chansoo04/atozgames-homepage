// apps/login/src/lib/db/pool.ts
import "server-only";
import { createPool, type DatabasePool, sql } from "slonik";

// 모듈 스코프 캐시 (HMR 시 리로드되면 초기화될 수 있음)
const pools = new Map<string, DatabasePool>();

function readBaseEnv() {
  const PGHOST = process.env.PGHOST;
  const PGUSER_RAW = process.env.PGUSER;
  const PGPASSWORD_RAW = process.env.PGPASSWORD;
  const PGPORT = process.env.PGPORT;

  if (!PGHOST || !PGUSER_RAW || !PGPASSWORD_RAW || !PGPORT) {
    throw new Error("Postgres base env missing. Required: PGHOST, PGUSER, PGPASSWORD, PGPORT");
  }

  return {
    host: PGHOST,
    user: encodeURIComponent(PGUSER_RAW),
    pass: encodeURIComponent(PGPASSWORD_RAW),
    port: PGPORT,
  };
}

function buildDsn(dbName: string) {
  const { host, user, pass, port } = readBaseEnv();
  const db = encodeURIComponent(dbName);
  return `postgres://${user}:${pass}@${host}:${port}/${db}`;
}

function createDbPool(dbName: string): DatabasePool {
  const dsn = buildDsn(dbName);
  return createPool(dsn, {
    // 원 코드 옵션 유지
    captureStackTrace: false,
    interceptors: [],
    maximumPoolSize: 10,
    idleTimeout: 30_000,
    statementTimeout: 30_000,
    connectionTimeout: 10_000,
  });
}

/**
 * DB 이름으로 풀 획득 (필수)
 * @param dbName 대상 데이터베이스 이름 (필수, 빈 문자열 불가)
 */
export function getPool(dbName: string): DatabasePool {
  if (!dbName || dbName.trim() === "") {
    throw new Error("dbName is required");
  }
  const key = dbName.trim();

  const existing = pools.get(key);
  if (existing) return existing;

  const created = createDbPool(key);
  pools.set(key, created);
  return created;
}

/** (선택) 특정 풀 종료 및 제거 */
export async function closePool(dbName: string): Promise<void> {
  const p = pools.get(dbName);
  if (p) {
    await p.end().catch(() => {});
    pools.delete(dbName);
  }
}

/** (선택) 모든 풀 종료 */
export async function closeAllPools(): Promise<void> {
  await Promise.all(Array.from(pools.values(), (p) => p.end().catch(() => {})));
  pools.clear();
}

export { sql };
