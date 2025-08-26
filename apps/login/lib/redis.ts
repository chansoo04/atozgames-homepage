// lib/redis.ts
import "server-only";
import { Cluster } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Cluster | undefined;
}

const host = process.env.REDIS_URL;
const password = process.env.REDIS_PASSWORD || undefined;
const port = 6379;

function createCluster(): Cluster {
  if (!host) {
    throw new Error("[redis] Missing REDIS_URL");
  }

  const cluster = new Cluster([{ host, port }], {
    scaleReads: "slave", // 읽기 부하 분산(선택)
    dnsLookup: (addr, cb) => cb(null, addr),
    redisOptions: {
      password,
      // TLS 권장: 인증서 호스트 검증을 위해 servername 지정
      tls: { servername: host },
      enableAutoPipelining: true,
      maxRetriesPerRequest: 2,
    },
  });
  return cluster;
}

export const redis = global.__redis__ ?? createCluster();

if (process.env.NODE_ENV !== "production") {
  global.__redis__ = redis; // 개발(HMR) 중 중복 생성 방지
}
