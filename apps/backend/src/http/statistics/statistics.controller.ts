import {
  Controller,
  UseGuards,
  Inject,
  Get,
  Query,
  BadRequestException,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";
import { isNil } from "@toss/utils";
import pg from "pg";
import { CsvExportService } from "utility/csv-export.service";

@Controller("statistics")
export class StatisticsController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    @Inject("PG_POOL") private readonly pgPool: pg.Pool,
    private readonly csvExportService: CsvExportService,
  ) {}

  // 한게임 섯다와 포커, 전체 오늘 결과
  @UseGuards(AuthGuard)
  @Get("/hangame/all/today")
  async getHangameTodayResult() {
    const result = await this.pool.transaction(async (t) => {
      const poker = await t.one(sql`
SELECT
    SUM(result) AS poker_result,
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS poker_ev,
    COUNT(*) AS poker_count
FROM
    hangame_poker
WHERE
  created_day_kst = TIMEZONE('Asia/Seoul', NOW())::date;
      `);
      const seotda = await t.one(sql`
SELECT
    SUM(result) AS seotda_result,
    COUNT(*) AS seotda_count
FROM 
    hangame_seotda_record
WHERE 
    created_day_kst = TIMEZONE('Asia/Seoul', NOW())::date;
      `);
      return { ...poker, ...seotda };
    });

    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/hangame/poker/ev-and-result-by-year-month-day")
  async getPokerEVandResultByYearMonthDay(@Query("time") time?: string) {
    const yearQuery = sql`
SELECT
    TO_CHAR(DATE_TRUNC('year', day_kst), 'YYYY-MM-DD') AS year_kst, -- 각 연의 1월 1일로 표기
    SUM(result) AS result,                                         -- 연간 result 합계
    SUM(ev) AS ev,                                                 -- 연간 ev 합계
    SUM(count) AS count,                                           -- 연간 row 개수 합계
    TRUNC(SUM(ev) / NULLIF(SUM(count), 0), 2) AS ev_per_game,      -- 연간 ev_per_game (소수점 둘째 자리까지 버림)
    TRUNC(SUM(result) / COUNT(DISTINCT day_kst), 2) AS avg_result, -- 연간 일평균 result (소수점 둘째 자리까지 버림)
    TRUNC(SUM(ev) / COUNT(DISTINCT day_kst), 2) AS avg_ev,         -- 연간 일평균 ev (소수점 둘째 자리까지 버림)
    TRUNC(SUM(count) / COUNT(DISTINCT day_kst), 2) AS avg_count,   -- 연간 일평균 row 개수 (소수점 둘째 자리까지 버림)
    TRUNC(
            (SUM(ev) / COUNT(DISTINCT day_kst)) / NULLIF(SUM(count) / COUNT(DISTINCT day_kst), 0),
            2
    ) AS avg_ev_per_game                                           -- avg_ev / avg_count (소수점 둘째 자리까지 버림)
FROM
    hangame_poker_daily_summary
GROUP BY
    DATE_TRUNC('year', day_kst)                                    -- 연간 그룹화
ORDER BY
    DATE_TRUNC('year', day_kst) DESC;
      `;
    const monthQuery = sql`
SELECT
    TO_CHAR(DATE_TRUNC('month', day_kst), 'YYYY-MM-DD') AS month_kst, -- 각 월의 1일로 표기
    SUM(result) AS result,                                           -- 월간 result 합계
    SUM(ev) AS ev,                                                   -- 월간 ev 합계
    SUM(count) AS count,                                             -- 월간 row 개수 합계
    TRUNC(SUM(ev) / NULLIF(SUM(count), 0), 2) AS ev_per_game,        -- 월간 ev_per_game (소수점 둘째 자리까지 버림)
    TRUNC(SUM(result) / COUNT(DISTINCT day_kst), 2) AS avg_result,   -- 월간 일평균 result (소수점 둘째 자리까지 버림)
    TRUNC(SUM(ev) / COUNT(DISTINCT day_kst), 2) AS avg_ev,           -- 월간 일평균 ev (소수점 둘째 자리까지 버림)
    TRUNC(SUM(count) / COUNT(DISTINCT day_kst), 2) AS avg_count,     -- 월간 일평균 row 개수 (소수점 둘째 자리까지 버림)
    TRUNC(
            (SUM(ev) / COUNT(DISTINCT day_kst)) / NULLIF(SUM(count) / COUNT(DISTINCT day_kst), 0),
            2
    ) AS avg_ev_per_game                                             -- avg_ev / avg_count (소수점 둘째 자리까지 버림)
FROM
    hangame_poker_daily_summary
GROUP BY
    DATE_TRUNC('month', day_kst)                                     -- 월별 그룹화
ORDER BY
    DATE_TRUNC('month', day_kst) ASC;                                    -- 월별 정렬                                   
`;
    const dayQuery = sql`
SELECT * FROM hangame_poker_daily_summary
ORDER BY day_kst ASC
      `;

    if (time === "year") {
      const result = await this.pool.any(yearQuery);
      return result;
    }
    if (time === "month") {
      const result = await this.pool.any(monthQuery);
      return result;
    }
    if (time === "day") {
      const result = await this.pool.any(dayQuery);
      return result;
    }

    return await this.pool.transaction(async (t) => {
      const day = await t.any(dayQuery);
      const month = await t.any(monthQuery);
      const year = await t.any(yearQuery);
      return { year_data: year, month_data: month, day_data: day };
    });
  }

  @UseGuards(AuthGuard)
  @Get("/hangame/poker/ev-and-result-by-day")
  async getPokerEVandResultByDay(@Query("start") start: string, @Query("end") end: string) {
    const start_date = new Date(new Date(start).getTime()).toISOString();
    const end_date = new Date(new Date(end).getTime() + 24 * 60 * 60 * 1000).toISOString();

    const result = await this.pool.any(sql`
SELECT
    created_day_kst AS day_kst,
    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,

    -- Group evs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    hangame_poker_ev
WHERE created_at BETWEEN ${start_date} AND ${end_date}
GROUP BY
    day_kst
ORDER BY
    day_kst;
    `);
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/hangame/poker/ev-and-result-by-day/search")
  async searchPokerEVandResultByDay(
    @Query("mode") mode: string,
    @Query("selectedHours") stringifiedSelectedHours: string,
    @Query("selectedDate") selectedDate?: string,
    @Query("start") start?: string,
    @Query("end") end?: string,
    @Query("weekDays") weekDays?: any,
  ) {
    let selectedHours;
    let dayNumbers;
    const dayMapping: Record<string, number> = {
      일: 0,
      월: 1,
      화: 2,
      수: 3,
      목: 4,
      금: 5,
      토: 6,
    };

    try {
      selectedHours = JSON.parse(stringifiedSelectedHours);
    } catch (e: any) {
      throw new BadRequestException("잘못된 요청입니다");
    }

    if (!Array.isArray(selectedHours) || selectedHours.length === 0) {
      throw new BadRequestException("잘못된 요청입니다");
    }

    switch (mode) {
      case "allDay":
        return await this.pool.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
      -- 2. created_at을 KST로 변환한 시간 필터
      EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,
        -- 1. 전체 row 개수
    COUNT(*) AS total_rows,

    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,
    -- Group EVs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
`);

      case "specificDate":
        if (isNil(selectedDate)) {
          throw new BadRequestException("잘못된 요청입니다");
        }

        return await this.pool.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
      -- 1. created_at을 KST로 변환하고 특정 일자 필터
        DATE(created_at AT TIME ZONE 'Asia/Seoul') = ${selectedDate}
      -- 2. created_at을 KST로 변환한 시간 필터
      AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,
        -- 1. 전체 row 개수
    COUNT(*) AS total_rows,

    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,
    -- Group EVs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
        `);

      case "dateRange":
        if (isNil(start) || isNil(end)) {
          throw new BadRequestException("잘못된 요청입니다");
        }

        return await this.pool.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
      -- 1. created_at을 KST로 변환하고 특정 일자 필터
        DATE(created_at AT TIME ZONE 'Asia/Seoul') BETWEEN ${start} AND ${end}
      -- 2. created_at을 KST로 변환한 시간 필터
      AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,
        -- 1. 전체 row 개수
    COUNT(*) AS total_rows,
    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,
    -- Group EVs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
        `);

      case "weekDays":
        if (
          isNil(weekDays) ||
          !Array.isArray(JSON.parse(weekDays)) ||
          JSON.parse(weekDays).length === 0
        ) {
          throw new BadRequestException("잘못된 요청입니다");
        }
        // 요일 매핑
        dayNumbers = JSON.parse(weekDays).map((day) => dayMapping[day]); // 숫자로 변환
        return await this.pool.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
      -- 1. created_at을 KST로 변환하고 요일 필터
      EXTRACT(DOW FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(dayNumbers, "int4")}::int4[])
      -- 2. created_at을 KST로 변환한 시간 필터
      AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,
        -- 1. 전체 row 개수
    COUNT(*) AS total_rows,
    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,
    -- Group EVs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
        `);

      case "holidays":
        return await this.pool.transaction(async (t) => {
          const holiday = await t.one(
            sql`SELECT array_agg(holiday_date) AS holiday_date from holiday`,
          );

          return await t.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
        -- 1. 주말 필터 (KST 기준)
        (EXTRACT(DOW FROM created_at AT TIME ZONE 'Asia/Seoul') IN (0, 6))
        -- 2. 공휴일 필터 (KST 기준)
        OR DATE(created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(holiday.holiday_date as any, "date")}::date[])
        -- 3. 시간 필터 (KST 기준)
      AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,
        -- 1. 전체 row 개수
    COUNT(*) AS total_rows,
    -- Total result
    SUM(result) AS result,
    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,
    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev,
    -- Group EVs
    SUM(CASE
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') AND room = '20억(안봤다)'), 0),
            5
    ) AS sub_group_ev,
    SUM(CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') AND room = '20억(안봤다)'), 0),
            5
    ) AS soho_group_ev,
    SUM(CASE
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4') AND room = '20억(안봤다)'), 0),
            5
    ) AS office_group_ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
          `);
        });

      case "sameDateEveryMonth":
        if (isNil(start) || isNil(end)) {
          throw new BadRequestException("잘못된 요청입니다");
        }
        // eslint-disable-next-line no-case-declarations
        const startDate = new Date(start).getDate();
        // eslint-disable-next-line no-case-declarations
        const endDate = new Date(end).getDate();

        if (endDate >= startDate) {
          const result = await this.pool.any(sql`
WITH filtered_data AS (
    SELECT *
    FROM hangame_poker_ev
    WHERE
        -- 1. created_at을 KST로 변환하고 특정 일자 범위 필터 (매월 start_date ~ end_date 사이)
        EXTRACT(DAY FROM created_at AT TIME ZONE 'Asia/Seoul') BETWEEN ${startDate} AND ${endDate}
        -- 2. created_at을 KST로 변환한 시간 필터
        AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'Asia/Seoul') = ANY(${sql.array(selectedHours, "int4")}::int4[])
)
SELECT
    -- KST 기준 일자
    TO_CHAR(DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul'), 'YYYY-MM-DD') AS day_kst,

    -- 전체 row 개수
    COUNT(*) AS total_rows,

    -- Soho 그룹 row 개수
    COUNT(*) FILTER (WHERE computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4')) AS soho_group_rows,

    -- Sub 그룹 row 개수
    COUNT(*) FILTER (WHERE computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4')) AS sub_group_rows,

    -- Office 그룹 row 개수
    COUNT(*) FILTER (WHERE computer IN ('Office1', 'Office2', 'Office3', 'Office4')) AS office_group_rows,

    -- Total result
    SUM(result) AS result,

    -- Group results
    SUM(CASE WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN result ELSE 0 END) AS soho_group_result,
    SUM(CASE WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN result ELSE 0 END) AS office_group_result,
    SUM(CASE WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN result ELSE 0 END) AS sub_group_result,

    -- Total ev
    SUM(CASE
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NOT NULL THEN ev
            WHEN room = '20억' AND result NOT IN (-20, -40, -60) AND ev IS NULL THEN result
            WHEN room = '20억' AND result IN (-20, -40, -60) THEN result
            ELSE 0
        END) +
    ROUND(
            (
                (COALESCE(AVG(participant) FILTER (WHERE room = '20억(안봤다)'), 0) - COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0)) * 23 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) * 350 * 0.9795 / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1) +
                (-350) * (COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 0) - 1) / COALESCE(AVG(totalmax) FILTER (WHERE room = '20억(안봤다)'), 1)
                ) * COALESCE(COUNT(*) FILTER (WHERE room = '20억(안봤다)'), 0),
            5
    ) AS ev
FROM
    filtered_data
GROUP BY
    DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Seoul')
ORDER BY
    day_kst;
          `);
          return result;
        }
        throw new BadRequestException(
          "일자 범위 선택이 잘못되었습니다. 종료일이 시작일보다 커야합니다",
        );
      default:
        throw new BadRequestException("잘못된 요청입니다");
    }
  }

  @UseGuards(AuthGuard)
  @Get("/hangame/poker/replay-data")
  async getHangamePokerReplayData(@Res() res: Response) {
    // PG 풀에서 클라이언트 연결 획득
    const client = await this.pgPool.connect();
    const sql = `
      SELECT 
      hpsrr.hangame_poker_id,
    hpsrr.created_at AS hpsrr_created_at,
    hpsrr.replay_pot,
    hpsrr.participant AS hpsrr_participant,
    hpsrr.hand AS hpsrr_hand,
    hpsrr.action AS hpsrr_action,
    hpsrr.position AS hpsrr_position,
    hpsrr.filtered_hand,
    hpe.*
    FROM hangame_poker_structured_replay_record hpsrr
    INNER JOIN hangame_poker hpe ON hpe.id = hpsrr.hangame_poker_id
    WHERE hpe.created_at >= NOW() - INTERVAL '1 week'
    ORDER BY hpsrr.created_at DESC,
         CASE hpsrr.position
             WHEN '1' THEN 1
             WHEN '2' THEN 2
             WHEN '3' THEN 3
             WHEN '4' THEN 4
             WHEN '5' THEN 5
             WHEN '6' THEN 6
             WHEN 'D' THEN 7
             WHEN 'SB' THEN 8
             WHEN 'BB' THEN 9
             ELSE 10
    END`;

    // CsvExportService를 통해 쿼리 결과를 CSV로 스트리밍
    await this.csvExportService.streamQueryToCsv(res, client, sql, "HANGAME_POKER_REPLAY_DATA.csv");
  }
}
