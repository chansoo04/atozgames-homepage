// lib/grpc/registry.ts
import "server-only";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "node:path";
import fs from "node:fs";
import { loadRootCert } from "./tls";

let _grpcObj: any | null = null;
let _loadedOnce = false;
const _clientCache = new Map<string, any>();

function collectProtoFilesAndDirs(root: string) {
  const files: string[] = [];
  const dirSet = new Set<string>();

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let hasProto = false;
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(p);
      } else if (ent.isFile() && p.endsWith(".proto")) {
        files.push(p);
        hasProto = true;
      }
    }
    if (hasProto) dirSet.add(dir);
  };

  walk(root);
  return { files, includeDirs: Array.from(dirSet) };
}

function loadGrpcObj(): any {
  if (_grpcObj && _loadedOnce) return _grpcObj;

  const protoRoot = path.resolve(
    process.cwd(),
    process.env.GRPC_PROTO_ROOT || "shared/grpc/src/proto",
  );
  if (!fs.existsSync(protoRoot)) {
    throw new Error(`GRPC_PROTO_ROOT not found: ${protoRoot}`);
  }

  const { files, includeDirs } = collectProtoFilesAndDirs(protoRoot);
  if (files.length === 0) {
    throw new Error(`No .proto files found under: ${protoRoot}`);
  }

  const LOADER_OPTIONS: protoLoader.Options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: false,
    arrays: true,
    includeDirs, // ★ 동적으로 수집한 모든 디렉토리
  };

  const pkgDef = protoLoader.loadSync(files, LOADER_OPTIONS);
  _grpcObj = grpc.loadPackageDefinition(pkgDef);
  _loadedOnce = true;
  return _grpcObj;
}

function listAvailableServicesInternal(): string[] {
  const obj = loadGrpcObj();
  const out: string[] = [];
  const walk = (prefix: string, node: any) => {
    for (const k of Object.keys(node || {})) {
      const v = node[k];
      const name = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "function" && "service" in v) {
        out.push(name);
      } else if (v && typeof v === "object") {
        walk(name, v);
      }
    }
  };
  walk("", obj);
  return out.sort();
}

function envKeyOf(fqn: string): string {
  return fqn
    .split(".")
    .join("_")
    .replace(/([a-z])([A-Z])/g, (_m, a, b) => `${a}_${b}`)
    .toUpperCase();
}

function buildCredentialsAndOptions(fqn: string): {
  addr: string;
  creds: grpc.ChannelCredentials;
  options: grpc.ChannelOptions;
} {
  const base = "GRPC_DEFAULT_";
  const svc = `GRPC_${envKeyOf(fqn)}_`;

  const addr = process.env[`${svc}ADDR`] || process.env[`${base}ADDR`] || "localhost:50051";
  const tls = process.env[`${svc}TLS`] || process.env[`${base}TLS`] || "0";
  const caPem = process.env[`${svc}CA_PEM`] || process.env[`${base}CA_PEM`] || "";
  const caFile = process.env[`${svc}CA_FILE`] || process.env[`${base}CA_FILE`] || "";
  const servername = process.env[`${svc}SERVERNAME`] || process.env[`${base}SERVERNAME`];

  let creds: grpc.ChannelCredentials;
  if (tls === "1") {
    const rootCert = loadRootCert({ caPem, caFile }) || undefined;
    creds = grpc.credentials.createSsl(rootCert);
  } else {
    creds = grpc.credentials.createInsecure(); // h2c (prior-knowledge)
  }

  const options: grpc.ChannelOptions = {
    "grpc.keepalive_time_ms": 30_000,
    "grpc.keepalive_timeout_ms": 5_000,
    "grpc.max_receive_message_length": 20 * 1024 * 1024,
    ...(servername ? { "grpc.ssl_target_name_override": servername } : {}),
  };

  return { addr, creds, options };
}

function getServiceCtorByFqn(fqn: string): new (...args: any[]) => any {
  const obj = loadGrpcObj();
  const parts = fqn.split(".").filter(Boolean);
  if (parts.length < 2) throw new Error(`FQN must be "package.Service", got: ${fqn}`);

  const serviceName = parts.pop()!;
  let cursor: any = obj;
  for (const ns of parts) {
    cursor = cursor?.[ns];
    if (!cursor) throw new Error(`Package not found while resolving "${fqn}" at "${ns}".`);
  }
  const Ctor = cursor?.[serviceName];
  if (!Ctor || typeof Ctor !== "function" || !("service" in Ctor)) {
    const hint = listAvailableServicesInternal().slice(0, 20).join(", ");
    throw new Error(`Service constructor not found for "${fqn}".\nAvailable (partial): ${hint}`);
  }
  return Ctor as new (...args: any[]) => any;
}

export function listAvailableServices(): string[] {
  return listAvailableServicesInternal();
}

export function getClient<TClient = any>(fqn: string): TClient {
  if (_clientCache.has(fqn)) return _clientCache.get(fqn);
  const Ctor = getServiceCtorByFqn(fqn);
  const { addr, creds, options } = buildCredentialsAndOptions(fqn);
  const client = new (Ctor as any)(addr, creds, options);
  _clientCache.set(fqn, client);
  return client as TClient;
}

export function promisifyUnary<TReq extends object, TRes = unknown>(
  fn: (req: TReq, cb: (err: grpc.ServiceError | null, res?: TRes) => void) => void,
  req: TReq,
): Promise<TRes> {
  return new Promise<TRes>((resolve, reject) => {
    fn(req, (err, res) => (err ? reject(err) : resolve(res as TRes)));
  });
}

export function grpcErrorToHttpStatus(code?: number): number {
  switch (code) {
    case grpc.status.NOT_FOUND:
      return 404;
    case grpc.status.INVALID_ARGUMENT:
      return 400;
    case grpc.status.UNAUTHENTICATED:
      return 401;
    case grpc.status.PERMISSION_DENIED:
      return 403;
    case grpc.status.ALREADY_EXISTS:
      return 409;
    case grpc.status.UNAVAILABLE:
      return 503;
    case grpc.status.DEADLINE_EXCEEDED:
      return 504;
    default:
      return 500;
  }
}
