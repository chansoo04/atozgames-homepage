import { NextRequest, NextResponse } from "next/server";
import { getAuthData } from "../mok/[...path]/dream-security.service";
import { getPool, sql } from "lib/dbpool";
import dayjs from "lib/dayjs";
import { generateRandomN } from "./mersenneTwister";
import { redis } from "lib/redis";

export async function POST(request: NextRequest) {
  const user_api_pool = await getPool(process.env.PG_USER_API_DB as string);

  try {
    const data = await request.json();

    let result: any = null;
    switch (data.action) {
      // account
      case "isExistEmail":
        break;
      case "isExistAccount":
        break;
      case "getNickByFirebaseUid":
        break;
      case "withdrawalRevoke":
        break;
      // user
      case "getIdentityRequestParam":
        break;
      case "createUser":
        // eslint-disable-next-line no-case-declarations
        const auth = JSON.parse(data.option.auth);
        console.log(auth, "auth");

        switch (auth.comType) {
          case "test":
            // eslint-disable-next-line no-case-declarations
            const testData = auth.data; // TestMeta
            result = {
              ci: `TEST_CI_${testData.tel}`,
              name: testData.name,
              telCode: testData.telCode ?? 82,
              tel: testData.tel,
            };
            break;
          case "dreamsecurity":
            try {
              // eslint-disable-next-line no-case-declarations
              const dreamSecurityResult = await getAuthData(auth.data);
              console.log(dreamSecurityResult, "dreamSecurityResult");

              // 유저 있는지 확인
              // eslint-disable-next-line no-case-declarations
              const isExistUser = await user_api_pool.maybeOne(sql`
SELECT * FROM users WHERE ci = ${dreamSecurityResult.ci}
`);
              console.log(isExistUser, "isExistUser");

              // eslint-disable-next-line no-case-declarations
              let user: any;
              // eslint-disable-next-line no-case-declarations
              let type;

              await user_api_pool.transaction(async (t) => {
                const now = dayjs().tz("UTC").toISOString();
                const reVerify = dayjs().tz("UTC").add(1, "year").toISOString();

                // 이미 존재한다면 => reverify
                if (isExistUser) {
                  const userQueryResult = await t.query(sql`
UPDATE users
SET
    di = ${dreamSecurityResult.di as string},
    name = ${dreamSecurityResult.name as string},
    tel_code = ${dreamSecurityResult.telCode as number},
    phone_number = ${dreamSecurityResult.tel as number},
    loss_limit = ${700000000},
    updated_at = ${now},
    re_verify_at = ${reVerify},
    verify_at = ${now}
WHERE ci = ${isExistUser.ci}
RETURNING *
`);
                  user = userQueryResult.rows[0];
                  console.log(user, "user");
                  type = "exist";
                }
                // 신규유저라면 => INSERT
                // TODO: 테스트 필수!!
                else {
                  user = await t.query(sql`
INSERT INTO users
(
  ci, 
  di, 
  name, 
  tel_code, 
  phone_number, 
  loss_limit, 
  created_at 
  re_verify_at, 
  verify_at
)
VALUES
(
  ${dreamSecurityResult.ci},
  ${dreamSecurityResult.di as string},
  ${dreamSecurityResult.name as string},
  ${dreamSecurityResult.telCode as unknown as number},
  ${dreamSecurityResult.tel as unknown as number},
  ${700000000},
  ${now},
  ${reVerify},
  ${now}
)
RETURNING *
`);
                  console.log(user, "user");
                  type = "new";
                }

                // TODO: 로깅 (user 보고)
                // userId, actiontype, json
                //               await t.query(sql`
                // INSERT INTO user_logs
                // ()
                // `);
              });

              // 토큰 발급
              // eslint-disable-next-line no-case-declarations
              const customToken = generateRandomN(64);
              console.log(customToken, "customToken");
              await redis.set((user as any).user_id, customToken, "EX", 3600);

              result = {
                success: true,
                userId: user.user_id,
                type,
                customToken,
                name: user.name,
                tel: user.phone_number.toString(),
              };
            } catch (error) {
              console.error(error);
            }
            break;
          default:
            throw new Error("invalid_request");
        }
        break;
      case "getUser":
        break;
      case "refreshVerification":
        break;
      case "getAllAccount":
        break;
      default:
        throw new Error("invalidAction");
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(error);
  }
}
