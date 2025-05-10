import {
  Controller,
  Query,
  Get,
  UnauthorizedException,
  Post,
  UseGuards,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";

@Controller("common")
export class CommonController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get("/critical-alarm")
  async getCriticalStatus(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 새벽 4~8 : 15분
    // 나머지 : 5분
    const now_hours = (new Date().getHours() + 9) % 24;
    const minutes = now_hours >= 4 && now_hours <= 7 ? 15 : 3;

    return await this.pool.transaction(async (t) => {
      // condition 1. office, sub, soho 세 개 전부 10분 이상 데이터가 들어오지 않을 때
      // 25.03.10 수정
      const condition1 = await t.query(sql`
WITH recent_data AS (
    SELECT
        id,
        CASE
            WHEN computer LIKE 'Soho%' THEN 'Soho'
            WHEN computer LIKE 'Office%' THEN 'Office'
            WHEN computer LIKE 'Sub%' THEN 'Sub'
            ELSE 'Unknown'
            END AS computer_group,
        created_at
    FROM hangame_poker
    WHERE computer IN (
                       'Soho1', 'Soho2', 'Soho3', 'Soho4',
                       'Office1', 'Office2', 'Office3', 'Office4',
                       'Sub1', 'Sub2', 'Sub3', 'Sub4'
        )
      AND created_at >= now() - INTERVAL '10 minutes'
),
     latest_row AS (
         SELECT
             CASE
                 WHEN computer LIKE 'Soho%' THEN 'Soho'
                 WHEN computer LIKE 'Office%' THEN 'Office'
                 WHEN computer LIKE 'Sub%' THEN 'Sub'
                 ELSE 'Unknown'
                 END AS latest_group
         FROM hangame_poker
         WHERE created_at = (SELECT MAX(created_at) FROM hangame_poker)
     )
SELECT
    rd.computer_group,
    COUNT(*) AS row_count,
    CASE
        WHEN rd.computer_group = lr.latest_group THEN TRUE
        ELSE FALSE
        END AS is_running
FROM recent_data rd
         CROSS JOIN latest_row lr
GROUP BY rd.computer_group, lr.latest_group
ORDER BY rd.computer_group;
      `);

      if (condition1.rows.length === 0) {
        const last_running_computer = await t.one(
          sql`SELECT * FROM hangame_poker_ev ORDER BY created_at DESC LIMIT 1`,
        );
        return {
          result: "failure",
          message: `게임이 돌고 있지 않음 / 가장 최근 컴퓨터:${last_running_computer.computer}`,
        };
      }

      // condition 2. 세 종류의 컴퓨터 중 두 개 이상이 동시에 돌아갈 때
      // hangame_computer_log를 먼저 보고, log_change_count가 1 이상이면 => hangame_poker테이블을 보고, 1 이상이면 error return
      // hangame_computer_log가 1이상인데, hangame_poker테이블의 count가 0이면 정상
      const condition2_1 = await t.any(sql`
WITH grouped_data AS (
    SELECT
        created_at,
        computer,
        CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN 'Soho'
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN 'Office'
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN 'Sub'
            ELSE 'Unknown'
            END AS group_name
    FROM hangame_computer_log
    WHERE created_at >= NOW() - INTERVAL '10 minutes'
    ORDER BY created_at DESC
),
     change_tracking AS (
         SELECT
             created_at,
             group_name,
             LAG(group_name) OVER (ORDER BY created_at) AS previous_group_name
         FROM grouped_data
     ),
     group_changes AS (
         SELECT
             *,
             CASE
                 WHEN previous_group_name IS NULL THEN 0
                 WHEN previous_group_name <> group_name THEN 1
                 ELSE 0
                 END AS group_changed
         FROM change_tracking
     )
SELECT
    SUM(group_changed) AS group_change_count
FROM group_changes;
`);
      const condition2_2 = await t.any(sql`
WITH grouped_data AS (
    SELECT
        created_at,
        computer,
        CASE
            WHEN computer IN ('Soho1', 'Soho2', 'Soho3', 'Soho4') THEN 'Soho'
            WHEN computer IN ('Office1', 'Office2', 'Office3', 'Office4') THEN 'Office'
            WHEN computer IN ('Sub1', 'Sub2', 'Sub3', 'Sub4') THEN 'Sub'
            ELSE 'Unknown'
            END AS group_name
    FROM hangame_poker
    WHERE created_at >= NOW() - INTERVAL '10 minutes'
    ORDER BY created_at DESC
),
     change_tracking AS (
         SELECT
             created_at,
             group_name,
             LAG(group_name) OVER (ORDER BY created_at) AS previous_group_name
         FROM grouped_data
     ),
     group_changes AS (
         SELECT
             *,
             CASE
                 WHEN previous_group_name IS NULL THEN 0
                 WHEN previous_group_name <> group_name THEN 1
                 ELSE 0
                 END AS group_changed
         FROM change_tracking
     )
SELECT
    SUM(group_changed) AS group_change_count
FROM group_changes;
      `);

      if (
        (condition2_1[0].group_change_count as any) > 5 &&
        (condition2_2[0].group_change_count as any) > 5
      ) {
        const error_message = `조건1: ${JSON.stringify(condition2_1)}, 조건2: ${JSON.stringify(condition2_2)}`;
        await t.query(sql`
INSERT INTO error
(error, title)
VALUES
(${error_message}, '두 종류 이상의 컴퓨터가 돌고 있음')
`);
        return {
          result: "failure",
          message: "두 종류 이상의 컴퓨터가 돌고 있음",
        };
      }

      // condition 3. 한 종류의 컴퓨터가 돌 때, 네 개 전부 돌지 않고(15분 이상) 있을 때
      const computer_group = condition1.rows
        .filter((item) => item.is_running) // is_running이 true인 객체 필터링
        .map((item) => item.computer_group); // computer_group 값만 추출

      // condition 3-1. (예외) 가장 최근 컴퓨터가 돈지 15분이 되지 않았다면, 문제 없음으로 처리하자
      const condition_3_1 = await t.one(sql`
          SELECT
              *
          FROM hangame_computer_log
          WHERE created_at >  NOW() - INTERVAL '30 min'
          AND computer LIKE ${computer_group + "%"}
          ORDER BY id ASC
          LIMIT 1
      `);

      const now = new Date().getTime();
      const condition_3_1_record = new Date((condition_3_1?.created_at as string) ?? 0).getTime();
      if (now - condition_3_1_record < 900000) {
        return {
          result: "success",
          message: "",
        };
      }

      // condition 3-2. 한 종류의 컴퓨터가 돌 때, 네 개 전부 돌지 않고(15분 이상) 있을 때
      const condition_3_2 = await t.query(sql`
        SELECT
            computer,
            COUNT(*) AS log_count
        FROM hangame_computer_log
        WHERE computer LIKE ${computer_group + "%"}
          AND created_at >= NOW() - (${minutes} * INTERVAL '1 minute')
        GROUP BY computer
        ORDER BY computer;
      `);

      if (condition_3_2.rows.length !== 4) {
        const running_computers = `도는 컴퓨터: ${condition_3_2.rows.map((item) => item.computer).join(", ")}`;
        await t.query(sql`
INSERT INTO error
(error, title)
VALUES
(${running_computers}, '4개 중 일부 컴퓨터만 돔')
`);
        return {
          result: "failure",
          message: `${computer_group} 중 ${condition_3_2.rows.length}개의 컴퓨터만 돌고 있음`,
        };
      }

      return {
        result: "success",
        message: "",
      };
    });
  }

  @Get("hangame-money-storage-alarm")
  async getHangameMoneyStorageAlarm(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.query(sql`
SELECT *
FROM hangame_money_storage
WHERE deleted_at IS NULL
AND expired_at BETWEEN now() AND now() + interval '1 hour';
    `);

    if (result.rows.length === 0) {
      return {
        result: "success",
        message: "",
      };
    }

    const uniqueComputersText = [...new Set(result.rows.map((item: any) => item.computer))].join(
      ", ",
    );

    return {
      result: "failure",
      message: `돈을 받아야할 컴퓨터: ${uniqueComputersText}`,
    };
  }

  @UseGuards(AuthGuard)
  @Get("hangame-total-dashboard")
  async getHangameTotalDashboard(@Query("time") time: string) {
    const yearQuery = sql`
WITH yearly_result AS (
    SELECT 
        created_year_kst AS year_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_poker_ev
    GROUP BY 
        year_kst
    UNION ALL
    SELECT 
        created_year_kst AS year_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_seotda_record
    GROUP BY 
        year_kst
)
SELECT 
    year_kst,
    SUM(total_result) AS total_result,
    SUM(count) AS count
FROM 
    yearly_result
GROUP BY
    year_kst
ORDER BY
    year_kst DESC;
      `;
    const monthQuery = sql`
WITH monthly_result AS (
    SELECT 
        created_month_kst AS month_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_poker_ev
    GROUP BY 
        month_kst
    UNION ALL
    SELECT 
        created_month_kst AS month_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_seotda_record
    GROUP BY 
        month_kst
)
SELECT 
    month_kst,
    SUM(total_result) AS total_result,
    SUM(count) AS count
FROM 
    monthly_result
GROUP BY
    month_kst
ORDER BY
    month_kst;
      `;
    const dayQuery = sql`
WITH daily_result AS (
    SELECT 
        created_day_kst AS day_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_poker
    GROUP BY 
        day_kst
    UNION ALL
    SELECT 
        created_day_kst AS day_kst,
        SUM(result) AS total_result,
        COUNT(*) AS count
    FROM 
        hangame_seotda_record
    GROUP BY 
        day_kst
)
SELECT 
    day_kst,
    SUM(total_result) AS total_result,
    SUM(count) AS count
FROM 
    daily_result
GROUP BY
    day_kst
ORDER BY
    day_kst;
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
      const year_data = await t.any(yearQuery);
      const month_data = await t.any(monthQuery);
      const day_data = await t.any(dayQuery);

      return { year_data: year_data, month_data: month_data, day_data: day_data };
    });
  }

  // TODO: 삭제 필요
  @Get("computer/status")
  async getComputerStatus(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const runningComputers = await this.pool.any(sql`
SELECT DISTINCT "computer" FROM hangame_poker
WHERE created_at > now() - INTERVAL'3 minutes'
`);

    // 도는 컴퓨터가 없다면 => priority 발송
    if (runningComputers.length === 0) {
      const priority = await this.pool.any(sql`
SELECT * FROM computer_priority
WHERE game = 'hangame-poker'
ORDER BY priority ASC
`);
      return priority.reduce((acc: any, item: any) => {
        acc[item.priority] = item.computer;
        return acc;
      }, {});
    } else {
      return "GOOD";
    }
  }

  @Post("computer/money-limit")
  async postComputerMoneyLimit(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = ["stop_computer", "next_computer", "next2_computer"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    const result = await this.pool.query(sql`
        INSERT INTO hangame_computer_limit
        (stop_computer, next_computer, next2_computer, stop_start_at, stop_end_at)
        VALUES
        (
          ${body.stop_computer}, 
          ${body.next_computer}, 
          ${body.next2_computer}, 
          now(),
          CASE 
            WHEN CURRENT_TIME < '15:00:00' THEN 
                DATE_TRUNC('day', CURRENT_TIMESTAMP) + INTERVAL '15 hours'
            ELSE 
                DATE_TRUNC('day', CURRENT_TIMESTAMP + INTERVAL '1 day') + INTERVAL '15 hours'
          END
        )
        RETURNING *
    `);

    return result.rows;
  }

  @Get("computer/money-limit/next")
  async getNextComputerWhenMoneyLimit(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.transaction(async (t) => {
      const exist = await t.any(sql`
          SELECT * FROM hangame_computer_limit
          WHERE now() BETWEEN stop_start_at AND stop_end_at
          ORDER BY stop_start_at DESC
      `);

      if (exist.length === 0) {
        return {
          result: "no-change",
          message: "정지당한 컴퓨터가 없습니다",
        };
      }

      return {
        result: "change",
        message: `교체 대상 컴퓨터:${exist[0].next_computer},${exist[0].next2_computer}`,
      };
    });
    return result;
  }
}
