// lib/grpc/tls.ts
import fs from "node:fs";

export function loadRootCert(opts: { caPem?: string; caFile?: string }): Buffer | null {
  if (opts.caPem && opts.caPem.trim()) return Buffer.from(opts.caPem);
  if (opts.caFile && fs.existsSync(opts.caFile)) {
    return fs.readFileSync(opts.caFile);
  }
  return null; // 시스템 루트 사용
}
