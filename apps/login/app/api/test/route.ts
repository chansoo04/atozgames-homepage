export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getPool, sql } from "lib/dbpool";

export async function GET(request: NextRequest) {
  console.log("시작");
  const pool = await getPool();
  const row = await pool.one(sql`SELECT * FROM account_logs WHERE account_log_id = 1`);
  console.log(row);

  return NextResponse.json({
    result: "success",
  });
}
