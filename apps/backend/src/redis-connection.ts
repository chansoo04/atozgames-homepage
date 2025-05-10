import type { ConnectionOptions } from "bullmq";

// 대충 만들었음. 오작동할 수 있음.
export const redisConnectionOptionsFromUrl = (url: string): ConnectionOptions => {
  const pathname = url.split("//")[1] ?? "";
  const isTls = url.startsWith("rediss://");
  if (pathname.includes("@")) {
    const [first, second] = pathname.split("@");
    const [username, password] = first.split(":");
    const [host, port] = second.split(":");
    return {
      username,
      password,
      host,
      port: Number(port),
      ...(isTls ? { tls: {}, enableTLSForSentinelMode: false } : {}),
    };
  }
  const [host, port] = pathname.split(":");
  return { host, port: Number(port) };
};

export const connection = () => redisConnectionOptionsFromUrl(process.env.REDIS_URL ?? "");
