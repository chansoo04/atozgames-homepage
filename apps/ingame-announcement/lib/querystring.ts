import { isNotNil } from "@toss/utils";

export type FlatObject = Record<
  string,
  string | number | boolean | (string | number | boolean)[] | undefined | null
>;

export type SearchParamsInput<T> = { [K in keyof T]?: string | string[] };

export const buildQuerystring = (obj: FlatObject): string => {
  const keys = Object.keys(obj);
  if (!keys.length) return "";
  const searchParams = new URLSearchParams();

  for (const key of keys) {
    const value = obj[key];
    if (!isNotNil(value)) continue;
    if (Array.isArray(value)) value.forEach((val) => searchParams.append(key, String(val)));
    else searchParams.append(key, String(value));
  }

  return searchParams.toString();
};
