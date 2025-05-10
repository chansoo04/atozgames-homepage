import { uniq } from "@toss/utils";

export interface StatusQuery {
  status?: string;
}

export interface OffsetPaging {
  /**
   * @minimum 0
   * @default 0
   */
  pageNo?: number;

  /**
   * @minimum 1
   * @maximum 100
   * @default 20
   */
  pageSize?: number;
}

export interface CursorPaging {
  /**
   * @minimum 0
   */
  cursor?: number;

  /**
   * @minimum 1
   * @maximum 100
   */
  take?: number;
}

export type OrderBy<Key extends string> = `${Key}:ASC` | `${Key}:DESC`;
export type OrderBys<Keys extends string[]> = OrderBy<Keys[number]>;
export const parseOrderBys = <T extends string[] = string[]>(orderBys: OrderBys<T>[]) =>
  uniq(orderBys).reduce((acc, cur) => {
    const [key, value] = cur.split(":") as [string, "ASC" | "DESC"];
    return { ...acc, [key === "score" ? "hiddenReviewCount" : key]: value };
  }, {});
