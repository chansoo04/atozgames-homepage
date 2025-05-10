import { Controller, Post, Body, Query, Get, Put, UseGuards } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";

@Controller("hangame")
export class HangameController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @UseGuards(AuthGuard)
  @Get("/all-computer")
  async getAllComputer() {
    const result = await this.pool.query(sql`
        SELECT DISTINCT "computer" from hangame_poker ORDER BY "computer";
    `);
    return result.rows;
  }

  @UseGuards(AuthGuard)
  @Get("/situation-board")
  async getSituationBoard() {
    const result = await this.pool.query(sql`
-- 최적화 --
WITH sb AS (  -- situation_board 통합 집계
    SELECT
        CASE
            WHEN computer='Office' THEN 'Office'
            WHEN computer='Soho'   THEN 'Soho'
            WHEN computer='Sub'    THEN 'Sub'
            END                              AS computer_group,
        SUM( EXTRACT(EPOCH FROM (NOW() - start_at)) )
        FILTER (WHERE is_running)    AS now_playtime,
        SUM( EXTRACT(EPOCH FROM (LEAST(COALESCE(end_at,NOW()), NOW()) - start_at)) )
        FILTER (WHERE start_at >= NOW() - INTERVAL '24 HOURS')  AS day_playtime,
        SUM( EXTRACT(EPOCH FROM (LEAST(COALESCE(end_at,NOW()), NOW()) - start_at)) )
        FILTER (WHERE start_at >= NOW() - INTERVAL '7 DAYS')    AS week_playtime,
        SUM( EXTRACT(EPOCH FROM (LEAST(COALESCE(end_at,NOW()), NOW()) - start_at)) )
        FILTER (WHERE start_at >= NOW() - INTERVAL '1 MONTH')   AS month_playtime
    FROM situation_board
    WHERE start_at >= NOW() - INTERVAL '1 MONTH'   -- 더 과거 데이터는 필요 없음
    GROUP BY computer_group
),

     hp AS (  -- hangame_poker 통합 집계
         SELECT
             computer_group,
             SUM(result)
             FILTER (WHERE created_at >= NOW() - INTERVAL '24 HOURS')          AS day_earning,
             SUM(result)
             FILTER (WHERE created_at >= NOW() - INTERVAL '7 DAYS')            AS week_earning,
             SUM(result)
             FILTER (WHERE created_at >= NOW() - INTERVAL '1 MONTH')           AS month_earning
         FROM hangame_poker
         WHERE room IN ('20억','20억(안봤다)')
           AND created_at >= NOW() - INTERVAL '1 MONTH'
         GROUP BY computer_group
     ),

     now_hp AS (  -- ‘진행중 보드’ 기간 내 수익
         SELECT
             h.computer_group,
             SUM(h.result)        AS now_earning
         FROM hangame_poker h
                  JOIN situation_board sb
                       ON sb.is_running
                           AND h.created_at >= sb.start_at
                           AND (
                              (h.computer_group = 'Office' AND sb.computer = 'Office') OR
                              (h.computer_group = 'Soho'   AND sb.computer = 'Soho')   OR
                              (h.computer_group = 'Sub'    AND sb.computer = 'Sub')
                              )
         GROUP BY h.computer_group
     )

SELECT
    COALESCE(cg, 'total')                    AS computer,
    SUM(day_earning)   ::bigint              AS day_earning,
    SUM(now_earning)   ::bigint              AS now_earning,
    SUM(now_playtime)  ::bigint              AS now_playtime,
    SUM(day_playtime)  ::bigint              AS day_playtime,
    SUM(week_playtime) ::bigint              AS week_playtime,
    SUM(month_playtime)::bigint              AS month_playtime,
    SUM(week_earning)  ::bigint              AS week_earning,
    SUM(month_earning) ::bigint              AS month_earning
FROM (
         SELECT cg.computer_group AS cg
              , h.day_earning, ne.now_earning
              , sb.now_playtime, sb.day_playtime, sb.week_playtime, sb.month_playtime
              , h.week_earning, h.month_earning
         FROM (VALUES ('Office'),('Soho'),('Sub')) AS cg(computer_group)
                  LEFT JOIN hp      h  USING (computer_group)
                  LEFT JOIN sb      sb USING (computer_group)
                  LEFT JOIN now_hp  ne USING (computer_group)
     ) t
GROUP BY GROUPING SETS ((cg),());   -- () 가 total 행
    `);

    return result.rows;
  }

  @UseGuards(AuthGuard)
  @Get("/dashboard")
  async getDashboard() {
    const result = await this.pool.query(sql`
-- Step 1: 시간대별로 hangame_poker 데이터를 사전 집계
WITH participant_counts AS (
    SELECT
        EXTRACT(HOUR FROM (created_at + INTERVAL '9 hours')) AS 시간대,
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS total_rows,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 2) AS rows_2_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 3) AS rows_3_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 4) AS rows_4_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 5) AS rows_5_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 6) AS rows_6_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 7) AS rows_7_players,
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)') AND participant = 8) AS rows_8_players,
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)') AND participant = 9) AS rows_9_players,

        -- 새로 추가된 blind_ratio의 분자 부분: room이 '20억' 또는 '20억(안봤다)'이고, position이 지정된 값인 row의 숫자
        COUNT(*) FILTER (
            WHERE room IN ('20억', '20억(안봤다)')
                AND position IN ('BB', 'SB', 'BB/Fold', 'BB/max')
            ) AS blind_rows,

        -- not_see_ev에 필요한 값 계산
        AVG(participant) FILTER (WHERE room = '20억(안봤다)') AS avg_participant,
        AVG(totalmax) FILTER (WHERE room = '20억(안봤다)') AS avg_totalmax,
        COUNT(*) FILTER (WHERE room = '20억(안봤다)') AS count_not_seen,

        -- not_see_ev 계산
        ROUND(
                (
                    (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                    ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
                5
        ) AS not_see_ev,

        -- not_see_result 계산
        SUM(result) FILTER (WHERE room = '20억(안봤다)') AS not_see_result,

        -- ev, ev_avg, earning_money 계산
        SUM(ev) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS ev,
        AVG(ev) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS ev_avg,
        SUM(result) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS earning_money,

        -- total_result 계산
        SUM(result) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS total_result,

        -- earning_money_per_game 계산
        AVG(result) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS earning_money_per_game,

        -- filtered_ev 계산 (ev + not_see_ev)
        SUM(ev) FILTER (
            WHERE room IN ('20억', '20억(안봤다)')
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) + ROUND(
                (
                    (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                    ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
                5
                ) AS filtered_ev,

        -- filtered_earning_money 계산 (earning_money + not_see_result)
        SUM(result) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) + SUM(result) FILTER (WHERE room = '20억(안봤다)') AS filtered_earning_money

    FROM
        hangame_poker_ev
    GROUP BY
        EXTRACT(HOUR FROM (created_at + INTERVAL '9 hours'))
),
     precomputed_data AS (
         SELECT
             시간 AS 시간대,
             COALESCE("Office사무실 게임 판수 합계", 0) +
             COALESCE("Soho사무실 게임 판수 합계", 0) +
             COALESCE("Sub사무실 게임 판수 합계", 0) AS game_count,

             -- 1판 이상 게임을 돌린 컴퓨터 수를 계산
             (
                 CASE WHEN "Office1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END
                 ) AS active_computer_count
         FROM
             game_counts_filtered_kst
     )
-- Step 3: 시간대별 결과를 생성
SELECT
    p.시간대::TEXT AS 시간대,  -- 숫자에서 TEXT로 변환
    ROUND(CAST(AVG(game_count) AS NUMERIC), 5) AS sum_game_count,
    ROUND(CAST(AVG(active_computer_count) AS NUMERIC), 5) AS computer_count,
    ROUND(CAST(AVG(game_count) AS NUMERIC) / NULLIF(CAST(AVG(active_computer_count) AS NUMERIC), 0), 5) AS avg_game_count,

    -- 각 ratio 컬럼 계산
    ROUND(CAST(SUM(p.rows_4_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_4_players,
    ROUND(CAST(SUM(p.rows_5_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_5_players,
    ROUND(CAST(SUM(p.rows_6_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_6_players,
    ROUND(CAST(SUM(p.rows_7_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_7_players,
    ROUND(CAST(SUM(p.rows_8_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_8_players,
    ROUND(CAST(SUM(p.rows_9_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_9_players,

    -- blind_ratio 계산 (소수점 7자리까지 표시)
    ROUND(CAST(COALESCE(MAX(p.blind_rows), 0) AS NUMERIC) / NULLIF(CAST(MAX(p.total_rows) AS NUMERIC), 0), 7) AS blind_ratio,

    -- not_see_ev 계산
    COALESCE(MAX(p.not_see_ev), 0) AS not_see_ev,

    -- not_see_ev_avg 계산
    ROUND(
            (
                (COALESCE(MAX(p.avg_participant), 0) - COALESCE(MAX(p.avg_totalmax), 0)) * 23 * 0.9795 / COALESCE(MAX(p.avg_totalmax), 1) +
                (COALESCE(MAX(p.avg_totalmax), 0) - 1) * 350 * 0.9795 / COALESCE(MAX(p.avg_totalmax), 1) +
                (-350) * (COALESCE(MAX(p.avg_totalmax), 0) - 1) / COALESCE(MAX(p.avg_totalmax), 1)
                ),
            5
    ) AS not_see_ev_avg,

    -- not_see_result 계산
    COALESCE(MAX(p.not_see_result), 0) AS not_see_result,

    -- ev, ev_avg, earning_money 계산
    COALESCE(MAX(p.ev), 0) AS ev,
    ROUND(CAST(COALESCE(MAX(p.ev_avg), 0) AS NUMERIC), 5) AS ev_avg,
    COALESCE(MAX(p.earning_money), 0) AS earning_money,

    -- compare_ev_earning 계산
    COALESCE(MAX(p.ev), 0) - COALESCE(MAX(p.earning_money), 0) AS compare_ev_earning,

    -- total_result 계산
    COALESCE(MAX(p.total_result), 0) AS total_result,

    -- earning_money_per_game 계산
    ROUND(CAST(COALESCE(MAX(p.earning_money_per_game), 0) AS NUMERIC), 5) AS earning_money_per_game,

    -- filtered_ev 계산 (ev + not_see_ev)
    COALESCE(MAX(p.filtered_ev), 0) AS filtered_ev,

    -- filtered_earning_money 계산 (earning_money + not_see_result)
    COALESCE(MAX(p.filtered_earning_money), 0) AS filtered_earning_money,

    -- sample 계산
    COALESCE(MAX(p.total_rows), 0) AS sample

FROM
    precomputed_data AS pc
        LEFT JOIN
    participant_counts AS p
    ON
        pc.시간대 = p.시간대
GROUP BY
    p.시간대
ORDER BY
    p.시간대;
    `);

    const allResult = await this.pool.query(sql`
-- Step 1: 시간대별로 hangame_poker 데이터를 사전 집계
WITH participant_counts AS (
    SELECT
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS total_rows,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 2) AS rows_2_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 3) AS rows_3_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 4) AS rows_4_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 5) AS rows_5_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 6) AS rows_6_players,
        COUNT(*) FILTER (WHERE room = '20억' AND participant = 7) AS rows_7_players,
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)') AND participant = 8) AS rows_8_players,
        COUNT(*) FILTER (WHERE room IN ('20억', '20억(안봤다)') AND participant = 9) AS rows_9_players,

        -- 새로 추가된 blind_ratio의 분자 부분: room이 '20억' 또는 '20억(안봤다)'이고, position이 지정된 값인 row의 숫자
        COUNT(*) FILTER (
            WHERE room IN ('20억', '20억(안봤다)')
                AND position IN ('BB', 'SB', 'BB/Fold', 'BB/max')
            ) AS blind_rows,

        -- not_see_ev에 필요한 값 계산
        AVG(participant) FILTER (WHERE room = '20억(안봤다)') AS avg_participant,
        AVG(totalmax) FILTER (WHERE room = '20억(안봤다)') AS avg_totalmax,
        COUNT(*) FILTER (WHERE room = '20억(안봤다)') AS count_not_seen,

        -- not_see_ev 계산
        ROUND(
                (
                    (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                    ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
                5
        ) AS not_see_ev,

        -- not_see_result 계산
        SUM(result) FILTER (WHERE room = '20억(안봤다)') AS not_see_result,

        -- ev, ev_avg, earning_money 계산
        SUM(ev) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS ev,
        AVG(ev) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS ev_avg,
        SUM(result) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) AS earning_money,

        -- total_result 계산
        SUM(result) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS total_result,

        -- earning_money_per_game 계산
        AVG(result) FILTER (WHERE room IN ('20억', '20억(안봤다)')) AS earning_money_per_game,

        -- filtered_ev 계산 (ev + not_see_ev)
        SUM(ev) FILTER (
            WHERE room IN ('20억', '20억(안봤다)')
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) + ROUND(
                (
                    (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                    (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                    ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
                5
                ) AS filtered_ev,

        -- filtered_earning_money 계산 (earning_money + not_see_result)
        SUM(result) FILTER (
            WHERE room = '20억'
                AND ev IS NOT NULL
                AND result NOT IN (-20, -40, -60)
                AND totalmax NOT IN (0, 1)
            ) + SUM(result) FILTER (WHERE room = '20억(안봤다)') AS filtered_earning_money

    FROM
        hangame_poker_ev
),
     precomputed_data AS (
         SELECT
             COALESCE("Office사무실 게임 판수 합계", 0) +
             COALESCE("Soho사무실 게임 판수 합계", 0) +
             COALESCE("Sub사무실 게임 판수 합계", 0) AS game_count,

             -- 1판 이상 게임을 돌린 컴퓨터 수를 계산
             (
                 CASE WHEN "Office1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Office4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Soho4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub1 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub2 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub3 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END +
                 CASE WHEN "Sub4 컴퓨터 게임 판수" > 0 THEN 1 ELSE 0 END
                 ) AS active_computer_count
         FROM
             game_counts_filtered_kst
     )
-- Step 3: 시간대별 결과를 생성
SELECT
    ROUND(CAST(AVG(game_count) AS NUMERIC), 5) AS sum_game_count,
    ROUND(CAST(AVG(active_computer_count) AS NUMERIC), 5) AS computer_count,
    ROUND(CAST(AVG(game_count) AS NUMERIC) / NULLIF(CAST(AVG(active_computer_count) AS NUMERIC), 0), 5) AS avg_game_count,

    -- 각 ratio 컬럼 계산
    ROUND(CAST(SUM(p.rows_4_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_4_players,
    ROUND(CAST(SUM(p.rows_5_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_5_players,
    ROUND(CAST(SUM(p.rows_6_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_6_players,
    ROUND(CAST(SUM(p.rows_7_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_7_players,
    ROUND(CAST(SUM(p.rows_8_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_8_players,
    ROUND(CAST(SUM(p.rows_9_players) AS NUMERIC) / NULLIF(CAST(SUM(p.total_rows) AS NUMERIC), 0), 5) AS ratio_9_players,

    -- blind_ratio 계산 (소수점 7자리까지 표시)
    ROUND(CAST(COALESCE(MAX(p.blind_rows), 0) AS NUMERIC) / NULLIF(CAST(MAX(p.total_rows) AS NUMERIC), 0), 7) AS blind_ratio,

    -- not_see_ev 계산
    COALESCE(MAX(p.not_see_ev), 0) AS not_see_ev,

    -- not_see_ev_avg 계산
    ROUND(
            (
                (COALESCE(MAX(p.avg_participant), 0) - COALESCE(MAX(p.avg_totalmax), 0)) * 23 * 0.9795 / COALESCE(MAX(p.avg_totalmax), 1) +
                (COALESCE(MAX(p.avg_totalmax), 0) - 1) * 350 * 0.9795 / COALESCE(MAX(p.avg_totalmax), 1) +
                (-350) * (COALESCE(MAX(p.avg_totalmax), 0) - 1) / COALESCE(MAX(p.avg_totalmax), 1)
                ),
            5
    ) AS not_see_ev_avg,

    -- not_see_result 계산
    COALESCE(MAX(p.not_see_result), 0) AS not_see_result,

    -- ev, ev_avg, earning_money 계산
    COALESCE(MAX(p.ev), 0) AS ev,
    ROUND(CAST(COALESCE(MAX(p.ev_avg), 0) AS NUMERIC), 5) AS ev_avg,
    COALESCE(MAX(p.earning_money), 0) AS earning_money,

    -- compare_ev_earning 계산
    COALESCE(MAX(p.ev), 0) - COALESCE(MAX(p.earning_money), 0) AS compare_ev_earning,

    -- total_result 계산
    COALESCE(MAX(p.total_result), 0) AS total_result,

    -- earning_money_per_game 계산
    ROUND(CAST(COALESCE(MAX(p.earning_money_per_game), 0) AS NUMERIC), 5) AS earning_money_per_game,

    -- filtered_ev 계산 (ev + not_see_ev)
    COALESCE(MAX(p.filtered_ev), 0) AS filtered_ev,

    -- filtered_earning_money 계산 (earning_money + not_see_result)
    COALESCE(MAX(p.filtered_earning_money), 0) AS filtered_earning_money,

    -- sample 계산
    COALESCE(MAX(p.total_rows), 0) AS sample

FROM
    precomputed_data AS pc,
    participant_counts AS p;
    `);
    return [...allResult.rows, ...result.rows];
  }
}
