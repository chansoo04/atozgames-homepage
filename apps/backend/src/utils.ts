import { sql } from "slonik";

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

export const pagination = ({ pageNo = 0, pageSize = 20 }: OffsetPaging) =>
  sql`LIMIT ${pageSize} OFFSET ${pageNo * pageSize}`;
