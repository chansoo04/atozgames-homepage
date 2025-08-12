import { assert } from "@toss/assert";
import ky, { HTTPError } from "ky";
import type { KyResponse, BeforeRetryHook, BeforeErrorHook } from "ky";
import { buildQuerystring, type FlatObject } from "../querystring";

const getErrorMessage: BeforeErrorHook = async (error) => {
  const body = await error.response?.json();
  error.message = (body as any)?.message ?? error.message;

  return error;
};

assert(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL is not set");
const csr = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_SELF_URL + "api/",
  credentials: "include",
  retry: {
    statusCodes: [401, 403, 408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeError: [getErrorMessage],
  },
  timeout: 60000,
});

/**
 * @deprecated
 */
export const legacy = async <Data>(key: string | [string, FlatObject]) =>
  Array.isArray(key)
    ? await csr.get(key[0] + "?" + buildQuerystring(key[1])).json<Data>()
    : await csr.get(key).json<Data>();

legacy.post = async <Data>(key: string | [string, FlatObject], body?: unknown) =>
  Array.isArray(key)
    ? await csr.post(key[0] + "?" + buildQuerystring(key[1]), { json: body }).json<Data>()
    : await csr.post(key, { json: body }).json<Data>();

legacy.delete = async <Data>(key: string | [string, FlatObject], body?: unknown) =>
  Array.isArray(key)
    ? await csr.delete(key[0] + "?" + buildQuerystring(key[1]), { json: body }).json<Data>()
    : await csr.delete(key, { json: body }).json<Data>();

legacy.put = async <Data>(key: string | [string, FlatObject], body?: unknown) =>
  Array.isArray(key)
    ? await csr.put(key[0] + "?" + buildQuerystring(key[1]), { json: body }).json<Data>()
    : await csr.put(key, { json: body }).json<Data>();

legacy.patch = async <Data>(key: string | [string, FlatObject], body?: unknown) =>
  Array.isArray(key)
    ? await csr.patch(key[0] + "?" + buildQuerystring(key[1]), { json: body }).json<Data>()
    : await csr.patch(key, { json: body }).json<Data>();

export default csr;
