import { NextRequest, NextResponse } from "next/server";
import * as AUTH from "./auth.service";
import { redis } from "lib/redis";
import { getPool, sql } from "lib/dbpool";
import assert from "assert";
import dayjs from "lib/dayjs";

// game-auth.controller.ts -> gameAuthService, AccountSignIn
export async function POST(req: NextRequest) {
  const data = await req.json();
  const user_api_pool = await getPool(process.env.PG_USER_API_DB as string);
  const economy_api_pool = await getPool(process.env.PG_ECONOMY_API_DB as string);

  // STEP 1. credential 검증
  const { accountName, accessToken, refreshToken, idToken } = await AUTH.verifyCredential(
    data.credential,
  );
  const provider = idToken.firebase.sign_in_provider;
  const providerId = AUTH.checkProvider(provider);

  await redis.set(idToken.uid, JSON.stringify({ accessToken, refreshToken }));

  // STEP 2-1. 계정 존재 여부 확인
  try {
    const account = await user_api_pool.maybeOne(
      sql`SELECT * FROM accounts WHERE firebase_uid = ${idToken.uid}`,
    );
    console.log(account, "account");

    assert(account, "account_not_found");

    const now = dayjs().tz("UTC");
    const toDay = now.startOf("day");
    // 오늘 로그인인지 체크..
    const isLoginToday = Boolean(
      account.last_login_at &&
        dayjs(account.last_login_at as unknown as number)
          .tz("UTC")
          .startOf("day")
          .isSame(toDay),
    );

    // STEP 2-2. 로그인 기록 업데이트
    await user_api_pool.transaction(async (t) => {
      // TODO: 체크 필요.. continous_day는 뭐지..?
      await t.query(sql`
UPDATE accounts
SET 
    last_login_at = ${now.toISOString()},
    updated_at = ${now.toISOString()},
    continuous_day = ${isLoginToday ? account.continuous_day : (account.continuous_day as number) + 1}
WHERE firebase_uid = ${idToken.uid}`);

      await t.query(sql`
INSERT INTO account_logs
(user_id, account_id, action_type)
VALUES
(${account.user_id}, ${account.account_id}, 'SIGN_IN')
`);
    });

    // TODO [info] refresh my profile - account.signIn

    // STEP 3. 내 밸런스 가져오기
    const { balance, moneyBox } = await economy_api_pool.transaction(async (t) => {
      const balance: null | any = await t.maybeOneFirst(sql`
SELECT * FROM balances WHERE account_id = ${account.account_id}
`);
      if (balance) {
        const now = dayjs().tz("UTC");

        // 한도 정지 풀림 시간이 현재 시간보다 과거인 경우
        if (balance.pause_at && now.isAfter(dayjs(balance.pause_at).tz("UTC"))) {
          // pauseAt 초기화
          // TODO: 성현 확인..
          await user_api_pool.query(sql`

`);
        }
      }

      const moneyBox = await t.maybeOneFirst(sql`
SELECT * FROM money_boxes WHERE account_id = ${account.account_id}
`);
      return { balance, moneyBox };
    });
    // 현재 시간이 pauseAt 이후인지 확인
    // pauseAt이 설정되어 있고, 현재 시간이 pauseAt 이후인 경우
    // pauseAt 초기화
    // TODO: pauseAt이 정지 풀리는 시간인지? 정지 시간인지?

    // const balance = await
  } catch (err: any) {
    console.error(err.message, "ERROR");
    return NextResponse.json(
      {
        success: false,
        errorMessage: err.message,
      },
      {
        status: 400,
      },
    );
  }
  console.log(idToken.uid, "uid");

  return NextResponse.json({
    success: true,
    accountName,
    idToken,
    providerId,
    accessToken,
  });
}
