import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Put,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Res,
  Inject,
} from "@nestjs/common";
import { Response } from "express";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "http/auth/auth.guard";
import { isNil } from "@toss/utils";
import pg from "pg";
import { CsvExportService } from "utility/csv-export.service";

@Controller("hangame/seotda")
export class HangameSeotdaController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    @Inject("PG_POOL") private readonly pgPool: pg.Pool,
    private readonly csvExportService: CsvExportService,
  ) {}

  @Post("/record")
  async createHangameSeotdaData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = [
      "participant",
      "position",
      "morning_first_action",
      "morning_my_hand",
      "morning_my_action",
      "dinner_is_participating",
      "pot",
      "result",
      "game_type",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    const result = await this.pool.query(sql`
        INSERT INTO hangame_seotda_record
        (
          participant, 
          position, 
          morning_first_action,  
          morning_my_hand, 
          morning_my_action, 
          morning_etc,
          dinner_is_participating, 
          dinner_first_action, 
          dinner_my_hand, 
          dinner_my_action, 
          dinner_etc,
          pot, 
          result, 
          etc,
          game_type,
          draw_pot,
          draw_1,
          draw_2,
          draw_3,
          draw_4,
          draw_5
        )
        VALUES
        (
          ${body.participant},
          ${body.position},
          ${body.morning_first_action},
          ${body.morning_my_hand},
          ${body.morning_my_action},
          ${body.morning_etc ?? null},
          ${body.dinner_is_participating},
          ${body.dinner_first_action ?? null},
          ${body.dinner_my_hand ?? null},
          ${body.dinner_my_action ?? null},
          ${body.dinner_etc ?? null},
          ${body.pot},
          ${body.result},
          ${body.etc ?? null},
          ${body.game_type ?? null},
          ${body.draw_pot ?? null},
          ${body.draw_1 ?? null},
          ${body.draw_2 ?? null},
          ${body.draw_3 ?? null},
          ${body.draw_4 ?? null},
          ${body.draw_5 ?? null}
        )
        RETURNING *
    `);

    return result.rows[0];
  }

  @Put("/record")
  async updateHangameSeotdaData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    if (!Object.keys(body).includes("id")) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    return await this.pool.transaction(async (t) => {
      const exist = await t.query(sql`
          SELECT * FROM hangame_seotda_record
          WHERE id = ${body.id ?? null}
      `);

      if (exist.rows.length === 0) {
        throw new NotFoundException("존재하지 않는 ID입니다");
      }
      const exist_result = exist.rows[0].result;

      const update = await t.query(sql`
          UPDATE hangame_seotda_record
          SET 
          morning_p1_hand = ${body.morning_p1_hand ?? null},
          morning_p2_hand = ${body.morning_p2_hand ?? null},
          morning_p3_hand = ${body.morning_p3_hand ?? null},
          morning_p4_hand = ${body.morning_p4_hand ?? null},
          morning_p5_hand = ${body.morning_p5_hand ?? null},
          dinner_p1_hand = ${body.dinner_p1_hand ?? null},
          dinner_p2_hand = ${body.dinner_p2_hand ?? null},
          dinner_p3_hand = ${body.dinner_p3_hand ?? null},
          dinner_p4_hand = ${body.dinner_p4_hand ?? null},
          dinner_p5_hand = ${body.dinner_p5_hand ?? null},
          updated_at = now(),
          result = ${isNil(body.result) ? exist_result : body.result}
          WHERE id = ${body.id}
          RETURNING *
      `);
      return update.rows[0];
    });
  }

  @UseGuards(AuthGuard)
  @Get("/record/all")
  async getAllHangameSeotdaData(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
WITH updated_action AS (
    SELECT
        id,
        morning_first_action,
        position,
        morning_my_action,
        dinner_is_participating,
        dinner_first_action,
        dinner_my_action,
        -- Using substring and concatenation to insert morning_my_action at the correct position
        CASE
            WHEN morning_my_action = '무승부' THEN ''
            WHEN morning_my_hand = '배짱승부' THEN ''
            WHEN position = 1 THEN morning_my_action || substring(morning_first_action FROM 2)
            WHEN position > char_length(morning_first_action) THEN morning_first_action || morning_my_action
            ELSE substring(morning_first_action FROM 1 FOR position - 1) || morning_my_action || substring(morning_first_action FROM position)
            END AS updated_morning_first_action,
        -- Updated logic for updated_dinner_first_action using array manipulation
        CASE
            WHEN NOT dinner_is_participating THEN string_to_array(dinner_first_action, NULL)
            ELSE
                CASE
                    WHEN position = 1 THEN array_prepend(dinner_my_action, string_to_array(dinner_first_action, NULL))
                    WHEN position = 3 THEN
                        array_append(
                                array(SELECT unnest(string_to_array(dinner_first_action, NULL)) LIMIT 2),
                                dinner_my_action
                        ) || array(SELECT unnest(string_to_array(dinner_first_action, NULL)) OFFSET 2)
                    ELSE array_append(string_to_array(dinner_first_action, NULL), dinner_my_action)
                    END
            END AS updated_dinner_first_action
    FROM
        hangame_seotda_record
)
SELECT
    to_char(timezone('Asia/Seoul', hsr.created_at), 'YYYY년 MM월 DD일') AS "날짜",
    to_char(timezone('Asia/Seoul', hsr.created_at), 'HH24:MI:SS') AS "시간",
    CASE
        WHEN hsr.morning_my_hand = '배짱승부' THEN '배짱'
        WHEN hsr.morning_my_hand = '무승부' THEN '무승부'
        WHEN hsr.dinner_is_participating THEN '1'
        WHEN hsr.dinner_is_participating = false THEN '0'
        END AS "저녁 참여",
    hsr.participant AS "참여자",
    hsr.position AS "포지션",
    CASE
        WHEN hsr.game_type = '배짱승부' THEN ''
        WHEN hsr.morning_my_hand = '무승부' THEN ''
        ELSE hsr.morning_my_hand
        END AS "내 아침핸드",
    hsr.dinner_my_hand AS "내 저녁핸드",
    '' AS " ",
    CASE
        WHEN hsr.game_type IS NULL THEN substring(ua.updated_morning_first_action FROM 1 FOR 1)
        ELSE ''
        END AS "MA1",
    CASE
        WHEN hsr.game_type IS NULL THEN substring(ua.updated_morning_first_action FROM 2 FOR 1)
        ELSE ''
        END AS "MA2",
    CASE
        WHEN hsr.game_type IS NULL THEN substring(ua.updated_morning_first_action FROM 3 FOR 1)
        ELSE ''
        END AS "MA3",
    CASE
        WHEN hsr.game_type IS NULL THEN substring(ua.updated_morning_first_action FROM 4 FOR 1)
        ELSE ''
        END AS "MA4",
    CASE
        WHEN hsr.game_type IS NULL THEN substring(ua.updated_morning_first_action FROM 5 FOR 1)
        ELSE ''
        END AS "MA5",
    CASE
        WHEN hsr.game_type IS NULL THEN hsr.morning_etc
        ELSE ''
        END AS "아침 이후",
    CASE
        WHEN hsr.game_type = '배짱' THEN ''
        ELSE hsr.morning_p1_hand
        END AS "M1",
    CASE
        WHEN hsr.game_type = '배짱' THEN ''
        ELSE hsr.morning_p2_hand
        END AS "M2",
    CASE
        WHEN hsr.game_type = '배짱' THEN ''
        ELSE hsr.morning_p3_hand
        END AS "M3",
    CASE
        WHEN hsr.game_type = '배짱' THEN ''
        ELSE hsr.morning_p4_hand
        END AS "M4",
    CASE
        WHEN hsr.game_type = '배짱' THEN ''
        ELSE hsr.morning_p5_hand
        END AS "M5",
    '  ' AS "  ",
    ua.updated_dinner_first_action[1] AS "DA1",
    ua.updated_dinner_first_action[2] AS "DA2",
    ua.updated_dinner_first_action[3] AS "DA3",
    ua.updated_dinner_first_action[4] AS "DA4",
    ua.updated_dinner_first_action[5] AS "DA5",
    hsr.dinner_etc AS "저녁 이후",
    hsr.dinner_p1_hand AS "D1",
    hsr.dinner_p2_hand AS "D2",
    hsr.dinner_p3_hand AS "D3",
    hsr.dinner_p4_hand AS "D4",
    hsr.dinner_p5_hand AS "D5",
    hsr.pot AS "저녁 팟",
    CASE
        WHEN hsr.result = 0 THEN 0::text
        ELSE hsr.result::text
        END AS "result"
FROM
    hangame_seotda_record hsr
        JOIN
    updated_action ua ON hsr.id = ua.id
ORDER BY
    hsr.id DESC
    `;
    await this.csvExportService.streamQueryToCsv(res, client, sql, "HANGAME_SEOTDA_RECORD.csv");
  }

  @UseGuards(AuthGuard)
  @Get("/record/all/new")
  async getAllHangameSeotdaDataNew(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
SELECT
    a.*,
    CASE
        WHEN a.betting_phase = 'morning' THEN g.morning_participant_count
        WHEN a.betting_phase = 'dinner' THEN g.dinner_participant_count
        ELSE NULL
        END AS "참여자",
    (
        SELECT string_agg(b.action, '' ORDER BY b.sequence)
        FROM hangame_seotda_game_action b
        WHERE b.game_id = a.game_id
          AND b.betting_phase = a.betting_phase
          AND b.sequence < a.sequence
    ) AS front_action,
    g.morning_participant_count AS morning_participants,
    g.dinner_participant_count AS dinner_participants
FROM hangame_seotda_game_action a
         LEFT JOIN hangame_seotda_game_info g
                   ON a.game_id = g.id
WHERE g.inspection_passed = true
ORDER BY a.game_id, a.betting_phase DESC, a.sequence;
    `;
    await this.csvExportService.streamQueryToCsv(res, client, sql, "HANGAME_SEOTDA_RECORD_NEW.csv");
  }

  @UseGuards(AuthGuard)
  @Get("/record/count")
  async getDistinctSeotdaDataCount() {
    const result = await this.pool.any(sql`
        SELECT COUNT(*) FROM hangame_seotda_record
    `);
    return result[0].count;
  }

  @UseGuards(AuthGuard)
  @Get("/record/count/new")
  async getDistinctSeotdaRecordCountNew() {
    const result = await this.pool.any(sql`
SELECT COUNT(*) FROM hangame_seotda_game_info
`);
    return result[0].count;
  }

  @UseGuards(AuthGuard)
  @Get("/result/all-time")
  async getResultAllTime() {
    return await this.pool.transaction(async (t) => {
      const year_data = await t.any(sql`
SELECT
    TO_CHAR(DATE_TRUNC('year', day_kst::date), 'YYYY-MM-DD') AS year_kst, -- 각년 1월 1일 (YYYY-MM-DD 형식)
    TRUNC(SUM(result), 2) AS result,                                     -- 연간 result 합계 (소수점 둘째 자리)
    SUM(count) AS count,                                                -- 연간 row 개수 합계
    TRUNC(SUM(result) / COUNT(DISTINCT day_kst), 2) AS avg_result,       -- 연간 일평균 result (소수점 둘째 자리)
    TRUNC(SUM(count) / COUNT(DISTINCT day_kst), 2) AS avg_count          -- 연간 일평균 row 개수 (소수점 둘째 자리)
FROM
    hangame_seotda_daily_summary
GROUP BY
    DATE_TRUNC('year', day_kst::date)                                    -- 연별 그룹화
ORDER BY
    DATE_TRUNC('year', day_kst::date) DESC; 
      `);
      const month_data = await t.any(sql`
SELECT
    TO_CHAR(DATE_TRUNC('month', day_kst::date), 'YYYY-MM-DD') AS month_kst, -- 각월 1일 (YYYY-MM-DD 형식)
    TRUNC(SUM(result), 2) AS result,                                       -- 월간 result 합계 (소수점 둘째 자리)
    SUM(count) AS count,                                                  -- 월간 row 개수 합계
    TRUNC(SUM(result) / COUNT(DISTINCT day_kst), 2) AS avg_result,         -- 월간 일평균 result (소수점 둘째 자리)
    TRUNC(SUM(count) / COUNT(DISTINCT day_kst), 2) AS avg_count            -- 월간 일평균 row 개수 (소수점 둘째 자리)
FROM
    hangame_seotda_daily_summary
GROUP BY
    DATE_TRUNC('month', day_kst::date)                                     -- 월별 그룹화
ORDER BY
    DATE_TRUNC('month', day_kst::date) ASC;
      `);
      const day_data = await t.any(sql`
        SELECT * FROM hangame_seotda_daily_summary ORDER BY day_kst ASC
      `);

      return { year_data: year_data, month_data: month_data, day_data: day_data };
    });
  }

  @UseGuards(AuthGuard)
  @Get("/situation-board")
  async getSetodaSituationBoard() {
    const result = await this.pool.query(sql`
WITH base AS (                  -- 1) 최근 1개월만 스캔
    SELECT
        created_at,
        result,
        LAG(created_at) OVER (ORDER BY created_at DESC) AS prev_ts
    FROM hangame_seotda_record
    WHERE created_at >= NOW() - INTERVAL '1 month'
),

     calc AS (                        -- 2) 휴식·진행 판별
         SELECT
             created_at,
             result,
             prev_ts,                                           -- ←★ 추가
             CASE
                 WHEN prev_ts IS NULL THEN
                     EXTRACT(EPOCH FROM (NOW() - created_at))
                 WHEN prev_ts - created_at >= INTERVAL '10 minutes' THEN
                     EXTRACT(EPOCH FROM (prev_ts - created_at))
                 ELSE 0
                 END                               AS rest_time,
             (prev_ts - created_at) >= INTERVAL '10 minutes' AS is_break
         FROM base
     ),

     agg AS (                         -- 3) 24h·7d·1m 집계
         SELECT
                     SUM(rest_time) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS day_breaktime,
                     SUM(rest_time) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')   AS week_breaktime,
                     SUM(rest_time) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')  AS month_breaktime,
                     SUM(result)    FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') AS day_earning,
                     SUM(result)    FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')   AS week_earning,
                     SUM(result)    FILTER (WHERE created_at >= NOW() - INTERVAL '1 month')  AS month_earning
         FROM calc
     ),

     latest AS (                      -- 4) 가장 최근 한 판
         SELECT created_at AS last_played_at
         FROM hangame_seotda_record
         ORDER BY created_at DESC
         LIMIT 1
     ),

     last_break AS (                  -- 5) 가장 최근 휴식 종료
         SELECT prev_ts AS break_end
         FROM calc
         WHERE is_break
         ORDER BY created_at DESC
         LIMIT 1
     ),

     session AS (                     -- 6) 현재 세션 여부·시작 시각
         SELECT
             (NOW() - last_played_at) <= INTERVAL '10 minutes'     AS is_running,
             COALESCE(break_end, last_played_at)                   AS session_start
         FROM latest
                  LEFT JOIN last_break ON true
     )

SELECT
    day_breaktime,
    week_breaktime,
    month_breaktime,
    day_earning,
    week_earning,
    month_earning,
    is_running,
    CASE
        WHEN is_running
            THEN EXTRACT(EPOCH FROM (NOW() - session_start))
        ELSE 0
        END                                   AS now_running_time,
    CASE
        WHEN is_running
            THEN (SELECT SUM(result)
                  FROM hangame_seotda_record
                  WHERE created_at >= session_start)
        ELSE 0
        END                                   AS now_earning
FROM agg, session;
    `);
    return result.rows[0];
  }

  @UseGuards(AuthGuard)
  @Get("/dashboard")
  async getSeotdaDashboard() {
    const result = await this.pool.transaction(async (t) => {
      const participant = await t.query(sql`
        WITH participant_stats AS (
    -- 전체 통계 계산
    SELECT participant,
           COUNT(*) AS 판수,
           SUM(result) AS 결과_총합
    FROM hangame_seotda_record
    WHERE participant BETWEEN 2 AND 5
      AND morning_my_hand NOT IN ('배짱승부', '무승부')
    GROUP BY participant
),
     participant_position AS (
         -- 각 participant에 대해 가능한 모든 position 조합을 생성
         SELECT participant, generate_series(1, participant) AS position
         FROM (SELECT DISTINCT participant FROM hangame_seotda_record WHERE participant BETWEEN 2 AND 5) AS participants
     ),
     participant_position_stats AS (
         -- participant와 position에 따라 판수, 결과_총합, 결과_평균 계산
         SELECT p.participant,
                p.position,
                COUNT(hsr.id) AS 판수,
                COALESCE(SUM(hsr.result), 0) AS 결과_총합,
                ROUND(COALESCE(AVG(hsr.result), 0)::numeric, 2) AS 결과_평균
         FROM participant_position p
                  LEFT JOIN hangame_seotda_record hsr
                            ON p.participant = hsr.participant AND p.position = hsr.position AND morning_my_hand NOT IN ('배짱승부', '무승부')
         GROUP BY p.participant, p.position
     ),
     participant_summary AS (
         -- 각 participant에 대해 전체 판수 계산
         SELECT participant,
                COUNT(*) AS 총_판수
         FROM hangame_seotda_record
         WHERE participant BETWEEN 2 AND 5
         AND morning_my_hand NOT IN ('배짱승부', '무승부')
         GROUP BY participant
     )
-- 첫 번째 쿼리 결과
SELECT participant,
       NULL AS position,
       판수,
       결과_총합,
       ROUND(결과_총합::decimal / 판수, 2) AS 결과_평균,
       ROUND((판수::decimal / SUM(판수) OVER ()) * 100, 2) AS 비율
FROM participant_stats

UNION ALL

-- 두 번째 쿼리 결과
SELECT ps.participant,
       ps.position,
       ps.판수,
       ps.결과_총합,
       ps.결과_평균,
       ROUND((ps.판수::decimal / NULLIF(pss.총_판수, 0))::numeric * 100, 2) AS 비율
FROM participant_position_stats ps
         JOIN participant_summary pss
              ON ps.participant = pss.participant

ORDER BY participant, position NULLS FIRST;
      `);

      const morning_first_action = await t.query(sql`
WITH participant_position_count AS (
    -- 각 participant와 position에 대해 전체 row 수 계산
    SELECT participant,
           position,
           COUNT(*) AS position_total_count
    FROM hangame_seotda_record
    WHERE participant BETWEEN 2 AND 5
    AND morning_my_hand NOT IN ('배짱승부', '무승부')
    GROUP BY participant, position
)
SELECT hsr.participant,
       hsr.position,
       hsr.morning_first_action,
       COUNT(*) AS 판수,
       ROUND(AVG(hsr.result)::numeric, 2) AS 결과_평균,
       ROUND((COUNT(*)::numeric / NULLIF(ppc.position_total_count, 0)) * 100, 2) AS 비율
FROM hangame_seotda_record hsr
JOIN participant_position_count ppc
ON hsr.participant = ppc.participant AND hsr.position = ppc.position
WHERE hsr.participant BETWEEN 2 AND 5
AND hsr.morning_my_hand NOT IN ('배짱승부', '무승부')
GROUP BY hsr.participant, hsr.position, hsr.morning_first_action, ppc.position_total_count
ORDER BY hsr.participant, hsr.position, 판수 DESC, hsr.morning_first_action NULLS FIRST;
      `);

      return { participant: participant.rows, morning_first_action: morning_first_action.rows };
    });
    return result;
  }
}
