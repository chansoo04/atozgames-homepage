import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Put,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  Res,
  Inject,
} from "@nestjs/common";
import { Response } from "express";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";
import { pagination } from "utils";
import pg from "pg";
import { CsvExportService } from "utility/csv-export.service";

@Controller("hangame/poker")
export class HangamePokerController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    @Inject("PG_POOL") private readonly pgPool: pg.Pool,
    private readonly csvExportService: CsvExportService,
  ) {}

  @Post("")
  async postHangamePokerData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }
    const result = await this.pool.query(sql`
        INSERT INTO hangame_poker
        (
          computer, 
          room, 
          created_at, 
          participant, 
          position,
          action, 
          totalmax,
          earlymax, 
          earlyraise, 
          earlylimp, 
          limpcall, 
          myhand, 
          result, 
          ev,
          enemy_actions
        )
        VALUES
        (
          ${body.computer}, 
          ${body.room}, 
          ${body.created_at}, 
          ${body.participant}, 
          ${body.position}, 
          ${body.action}, 
          ${body.totalmax},
          ${body.earlymax}, 
          ${body.earlyraise}, 
          ${body.earlylimp},
          ${body.limpcall}, 
          ${body.myhand}, 
          ${body.result},
          ${body?.ev ?? null},
          ${body.enemy_actions ?? null}
        )
        RETURNING *
    `);

    const computer = body.computer.slice(0, -1);

    await this.pool.transaction(async (t) => {
      // STEP 1. 현재 컴퓨터가 켜져있는지 찾는다
      const is_running_computer = await t.any(sql`
          SELECT * FROM situation_board
          WHERE is_running = true
      `);

      // STEP 2. 켜져있는 컴퓨터가 없다면, 추가한다
      if (is_running_computer.length === 0) {
        await t.query(sql`
            INSERT INTO situation_board
            (computer, is_running, start_at)
            VALUES
            (${computer}, true, now())
            RETURNING *
        `);
        return;
      }

      // STEP 3. 현재 켜져있는 컴퓨터가 있지만, 기록을 추가하는 computer가 아니라면 나머지를 다 끈다
      const compare_is_running_computer = is_running_computer.filter(
        (item) => item.computer === computer,
      );

      if (compare_is_running_computer.length === 0) {
        await t.query(sql`
            UPDATE situation_board
            SET end_at = now(),
            is_running = false
            WHERE is_running = true
        `);
        await t.query(sql`
            INSERT INTO situation_board
            (computer, is_running, start_at)
            VALUES
            (${computer}, true, now())
            RETURNING *
        `);
        return;
      }
    });

    return result.rows[0];
  }

  @Put("")
  async putHangamePoker(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.transaction(async (t) => {
      const update_record = await t.query(sql`
          UPDATE hangame_poker_replay_record
          SET replay_finished = true,
          updated_at = now()
          WHERE hangame_poker_id = ${body?.id ?? null}
      `);

      const update_ev = await t.query(sql`
        UPDATE hangame_poker
        SET ev = ${body?.ev ?? null}
        WHERE id = ${body?.id ?? null}
        RETURNING *
      `);
      return update_ev;
    });
    return result.rows[0];
  }

  // replay에 필요한 데이터들 추가
  @Post("/replay-data")
  async postHangamePokerReplayData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = ["hangame_poker_id", "replay_hand", "replay_participant", "replay_pot"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    const result = await this.pool.transaction(async (t) => {
      const exist = await t.any(sql`
          SELECT * FROM hangame_poker
          WHERE id = ${body.hangame_poker_id}
      `);
      if (exist.length === 0) {
        throw new NotFoundException("존재하지 않는 게임 결과입니다");
      }
      const insert = await t.query(sql`
          INSERT INTO hangame_poker_replay_record
          (hangame_poker_id, replay_hand, replay_participant, replay_pot)
          VALUES
          (${body.hangame_poker_id}, ${body.replay_hand}, ${body.replay_participant}, ${body.replay_pot})
          RETURNING *
      `);
      return insert.rows[0];
    });
    return result;
  }

  @Post("/computer")
  async postHangamePokerComputerData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.query(sql`
        INSERT INTO hangame_computer_log
        (computer)
        VALUES
        (${body.computer})
        RETURNING id
    `);

    return result.rows[0];
  }

  @UseGuards(AuthGuard)
  @Get("")
  async getHangamePoker(
    @Query()
    query: {
      startDate: string;
      endDate: string;
      computer: string;
      pageNo?: number;
      pageSize?: number;
    },
  ) {
    const { startDate, endDate, computer, pageNo = 0, pageSize = 1000 } = query;

    const result = await this.pool.query(sql`
      SELECT * FROM hangame_poker
      WHERE "created_at" BETWEEN ${startDate} AND ${endDate}
      ${computer === "all" ? sql`` : sql` AND computer = ${computer}`}
      ORDER BY "id" DESC
      ${pagination({ pageNo, pageSize })}
    `);

    return result.rows;
  }

  @UseGuards(AuthGuard)
  @Get("/record/all")
  async getAllHangamePokerData(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
        SELECT
            computer AS "컴퓨터",
            room AS "방",
            to_char(timezone('Asia/Seoul', created_at), 'YYYY년 MM월 DD일') AS "날짜",
            to_char(timezone('Asia/Seoul', created_at), 'HH24:MI:SS') AS "시간",
            participant AS "인원",
            position AS "포지션",
            action AS "내 액션", 
            totalmax AS "총맥스",
            earlymax AS "선맥스",
            earlyraise AS "레이즈 수",
            earlylimp AS "림프 수",
            limpcall AS "림프-콜수",
            myhand AS "핸드",
            result AS "결과",
            ev AS "EV값",
            estimated_ev AS "예상EV"
        FROM hangame_poker_ev
        ORDER BY "id" DESC
    `;
    await this.csvExportService.streamQueryToCsv(res, client, sql, "HANGAME_POKER_DATA.csv");
  }

  @UseGuards(AuthGuard)
  @Get("/ev")
  async getEVFromHand(@Query("hand") hand: string) {
    const result = await this.pool.transaction(async (t) => {
      const data = await t.any(sql`
        SELECT * FROM hangame_poker_ev WHERE myhand = ${hand}
        AND action IN ('M', 'Z') 
      `);
      if (data.length === 0) {
        throw new BadRequestException("올바르지 않은 입력값입니다");
      }

      return await t.any(sql`
WITH positions AS (
    SELECT 4 AS participant, unnest(ARRAY['SB', 'BB', 'D', '1']) AS position
    UNION ALL
    SELECT 5, unnest(ARRAY['SB', 'BB', 'D', '1', '2'])
    UNION ALL
    SELECT 6, unnest(ARRAY['SB', 'BB', 'D', '1', '2', '3'])
    UNION ALL
    SELECT 7, unnest(ARRAY['SB', 'BB', 'D', '1', '2', '3', '4'])
    UNION ALL
    SELECT 8, unnest(ARRAY['SB', 'BB', 'D', '1', '2', '3', '4', '5'])
    UNION ALL
    SELECT 9, unnest(ARRAY['SB', 'BB', 'D', '1', '2', '3', '4', '5', '6'])
),
     earlymax_range AS (
         SELECT
             pos.participant,
             pos.position,
             em.earlymax
         FROM
             positions pos
                 LEFT JOIN LATERAL (
                 SELECT generate_series(0, pos.participant - 1) AS earlymax
                 WHERE pos.position = 'BB'
                 UNION ALL
                 SELECT generate_series(0, pos.participant - 2)
                 WHERE pos.position = 'SB'
                 UNION ALL
                 SELECT generate_series(0, pos.participant - 3)
                 WHERE pos.position = 'D'
                 UNION ALL
                 SELECT generate_series(0, pos.position::integer - 1)
                 WHERE pos.position NOT IN ('BB', 'SB', 'D')
                 ) em ON true
     ),
     earlylimp_range AS (
         SELECT
             em.participant,
             em.position,
             em.earlymax,
             el.earlylimp
         FROM
             earlymax_range em
                 LEFT JOIN LATERAL (
                 SELECT generate_series(
                                0,
                                CASE
                                    WHEN em.position = 'BB' THEN em.participant - em.earlymax - 1
                                    WHEN em.position = 'SB' THEN em.participant - em.earlymax - 2
                                    WHEN em.position = 'D' THEN em.participant - em.earlymax - 3
                                    ELSE em.position::integer - em.earlymax - 1
                                    END
                        ) AS earlylimp
                 ) el ON true
     )
SELECT
    el.participant,
    el.position,
    el.earlymax,
    el.earlylimp,
    AVG(h.ev) AS avg_ev,
    COUNT(h.ev) AS count
FROM
    earlylimp_range el
        LEFT JOIN
    hangame_poker_ev h ON el.participant = h.participant
        AND el.position = h.position
        AND el.earlymax = h.earlymax
        AND (el.earlylimp = h.earlylimp OR el.earlylimp IS NULL)
        AND h.myhand = ${hand}
        AND h.action IN ('M', 'Z')
GROUP BY
    GROUPING SETS (
    (el.participant, el.position, el.earlymax, el.earlylimp),
    (el.participant, el.position, el.earlymax)
    )
ORDER BY
    el.participant DESC,
    CASE
        WHEN el.position ~ '^[0-9]+$' THEN 1
        WHEN el.position = 'D' THEN 2
        WHEN el.position = 'SB' THEN 3
        WHEN el.position = 'BB' THEN 4
        ELSE 5 -- catch-all for any unexpected values
        END,
    CASE
        WHEN el.position ~ '^[0-9]+$' THEN el.position::integer
        ELSE NULL
        END,
    el.earlymax,
    el.earlylimp IS NOT NULL,
    el.earlylimp;
    `);
    });

    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/ev/count")
  async getEVCountFromHand(@Query("hand") hand: string) {
    const result = await this.pool.transaction(async (t) => {
      const data = await t.any(sql`
        SELECT * FROM hangame_poker_ev WHERE myhand = ${hand}
        AND action IN ('M', 'Z') 
      `);
      if (data.length === 0) {
        throw new BadRequestException("올바르지 않은 입력값입니다");
      }

      return await t.any(sql`
        SELECT COUNT(*) AS "count" FROM hangame_poker_ev
        WHERE "myhand" = ${hand}
        AND ev IS NOT NULL
        AND participant > 3
        AND action IN ('M', 'Z')
      `);
    });

    return result[0].count;
  }

  @UseGuards(AuthGuard)
  @Get("/ev/avg")
  async getEVAvgFromHand(@Query("hand") hand: string) {
    const result = await this.pool.transaction(async (t) => {
      const data = await t.any(sql`
        SELECT * FROM hangame_poker_ev WHERE myhand = ${hand}
        AND action IN ('M', 'Z')  
      `);
      if (data.length === 0) {
        throw new BadRequestException("올바르지 않은 입력값입니다");
      }
      return await t.any(sql`
          SELECT
            AVG(ev) AS avg
          FROM hangame_poker_ev
          WHERE "myhand" = ${hand}
          AND ev IS NOT NULL
          AND participant > 3
          AND action IN ('M', 'Z')
      `);
    });
    return result[0].avg;
  }

  @UseGuards(AuthGuard)
  @Get("/ev/search")
  async getAVGFromHand(
    @Query("hand") hand?: string,
    @Query("participant") participant?: number,
    @Query("position") position?: string,
    @Query("earlymax") earlymax?: number,
    @Query("earlylimp") earlylimp?: number,
    @Query("totalmax") totalmax?: number,
  ) {
    const conditions: any = [];

    if (hand !== undefined && hand !== null) {
      conditions.push(sql`myhand = ${hand}`);
    }
    if (participant !== undefined && !Number.isNaN(participant)) {
      conditions.push(sql`participant = ${participant}`);
    } else {
      conditions.push(sql`participant > 3`);
    }
    if (position !== undefined && position !== null) {
      conditions.push(sql`position = ${position}`);
    }
    if (earlymax !== undefined && !Number.isNaN(earlymax)) {
      conditions.push(sql`earlymax = ${earlymax}`);
    }
    if (earlylimp !== undefined && !Number.isNaN(earlylimp)) {
      conditions.push(sql`earlylimp = ${earlylimp}`);
    }
    if (totalmax !== undefined && !Number.isNaN(totalmax)) {
      conditions.push(sql`totalmax = ${totalmax}`);
    }
    conditions.push(sql`ev IS NOT NULL`);
    conditions.push(sql`action IN ('M', 'Z')`);

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.query(sql`
        SELECT 
            AVG(ev) AS ev_avg,
            AVG(totalmax) totalmax_avg,
            COUNT(*) as count
        FROM hangame_poker_ev
        WHERE ${whereClause}        
    `);

    return result.rows[0];
  }

  @Get("/replay-data/not-finished")
  async getNotFinishedReplayData(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.any(sql`
SELECT * FROM hangame_poker_replay_record
WHERE replay_finished = false
AND created_at >= NOW() - INTERVAL '2 week'
`);

    return result;
  }
}
