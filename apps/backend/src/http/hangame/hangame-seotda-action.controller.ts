import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Put,
  Delete,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";
import { Token } from "http/auth/auth.token";

@Controller("hangame/seotda/action")
export class HangameSeotdaActionController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  // 한게임섯다 개별 액션 변경 및 추가
  // TODO: 현재는 액션 로그 추가만 하는 방식임. 차후 액션 연동 필요
  @UseGuards(AuthGuard)
  @Put("/each")
  async updateEachHangameSeotdaAction(@Body() body: any, @Token("sub") sub: any) {
    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = ["participant", "position", "morning_first_action", "memo"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    const result = await this.pool.transaction(async (t) => {
      // hangame_seotda_action_change_log만 만듦
      // TODO: 차후에 액션 연동 필요. hangame-poker-action.controller 참고
      const action_log = await t.query(sql`
          INSERT INTO hangame_seotda_action_change_log
          (participant, position, morning_first_action, memo, created_by)
          VALUES
          (
            ${body.participant},
            ${body.position},
            ${body.morning_first_action},
            ${body.memo},
            ${sub}
          )
        RETURNING *
      `);
      return action_log;
    });

    return result;
  }

  // change_log 삭제
  @UseGuards(AuthGuard)
  @Delete("/each/:id")
  async deleteHangameSeotdaActionChangeHistory(@Param("id") id: number) {
    const result = await this.pool.query(sql`
        DELETE FROM hangame_seotda_action_change_log
        WHERE id = ${id}
    `);
    return { result: "success" };
  }

  // 한게임섯다 개별 액션 히스토리
  @UseGuards(AuthGuard)
  @Get("/history/each")
  async getEachHangameSeotdaActionChangeHistory(
    @Token("sub") sub: string,
    @Query("participant") participant: number,
    @Query("position") position: number,
    @Query("morning_first_action") morning_first_action: string,
  ) {
    const conditions: any = [];
    const compare_conditions: any = [];

    if (participant !== undefined && participant !== null && !Number.isNaN(participant)) {
      conditions.push(sql`participant = ${participant}`);
      compare_conditions.push(sql`hangame_seotda_record.participant = ranked_rows.participant`);
    }
    if (position !== undefined && position !== null && !Number.isNaN(position)) {
      conditions.push(sql`position = ${position}`);
      compare_conditions.push(sql`hangame_seotda_record.position = ranked_rows.position`);
    }
    if (morning_first_action !== undefined && morning_first_action !== null) {
      conditions.push(sql`morning_first_action = ${morning_first_action}`);
      compare_conditions.push(
        sql`hangame_seotda_record.morning_first_action = ranked_rows.morning_first_action`,
      );
    }

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;
    const whereCompareClause =
      compare_conditions.length > 0 ? sql.join(compare_conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.any(sql`
WITH ranked_rows AS (
    SELECT
        id,
        created_at,
        created_by,
        participant,
        position,
        morning_first_action,
        memo,
        ROW_NUMBER() OVER (PARTITION BY participant, position ORDER BY created_at DESC) AS row_number,
        LAG(created_at) OVER (PARTITION BY participant, position ORDER BY created_at DESC) AS previous_created_at
    FROM hangame_seotda_action_change_log
    WHERE ${whereClause}
)
SELECT
    id,
    created_at,
    created_by,
    participant,
    position,
    morning_first_action,
    memo,
    CASE
        WHEN row_number = 1 THEN NOW() -- 최신 행의 end_at은 현재 시간
        ELSE previous_created_at -- 이전 행의 created_at
        END AS end_at,
    result_status.avg_result AS result_average, -- ev의 평균
    result_status.sample_count AS result_sample -- 사용된 row 개수
FROM ranked_rows
         CROSS JOIN LATERAL (
    SELECT
        AVG(result) AS avg_result,
        COUNT(*) AS sample_count
    FROM hangame_seotda_record
    WHERE
        ${whereCompareClause}
      AND hangame_seotda_record.created_at >= ranked_rows.created_at
      AND hangame_seotda_record.created_at < (
        CASE
            WHEN ranked_rows.row_number = 1 THEN NOW()
            ELSE ranked_rows.previous_created_at
            END
        )
    ) result_status
ORDER BY created_at DESC;
    `);
    return result;
  }
}
