import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Get,
  Put,
  BadRequestException,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { isNil } from "@toss/utils";
import { AuthGuard } from "http/auth/auth.guard";
import { Token } from "http/auth/auth.token";

@Controller("hangame/poker/action")
export class HangamePokerActionController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get("")
  async getHangamePokerAction(
    @Query("key") query: string,
    @Query("room") room: string,
    @Query("hand") hand: string,
    @Query("participant") participant: number,
    @Query("position") position: string,
    @Query("earlymax") earlymax: number,
    @Query("earlylimp") earlylimp: number,
  ) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    if (!room || !hand || isNaN(participant) || !position || isNaN(earlymax) || isNaN(earlylimp)) {
      throw new BadRequestException("필요한 값이 오지 않음");
    }

    const result = await this.pool.any(sql`
        SELECT
           *
        FROM hangame_poker_action
        WHERE room = ${room}
        AND hand = ${hand}
        AND participant = ${participant}
        AND position = ${position}
        AND earlymax = ${earlymax}
        AND earlylimp = ${earlylimp}
    `);

    if (result.length === 0) {
      throw new NotFoundException(
        `존재하지 않는 결과입니다. room: ${room}, hand: ${hand}, participant: ${participant}, position: ${position}, earlymax: ${earlymax}`,
      );
    }

    return result[0];
  }

  // 개별 액션 변경
  @UseGuards(AuthGuard)
  @Put("/each")
  async updateEachHangamePokerAction(@Body() body: any, @Token("sub") sub: any) {
    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = [
      "room",
      "hand",
      "participant",
      "position",
      "earlymax",
      "earlylimp",
      "new_action",
      "reason",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    if (!["F", "M"].includes(body.new_action)) {
      throw new BadRequestException("잘못된 action입니다");
    }

    // 조건 확인
    const conditions: any = [];

    conditions.push(sql`room = ${body.room}`);
    conditions.push(sql`hand = ${body.hand}`);
    conditions.push(sql`participant = ${body.participant}`);
    conditions.push(sql`position = ${body.position}`);
    conditions.push(sql`earlymax = ${body.earlymax}`);
    conditions.push(sql`earlylimp = ${body.earlylimp}`);

    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.transaction(async (t) => {
      // STEP 1. previous_action 확인
      const exist = await t.any(sql`
        SELECT * FROM hangame_poker_action
        WHERE ${whereClause}
      `);

      if (exist.length === 0) {
        throw new NotFoundException("데이터가 존재하지 않습니다");
      }

      const previous_action = exist[0].action;

      // STEP 2. hangame_poker_action_log 만들기
      const action_log = await t.query(sql`
          INSERT INTO hangame_poker_action_change_log
          (room, hand, participant, position, earlymax, earlylimp, previous_action, new_action, created_by, reason)
          VALUES
          (
            ${body.room},
            ${body.hand},
            ${body.participant},
            ${body.position},
            ${body.earlymax},
            ${body.earlylimp},
            ${previous_action},
            ${body.new_action},
            ${sub},
            ${body.reason}
          )
          RETURNING *
      `);

      // STEP 3. hangame_poker_action 업데이트
      const update = await t.query(sql`
          UPDATE hangame_poker_action
          SET 
            action = ${body.new_action},
            updated_at = now()
          WHERE
            room = ${body.room}
            AND hand = ${body.hand}
            AND participant = ${body.participant}
            AND position = ${body.position}
            AND earlymax = ${body.earlymax}
            AND earlylimp = ${body.earlylimp}
          RETURNING *
      `);
      return update.rows[0];
    });

    return result;
  }

  // 그룹 액션 변경
  @UseGuards(AuthGuard)
  @Put("/group")
  async updateGroupHangamePokerAction(@Body() body: any, @Token("sub") sub: any) {
    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = [
      "room",
      "hand",
      "participant",
      "position",
      "earlymax",
      "earlylimp",
      "new_action",
      "reason",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    if (!["F", "M"].includes(body.new_action)) {
      throw new BadRequestException("잘못된 action입니다");
    }

    const conditions: any = [];

    if (body.hand !== undefined && body.hand !== null) {
      conditions.push(sql`hand = ${body.hand}`);
    }
    if (
      body.participant !== undefined &&
      body.participant !== null &&
      !Number.isNaN(body.participant)
    ) {
      conditions.push(sql`participant = ${body.participant}`);
    }
    if (body.position !== undefined && body.position !== null) {
      conditions.push(sql`position = ${body.position}`);
    }
    if (body.earlymax !== undefined && body.earlymax !== null && !Number.isNaN(body.earlymax)) {
      conditions.push(sql`earlymax = ${body.earlymax}`);
    }
    if (body.earlylimp !== undefined && body.earlylimp !== null && !Number.isNaN(body.earlylimp)) {
      conditions.push(sql`earlylimp = ${body.earlylimp}`);
    }

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.transaction(async (t) => {
      // STEP 1. previous_action 확인
      const exist = await t.any(sql`
        SELECT * FROM hangame_poker_action
        WHERE ${whereClause}
      `);

      if (exist.length === 0) {
        throw new NotFoundException("데이터가 존재하지 않습니다");
      }

      // STEP 2. hangame_poker_action_log 만들기
      const action_log = await t.query(sql`
          INSERT INTO hangame_poker_action_change_log
          (room, hand, participant, position, earlymax, earlylimp, previous_action, new_action, created_by, reason)
          VALUES
          ${sql.join(
            exist.map(
              (item) =>
                sql`(${item.room}, ${item.hand}, ${item.participant}, ${item.position}, ${item.earlymax}, ${item.earlylimp}, ${item.action}, ${body.new_action}, ${sub}, ${body.reason})`,
            ),
            sql`,`,
          )}
          RETURNING *
      `);

      // STEP 3. hangame_poker_action 업데이트
      const update = await t.query(sql`
          UPDATE hangame_poker_action
          SET
            action = ${body.new_action},
            updated_at = now()
          WHERE ${whereClause}
          RETURNING *
      `);
      return update;
    });
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/search")
  async getAllHangamePokerAction(
    @Query("hand") hand?: string,
    @Query("participant") participant?: number,
    @Query("position") position?: string,
    @Query("earlymax") earlymax?: number,
    @Query("earlylimp") earlylimp?: number,
  ) {
    // 전부다 null이면 바로 return
    if (
      hand === undefined &&
      Number.isNaN(participant) &&
      position === undefined &&
      Number.isNaN(earlymax) &&
      Number.isNaN(earlylimp)
    ) {
      return [];
    }

    const conditions: any = [];

    if (hand !== undefined && hand !== null) {
      conditions.push(sql`hand = ${hand}`);
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

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.query(sql`
        SELECT
         id,
         room,
         hand,
         participant,
         position,
         earlymax,
         earlylimp,
         action,
         created_at,
         updated_at
        FROM hangame_poker_action
        WHERE ${whereClause} 
        ORDER BY
          participant ASC,
          CASE
              WHEN position ~ '^[0-9]+$' THEN 1
              WHEN position = 'D' THEN 2
              WHEN position = 'SB' THEN 3
              WHEN position = 'BB' THEN 4
              ELSE 5 -- catch-all for any unexpected values
              END,
          CASE
              WHEN position ~ '^[0-9]+$' THEN position::integer
              ELSE NULL
              END,
          earlymax,
          earlylimp IS NOT NULL,
          earlylimp;
    `);
    return result.rows;
  }

  @UseGuards(AuthGuard)
  @Get("/search/action-ratio")
  async getHangamePokerActionRatio(
    @Query("hand") hand?: string,
    @Query("participant") participant?: number,
    @Query("position") position?: string,
    @Query("earlymax") earlymax?: number,
    @Query("earlylimp") earlylimp?: number,
  ) {
    if (
      hand === undefined &&
      Number.isNaN(participant) &&
      position === undefined &&
      Number.isNaN(earlymax) &&
      Number.isNaN(earlylimp)
    ) {
      return { action_max_rows: 0, total_rows: 0 };
    }

    const conditions: any = [];

    if (hand !== undefined && hand !== null) {
      conditions.push(sql`hand = ${hand}`);
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

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.query(sql`
        SELECT
            COUNT(*) AS total_rows,
            SUM(CASE WHEN action = 'M' THEN 1 ELSE 0 END) AS action_max_rows
        FROM
            hangame_poker_action
        WHERE ${whereClause};
    `);
    return result.rows[0];
  }

  @UseGuards(AuthGuard)
  @Get("/history/each")
  async getEachHangamePokerActionChangeHistory(
    @Query("room") room?: string,
    @Query("hand") hand?: string,
    @Query("participant") participant?: number,
    @Query("position") position?: string,
    @Query("earlymax") earlymax?: number,
    @Query("earlylimp") earlylimp?: number,
  ) {
    const conditions: any = [];
    const compare_conditions: any = [];

    if (room !== undefined && room !== null) {
      conditions.push(sql`room = ${room}`);
      compare_conditions.push(sql`hangame_poker_ev.room = ranked_rows.room`);
    }
    if (hand !== undefined && hand !== null) {
      conditions.push(sql`hand = ${hand}`);
      compare_conditions.push(sql`hangame_poker_ev.myhand = ranked_rows.hand`);
    }
    if (participant !== undefined && participant !== null && !Number.isNaN(participant)) {
      conditions.push(sql`participant = ${participant}`);
      compare_conditions.push(sql`hangame_poker_ev.participant = ranked_rows.participant`);
    }
    if (position !== undefined && position !== null) {
      conditions.push(sql`position = ${position}`);
      compare_conditions.push(sql`hangame_poker_ev.position = ranked_rows.position`);
    }
    if (earlymax !== undefined && earlymax !== null && !Number.isNaN(earlymax)) {
      conditions.push(sql`earlymax = ${earlymax}`);
      compare_conditions.push(sql`hangame_poker_ev.earlymax = ranked_rows.earlymax`);
    }
    if (earlylimp !== undefined && earlylimp !== null && !Number.isNaN(earlylimp)) {
      conditions.push(sql`earlylimp = ${earlylimp}`);
      compare_conditions.push(sql`hangame_poker_ev.earlylimp = ranked_rows.earlylimp`);
    }

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;
    const whereCompareClause =
      compare_conditions.length > 0 ? sql.join(compare_conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.any(sql`
WITH ranked_rows AS (
    SELECT
        id,
        room,
        created_at,
        created_by,
        previous_action,
        new_action,
        reason,
        hand,
        participant,
        position,
        earlymax,
        earlylimp,
        ROW_NUMBER() OVER (PARTITION BY hand, participant, position ORDER BY created_at DESC) AS row_number,
        LAG(created_at) OVER (PARTITION BY hand, participant, position ORDER BY created_at DESC) AS previous_created_at
    FROM hangame_poker_action_change_log
    WHERE ${whereClause}
)
SELECT
    id,
    room,
    created_at,
    created_by,
    previous_action,
    new_action,
    reason,
    earlymax,
    earlylimp,
    CASE
        WHEN row_number = 1 THEN NOW() -- 최신 행의 end_at은 현재 시간
        ELSE previous_created_at -- 이전 행의 created_at
        END AS end_at,
    ev_stats.avg_ev AS ev_average, -- ev의 평균
    ev_stats.sample_count AS ev_sample -- 사용된 row 개수
FROM ranked_rows
         CROSS JOIN LATERAL (
    SELECT
        AVG(ev) AS avg_ev,
        COUNT(*) AS sample_count
    FROM hangame_poker_ev
    WHERE
        ${whereCompareClause}
      AND hangame_poker_ev.created_at >= ranked_rows.created_at
      AND hangame_poker_ev.created_at < (
        CASE
            WHEN ranked_rows.row_number = 1 THEN NOW()
            ELSE ranked_rows.previous_created_at
            END
        )
    ) ev_stats
ORDER BY created_at ASC;
    `);
    return result;
  }

  @UseGuards(AuthGuard)
  @Delete("/history/each/:id")
  async deleteEachHangamePokerActionChangeHistory(@Param("id") id: number) {
    const result = await this.pool.transaction(async (t) => {
      const exist = await t.any(sql`
          SELECT * FROM hangame_poker_action_change_log WHERE id = ${id}
      `);
      if (exist.length === 0) {
        throw new NotFoundException("존재하지 않는 기록이거나, 잘못된 ID입니다");
      }
      return await t.query(sql`
        DELETE FROM hangame_poker_action_change_log
        WHERE id = ${id}
        RETURNING *
    `);
    });
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/history/group")
  async getGroupHangamePokerActionChangeHistory(
    @Query("room") room?: string | null,
    @Query("hand") hand?: string | null,
    @Query("participant") participant?: number | null,
    @Query("position") position?: string | null,
    @Query("earlymax") earlymax?: number | null,
    @Query("earlylimp") earlylimp?: number | null,
  ) {
    const conditions: any = [];

    if (room !== undefined && room !== null) {
      conditions.push(sql`room = ${room}`);
    }
    if (hand !== undefined && hand !== null) {
      conditions.push(sql`hand = ${hand}`);
    }
    if (participant !== undefined && participant !== null && !Number.isNaN(participant)) {
      conditions.push(sql`participant = ${participant}`);
    }
    if (position !== undefined && position !== null) {
      conditions.push(sql`position = ${position}`);
    }
    if (earlymax !== undefined && earlymax !== null && !Number.isNaN(earlymax)) {
      conditions.push(sql`earlymax = ${earlymax}`);
    }
    if (earlylimp !== undefined && earlylimp !== null && !Number.isNaN(earlylimp)) {
      conditions.push(sql`earlylimp = ${earlylimp}`);
    }

    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.any(sql`
        SELECT
            DISTINCT ON (created_at)
            room,
            hand,
            TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') || ' +00:00' AS created_at,
            created_by,
            previous_action,
            new_action,
            reason
          FROM hangame_poker_action_change_log
          WHERE ${whereClause}
          ORDER BY created_at ASC
    `);

    return result;
  }

  @UseGuards(AuthGuard)
  @Delete("/history/group")
  async deleteGroupHangamePokerActionChangeHistory(
    @Query("room") room: string,
    @Query("hand") hand: string,
    @Query("created_at") created_at: string,
    @Query("created_by") created_by: string,
    @Query("previous_action") previous_action: string,
    @Query("new_action") new_action: string,
    @Query("reason") reason: string,
  ) {
    // 조건 체크
    const all = [room, hand, created_at, created_by, previous_action, new_action, reason];
    if (all.some((value) => isNil(value))) {
      throw new BadRequestException("잘못된 요청값입니다");
    }

    //1704119245113
    // 조건 삽입
    const conditions: any = [];
    conditions.push(sql`room = ${room}`);
    conditions.push(sql`hand = ${hand}`);
    conditions.push(sql`created_at = ${created_at}`);
    conditions.push(sql`created_by = ${created_by}`);
    conditions.push(sql`previous_action = ${previous_action}`);
    conditions.push(sql`new_action = ${new_action}`);
    conditions.push(sql`reason = ${reason}`);
    // Combine all conditions with AND
    const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`TRUE`;

    const result = await this.pool.transaction(async (t) => {
      const exist = await t.any(sql`
        SELECT * FROM hangame_poker_action_change_log
        WHERE ${whereClause}
      `);
      if (exist.length === 0) {
        throw new NotFoundException("조건을 만족하는 action log가 없습니다");
      }
      const deleteQuery = await t.query(sql`
          DELETE FROM hangame_poker_action_change_log
          WHERE ${whereClause}
          RETURNING *
      `);
      return deleteQuery.rows;
    });
    return result;
  }
}
