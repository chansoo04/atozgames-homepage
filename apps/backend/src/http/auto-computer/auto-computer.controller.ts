import {
  Controller,
  Get,
  UseGuards,
  Put,
  Query,
  Body,
  Post,
  Delete,
  Param,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";

@Controller("auto-computer")
export class AutoComputerController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @UseGuards(AuthGuard)
  @Get("hangame-poker/auto-status")
  async getHangamePokerAutoStatus() {
    return await this.pool.one(sql`
SELECT * FROM game_auto_status
WHERE game = 'hangame-poker'
`);
  }

  @UseGuards(AuthGuard)
  @Put("hangame-poker/auto-status")
  async changeHangamePokerAutoStatus(@Body() body: any) {
    await this.pool.query(sql`
UPDATE game_auto_status
SET is_auto_running = ${body.is_auto_running}
WHERE game = 'hangame-poker'
`);
    return await this.pool.one(sql`
SELECT * FROM game_auto_status
WHERE game = 'hangame-poker'
`);
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker/computer-priority")
  async getHangmaePokerComptuterStatus() {
    const result = await this.pool.any(sql`
SELECT * FROM computer_priority
WHERE game = 'hangame-poker'
ORDER BY priority ASC
`);
    return result;
  }

  @UseGuards(AuthGuard)
  @Put("hangame-poker/computer-priority")
  async changeHangamePokerComputerStatus(@Body() body: any) {
    // 유효성 검사
    if (body.length === 0) {
      throw new BadRequestException("잘못된 값입니다");
    }

    for (const eachbody of body) {
      const key_of_body = Object.keys(eachbody);
      const required_key = ["priority", "computer"];
      const required_key_check = required_key.every((item) => key_of_body.includes(item));

      if (!required_key_check) {
        throw new BadRequestException("필수 KEY가 오지 않았습니다");
      }
    }

    const p1Computer = body.find((item) => item.priority === 1);
    const p2Computer = body.find((item) => item.priority === 2);
    const p3Computer = body.find((item) => item.priority === 3);

    await this.pool.transaction(async (t) => {
      await t.query(sql`
    UPDATE computer_priority
    SET computer = ${p1Computer.computer}
    WHERE priority = 1 AND game = 'hangame-poker'
    `);
      await t.query(sql`
    UPDATE computer_priority
    SET computer = ${p2Computer.computer}
    WHERE priority = 2 AND game = 'hangame-poker'
    `);
      await t.query(sql`
    UPDATE computer_priority
    SET computer = ${p3Computer.computer}
    WHERE priority = 3 AND game = 'hangame-poker'
    `);
    });
    return { result: "success" };
  }

  @Post("hangame-poker/limit-stop")
  async addHangamePokerLimitStopComputer(@Query("key") query: string, @Body() body: any) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    if (!Object.keys(body).includes("computer")) {
      throw new BadRequestException("잘못된 BODY 값입니다");
    }

    if (!["Soho", "Sub", "Office"].includes(Object.values(body)[0] as string)) {
      throw new BadRequestException("잘못된 BODY 값입니다");
    }

    await this.pool.query(sql`
    INSERT INTO computer_limit_stop
    (game, computer, stop_at, stop_end_at, description)
    VALUES
    ('hangame-poker', ${body.computer}, now(), now() + INTERVAL'6 hours', '한도정지')
    `);
    return { result: "success" };
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker/limit-stop")
  async getHangamePokerLimitStopComputer() {
    return await this.pool.any(sql`
SELECT
    computer,
    stop_at AT TIME ZONE 'Asia/Seoul' AS stop_at,
    stop_end_at AT TIME ZONE 'Asia/Seoul' AS stop_end_at
FROM computer_limit_stop
WHERE now() > stop_at AND now() < stop_end_at;
`);
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker/pause")
  async getHangamePokerPauseComputer() {
    return await this.pool.any(sql`
/* ---- 결과: id | 변경시간 | 변경내용 ---- */
WITH candidate AS (
    /* ❶ ‘다음 컴퓨터로 이동’ + 아직 실행 전(stop_at ≥ now) */
    SELECT
        cls.id,
        cls.stop_at,
        cls.game,
        cls.computer            AS cur_computer,
        cp.priority             AS cur_priority,
        /* ❸ priority+1, 3이면 1로 회귀 */
        CASE
            WHEN cp.priority = 3 THEN 1
            ELSE cp.priority + 1
            END                     AS next_priority
    FROM computer_limit_stop  AS cls
             JOIN computer_priority    AS cp
                  ON cp.game     = cls.game
                      AND cp.computer = cls.computer          -- ❷ 현재 컴퓨터 매칭
    WHERE cls.description = '다음 컴퓨터로 이동'
      AND cls.stop_at     >= NOW()
)
SELECT
    c.id                                       AS id,          -- computer_limit_stop.id
    c.stop_at                                  AS "변경 시간", -- computer_limit_stop.stop_at
    c.cur_computer || ' -> ' || cp2.computer   AS "변경 내용"  -- A → B 형식
FROM candidate              AS c
         JOIN computer_priority      AS cp2
              ON cp2.game     = c.game
                  AND cp2.priority = c.next_priority;          -- ❸에서 계산한 다음 priority
`);
  }

  @UseGuards(AuthGuard)
  @Post("hangame-poker/pause")
  async pauseHangamePokerComputer(@Body() body: any) {
    const key_of_body = Object.keys(body);
    const required_key = ["computer", "strfTime"];
    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    console.log(body, "body");

    await this.pool.query(sql`
    INSERT INTO computer_limit_stop
      (game, computer, stop_at, stop_end_at, description)
    VALUES (
      'hangame-poker',
      ${body.computer},
      ${body.strfTime},
      ${body.strfTime}::timestamptz + INTERVAL'5 minutes',
      '다음 컴퓨터로 이동'
    )
  `);

    return { result: "success" };
  }

  @UseGuards(AuthGuard)
  @Delete("hangame-poker/pause/:id")
  async deleteHangamePokerPauseComputer(@Param("id") id: number) {
    await this.pool.query(sql`
DELETE FROM computer_limit_stop
WHERE id = ${id}
`);
    return { result: "success" };
  }

  // 봇이 컴퓨터 우선순위 가져가는 API
  @Get("hangame-poker/computer-priority/bot")
  async getHangamePokerComputerPriorityByBot(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 자동모드 정지면 무조건 GOOD
    const mode = await this.pool.one(sql`
SELECT * FROM game_auto_status
WHERE game = 'hangame-poker'
`);
    if (mode.is_auto_running === false) {
      return { msg: "GOOD", computer: "NoUse" };
    }

    // 돌고 있는 컴퓨터들
    const runningComputers = await this.pool.any(sql`
SELECT DISTINCT "computer" AS computer, created_at FROM hangame_computer_log
WHERE created_at > now() - INTERVAL'3 minutes'
ORDER BY created_at DESC
`);

    // 아무도 돌고 있지 않다면 => priority 리턴
    if (runningComputers.length === 0) {
      const stoppedComputers = await this.pool.one(sql`
    SELECT COALESCE(ARRAY_AGG(computer), '{}')::text[] AS stopped_computer FROM computer_limit_stop
    WHERE now() > stop_at AND now() < stop_end_at
    `);
      const priority = await this.pool.any(sql`
    SELECT * FROM computer_priority
    WHERE game = 'hangame-poker'
    AND computer <> ALL(${sql.array(stoppedComputers.stopped_computer as any, "text")})
    ORDER BY priority ASC
    `);
      return priority.reduce(
        (acc: any, item: any) => {
          acc[item.priority] = item.computer;
          return acc;
        },
        { msg: "BAD" },
      );
    }

    // 지금 돌고있는 컴퓨터
    const nowRunningComputer = (runningComputers[0].computer as string).slice(0, -1);

    // 지금 돌고있는 컴퓨터의 정지 여부 확인
    const status = await this.pool.any(sql`
SELECT * FROM computer_limit_stop
WHERE game = 'hangame-poker'
AND computer = ${nowRunningComputer}
AND stop_at < now()
AND stop_end_at > now() 
`);

    if (status.length === 0) {
      return { msg: "GOOD", computer: nowRunningComputer };
    }

    const stoppedComputers = await this.pool.one(sql`
    SELECT COALESCE(ARRAY_AGG(computer), '{}')::text[] AS stopped_computer FROM computer_limit_stop
    WHERE now() > stop_at AND now() < stop_end_at
    `);
    const priority = await this.pool.any(sql`
    SELECT * FROM computer_priority
    WHERE game = 'hangame-poker'
    AND computer <> ALL(${sql.array(stoppedComputers.stopped_computer as any, "text")})
    ORDER BY priority ASC
    `);
    return priority.reduce(
      (acc: any, item: any) => {
        acc[item.priority] = item.computer;
        return acc;
      },
      { msg: "BAD" },
    );
  }
}
