import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseGuards,
  Res,
  Inject,
  Put,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "http/auth/auth.guard";
import { isNil } from "@toss/utils";
import pg from "pg";
import { CsvExportService } from "utility/csv-export.service";

@Controller("wpl")
export class WplController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    @Inject("PG_POOL") private readonly pgPool: pg.Pool,
    private readonly csvExportService: CsvExportService,
  ) {}

  @Post("/poker")
  async postWplPokerData(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const ids: any = [];

    const result = await this.pool.transaction(async (t) => {
      for (const datum of body) {
        const insert = await t.query(sql`
          INSERT INTO wpl_aof_record
            (
              computer,
              channel,
              participants,
              position,
              player_name,
              action,
              previous_action,
              hand,
              result
            )
          VALUES
            (
              ${isNil(datum.computer) ? null : datum.computer},
              ${datum.channel},
              ${datum.participants},
              ${datum.position},
              ${datum.player_name},
              ${datum.action},
              ${datum.previous_action},
              ${datum.hand},
              ${datum.result}
            )
          RETURNING id
        `);
        ids.push(insert.rows[0].id);
      }

      await t.query(sql`
         UPDATE wpl_aof_record
         SET group_id = ${ids[0]}
         WHERE id = ANY(${sql.array(ids, "int4")}::int4[])
      `);
      return { result: "success" };
    });

    return result;
  }

  @Post("/poker/realtime-participant")
  async postRealtimeParticipant(@Query("key") query: string, @Body() body: any) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = [
      "computer",
      "participant_1_id",
      "participant_2_id",
      "participant_3_id",
      "participant_4_id",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    // validation check
    const { computer, participant_1_id, participant_2_id, participant_3_id, participant_4_id } =
      body;

    const valid_computer = [
      "Office1",
      "Office2",
      "Office3",
      "Office4",
      "Soho1",
      "Soho2",
      "Soho3",
      "Soho4",
      "Sub1",
      "Sub2",
      "Sub3",
      "Sub4",
    ];

    if (!valid_computer.includes(computer)) {
      throw new BadRequestException("존재하지 않는 컴퓨터입니다");
    }

    const result = await this.pool.transaction(async (t) => {
      const others = await t.any(sql`
        SELECT
            *
        FROM wpl_aof_realtime_participant
        WHERE NOW() < updated_at + INTERVAL '3 minutes'
        AND participant_1_id = ${participant_1_id}
        AND participant_2_id = ${participant_2_id}
        AND participant_3_id = ${participant_3_id}
        AND participant_4_id = ${participant_4_id}
        AND computer != ${computer}
`);

      // 겹치는 컴퓨터가 없다면, participant 업데이트 후 return
      if (others.length === 0) {
        await t.query(sql`
        UPDATE wpl_aof_realtime_participant
        SET
            participant_1_id = ${participant_1_id},
            participant_2_id = ${participant_2_id},
            participant_3_id = ${participant_3_id},
            participant_4_id = ${participant_4_id},
            updated_at = NOW()
        WHERE computer = ${computer}
`);
        return { result: "success" };
      }

      if (others.length === 1) {
        await t.query(sql`
        UPDATE wpl_aof_realtime_participant
        SET
            participant_1_id = null,
            participant_2_id = null,
            participant_3_id = null,
            participant_4_id = null,
            updated_at = NOW()
        WHERE computer = ${computer}
`);
        return { result: "failure" };
      }

      if (others.length >= 2) {
        return { result: "failure", message: "사고발생했습니다. 오우열 창녀 전직 0.5초전입니다" };
      }
    });

    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/poker/record/all")
  async getAllPokerRecord(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
    SELECT * FROM wpl_aof_record
        ORDER BY "id" DESC
    `;
    await this.csvExportService.streamQueryToCsv(res, client, sql, "WPL_AOF_RECORD.csv");
  }

  @UseGuards(AuthGuard)
  @Get("/poker/record/distinct-count")
  async getDistinctPokerRecord(@Query("channel") channel: string) {
    const channels = ["마스터", "프로", "중수"];

    if (channels.includes(channel) || channel === undefined) {
      return await this.pool.any(sql`
WITH game_participant_count AS (
    SELECT group_id, channel, COUNT(*) AS participant_count
    FROM wpl_aof_record
    ${channels.includes(channel) ? sql` WHERE channel = ${channel} ` : sql``}
    GROUP BY group_id, channel
)
SELECT channel, '전체' AS participant_count, COUNT(*) AS unique_game_count
FROM game_participant_count
GROUP BY channel
UNION ALL
SELECT channel,participant_count::text, COUNT(*) AS unique_game_count
FROM game_participant_count
WHERE participant_count IN (1, 2, 3, 4)
GROUP BY participant_count, channel
ORDER BY channel, participant_count;
`);
    }

    throw new BadRequestException("올바르지 않은 요청값입니다");
  }

  // TODO: wpl_aof_allin도 변경
  @UseGuards(AuthGuard)
  @Get("/poker/dashboard")
  async getWplPokerDashboard(@Query("channel") channel: string) {
    const channels = ["마스터", "프로", "중수"];
    if (!channels.includes(channel)) {
      throw new BadRequestException("올바르지 않은 채널 정보입니다");
    }

    const result = await this.pool.any(sql`
SELECT
    allin.situation,

    /* 최근 상위 30% 올인 비율 (소수점 셋째 자리까지 반올림) */
    CASE WHEN recent_30pct_game_count = 0 THEN 0
         ELSE ROUND(
                 (recent_30pct_allin::numeric / recent_30pct_game_count::numeric) * 100
             , 3
              )
        END AS recent_30pct_allinpct,

    /* 최근 30~60% 올인 비율 */
    CASE WHEN recent_30_60pct_game_count = 0 THEN 0
         ELSE ROUND(
                 (recent_30_60_pct_allin::numeric / recent_30_60pct_game_count::numeric) * 100
             , 3
              )
        END AS recent_30_60pct_allinpct,

    /* 최근 60~90% 올인 비율 */
    CASE WHEN recent_60_90pct_game_count = 0 THEN 0
         ELSE ROUND(
                 (recent_60_90_pct_allin::numeric / recent_60_90pct_game_count::numeric) * 100
             , 3
              )
        END AS recent_60_90pct_allinpct,

    /* 최근 90~100% 올인 비율 */
    CASE WHEN recent_90_100pct_game_count = 0 THEN 0
         ELSE ROUND(
                 (recent_90_100_pct_allin::numeric / recent_90_100pct_game_count::numeric) * 100
             , 3
              )
        END AS recent_90_100pct_allinpct,

    /* 최근 30% 구간에서의 기타 통계 */
    recent_30pct_game_count_2,
    recent_30pct_a_0_count,
    recent_30pct_a_1_count,
    recent_30pct_a_2_count,
    recent_30pct_a_3_count,
    recent_30pct_a_4_count,

    /* wpl_aof_situation_participant_range 테이블에서 가져온 정보 */
    participant_range.target_participants,

    /* wpl_aof_situation_hand_range에서 EV 최대치(my_ev), 해당 핸드(my_range) */
    shr.my_ev,
    shr.my_range,
    shr.my_acc_probability,
    
    s_hand_range.ev AS my_selected_ev,
    s_hand_range.hand AS my_selected_range,
    s_hand_range.acc_probability AS my_selected_acc_probability,

    /* [새로 추가] wpl_aof_situation_opponents_ev에서 opponents_ev 컬럼 */
    op.opponents_ev

FROM wpl_aof_allin allin

/* 상황별 권장 participants 등 JOIN */
         LEFT JOIN wpl_aof_situation_participant_range participant_range
                   ON participant_range.situation = allin.situation AND participant_range.channel = ${channel} 

/* EV 최대값 + 핸드 JOIN (DISTINCT ON) */
         LEFT JOIN (
    SELECT DISTINCT ON (situation)
        channel,
        situation,
        hand AS my_range,
        ev   AS my_ev,
        acc_probability AS my_acc_probability
    FROM wpl_aof_situation_hand_range
    WHERE wpl_aof_situation_hand_range.channel = ${channel}
    ORDER BY situation, ev DESC, hand
) shr
                   ON shr.situation = allin.situation AND shr.channel = ${channel}
                   
/* 선택된 핸드 */
LEFT JOIN wpl_aof_situation_hand_range s_hand_range
ON s_hand_range.situation = allin.situation AND s_hand_range.is_selected = true AND s_hand_range.channel = ${channel}

/* [추가] 상대 EV(opponents_ev) JOIN */
         LEFT JOIN wpl_aof_situation_opponents_ev op
                   ON op.situation = allin.situation AND op.channel = ${channel}

ORDER BY
    CASE allin.situation
        WHEN '2인SB'      THEN 1
        WHEN '2인BB_A'    THEN 2
        WHEN '2인BB_F'    THEN 3
        WHEN '3인D'       THEN 4
        WHEN '3인SB_A'    THEN 5
        WHEN '3인SB_F'    THEN 6
        WHEN '3인BB_AA'   THEN 7
        WHEN '3인BB_AF'   THEN 8
        WHEN '3인BB_FA'   THEN 9
        WHEN '3인BB_FF'   THEN 10
        WHEN '4인1'       THEN 11
        WHEN '4인D_A'     THEN 12
        WHEN '4인D_F'     THEN 13
        WHEN '4인SB_AA'   THEN 14
        WHEN '4인SB_AF'   THEN 15
        WHEN '4인SB_FA'   THEN 16
        WHEN '4인SB_FF'   THEN 17
        WHEN '4인BB_AAA'  THEN 18
        WHEN '4인BB_AAF'  THEN 19
        WHEN '4인BB_AFA'  THEN 20
        WHEN '4인BB_FAA'  THEN 21
        WHEN '4인BB_AFF'  THEN 22
        WHEN '4인BB_FAF'  THEN 23
        WHEN '4인BB_FFA'  THEN 24
        WHEN '4인BB_FFF'  THEN 25
        ELSE 999
        END;

`);
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("/poker/dashboard/hand-range")
  async getHandRangeBySituation(
    @Query("situation") situation: string,
    @Query("channel") channel: string,
  ) {
    const situations = [
      "2인SB",
      "2인BB_A",
      "2인BB_F",
      "3인D",
      "3인SB_A",
      "3인SB_F",
      "3인BB_AA",
      "3인BB_AF",
      "3인BB_FA",
      "3인BB_FF",
      "4인1",
      "4인D_A",
      "4인D_F",
      "4인SB_AA",
      "4인SB_AF",
      "4인SB_FA",
      "4인SB_FF",
      "4인BB_AAA",
      "4인BB_AAF",
      "4인BB_AFA",
      "4인BB_AFF",
      "4인BB_FAA",
      "4인BB_FAF",
      "4인BB_FFA",
      "4인BB_FFF",
    ];
    const channels = ["마스터", "프로", "중수"];
    if (!situations.includes(situation) || !channels.includes(channel)) {
      throw new BadRequestException("잘못된 situation 또는 channel입니다");
    }

    const result = await this.pool.any(sql`
    SELECT * FROM wpl_aof_situation_hand_range
    WHERE situation = ${situation} AND channel=${channel}
    ORDER BY priority ASC
`);
    return result;
  }

  @UseGuards(AuthGuard)
  @Put("/poker/dashboard/hand-range/is-selected")
  async updateHandRangeSelectedBySituation(@Body() body: any) {
    const situations = [
      "2인SB",
      "2인BB_A",
      "2인BB_F",
      "3인D",
      "3인SB_A",
      "3인SB_F",
      "3인BB_AA",
      "3인BB_AF",
      "3인BB_FA",
      "3인BB_FF",
      "4인1",
      "4인D_A",
      "4인D_F",
      "4인SB_AA",
      "4인SB_AF",
      "4인SB_FA",
      "4인SB_FF",
      "4인BB_AAA",
      "4인BB_AAF",
      "4인BB_AFA",
      "4인BB_AFF",
      "4인BB_FAA",
      "4인BB_FAF",
      "4인BB_FFA",
      "4인BB_FFF",
    ];
    const channels = ["마스터", "프로", "중수"];

    const { situation, hand, channel } = body;
    if (
      isNil(situation) ||
      isNil(hand) ||
      !situations.includes(situation) ||
      !channels.includes(channel)
    ) {
      throw new BadRequestException("잘못된 값입니다");
    }

    const result = await this.pool.transaction(async (t) => {
      await t.query(sql`
UPDATE wpl_aof_situation_hand_range
SET is_selected = false
WHERE situation = ${situation} AND channel=${channel} AND is_selected = true
`);
      await t.query(sql`
UPDATE wpl_aof_situation_hand_range
SET is_selected = true
WHERE situation = ${situation} AND channel=${channel} AND hand = ${hand}
`);
      return { result: "success" };
    });
    return result;
  }

  // TODO: channel 정보 포함하도록 업데이트 => wpl_aof_allin 처리 후
  @Get("/poker/dashboard/opponents-range-by-situation")
  async getOpponentsRange(@Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    const result = await this.pool.any(sql`
SELECT
    situation,
    ROUND(
      (
        CASE WHEN recent_30pct_game_count = 0 THEN 0
             ELSE ROUND(
                          (recent_30pct_allin::numeric / recent_30pct_game_count::numeric) * 100
                      , 3
                  ) * 20
                      END
                 +
                  CASE WHEN recent_30_60pct_game_count = 0 THEN 0
                       ELSE ROUND(
                                    (recent_30_60_pct_allin::numeric / recent_30_60pct_game_count::numeric) * 100
                                , 3
                            ) * 10
            END
            +
                            CASE WHEN recent_60_90pct_game_count = 0 THEN 0
                                 ELSE ROUND(
                                              (recent_60_90_pct_allin::numeric / recent_60_90pct_game_count::numeric) * 100
                                          , 3
                                      ) * 4
                                          END
                                     +
                                      CASE WHEN recent_90_100pct_game_count = 0 THEN 0
                                           ELSE ROUND(
                                                        (recent_90_100_pct_allin::numeric / recent_90_100pct_game_count::numeric) * 100
                                                    , 3
                                                ) * 1
        END
        ) / 35
      , 1)
        AS opponents_range
FROM wpl_aof_allin
ORDER BY
    CASE situation
        WHEN '2인SB'      THEN 1
        WHEN '2인BB_A'    THEN 2
        WHEN '2인BB_F'    THEN 3
        WHEN '3인D'       THEN 4
        WHEN '3인SB_A'    THEN 5
        WHEN '3인SB_F'    THEN 6
        WHEN '3인BB_AA'   THEN 7
        WHEN '3인BB_AF'   THEN 8
        WHEN '3인BB_FA'   THEN 9
        WHEN '3인BB_FF'   THEN 10
        WHEN '4인1'       THEN 11
        WHEN '4인D_A'     THEN 12
        WHEN '4인D_F'     THEN 13
        WHEN '4인SB_AA'   THEN 14
        WHEN '4인SB_AF'   THEN 15
        WHEN '4인SB_FA'   THEN 16
        WHEN '4인SB_FF'   THEN 17
        WHEN '4인BB_AAA'  THEN 18
        WHEN '4인BB_AAF'  THEN 19
        WHEN '4인BB_AFA'  THEN 20
        WHEN '4인BB_AFF'  THEN 21
        WHEN '4인BB_FAA'  THEN 22
        WHEN '4인BB_FAF'  THEN 23
        WHEN '4인BB_FFA'  THEN 24
        WHEN '4인BB_FFF'  THEN 25
        ELSE 999
        END;
`);
    return result;
  }

  // 상대 ev 업데이트: wpl_aof_situation_opponents_ev -- update by 정환
  @Put("/poker/dashboard/opponets-ev-by-situation")
  async updateOpponentsRange(@Query("key") query: string, @Body() body: any) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 검증
    const situations = [
      "2인SB",
      "2인BB_A",
      "2인BB_F",
      "3인D",
      "3인SB_A",
      "3인SB_F",
      "3인BB_AA",
      "3인BB_AF",
      "3인BB_FA",
      "3인BB_FF",
      "4인1",
      "4인D_A",
      "4인D_F",
      "4인SB_AA",
      "4인SB_AF",
      "4인SB_FA",
      "4인SB_FF",
      "4인BB_AAA",
      "4인BB_AAF",
      "4인BB_AFA",
      "4인BB_AFF",
      "4인BB_FAA",
      "4인BB_FAF",
      "4인BB_FFA",
      "4인BB_FFF",
    ];
    const channels = ["마스터", "프로", "중수"];

    const { situation, opponents_ev, channel } = body;
    if (
      isNil(situation) ||
      isNil(opponents_ev) ||
      isNaN(opponents_ev) ||
      !situations.includes(situation) ||
      !channels.includes(channel)
    ) {
      throw new BadRequestException("잘못된 요청입니다");
    }

    await this.pool.query(sql`
UPDATE wpl_aof_situation_opponents_ev
SET 
    opponents_ev = ${opponents_ev},
    updated_at = now()
WHERE
    situation = ${situation}
    AND channel = ${channel}
`);

    return { result: "success" };
  }

  // 내 레인지 넣기: wpl_aof_situation_hand_range -- update by 정환
  @Put("/poker/dashboard/hand-range")
  async updateHandRange(@Query("key") query: string, @Body() body: any) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 검증
    const situations = [
      "2인SB",
      "2인BB_A",
      "2인BB_F",
      "3인D",
      "3인SB_A",
      "3인SB_F",
      "3인BB_AA",
      "3인BB_AF",
      "3인BB_FA",
      "3인BB_FF",
      "4인1",
      "4인D_A",
      "4인D_F",
      "4인SB_AA",
      "4인SB_AF",
      "4인SB_FA",
      "4인SB_FF",
      "4인BB_AAA",
      "4인BB_AAF",
      "4인BB_AFA",
      "4인BB_AFF",
      "4인BB_FAA",
      "4인BB_FAF",
      "4인BB_FFA",
      "4인BB_FFF",
    ];
    const channels = ["마스터", "프로", "중수"];

    const { situation, range, channel } = body;
    if (!situations.includes(situation) || isNil(range) || !channels.includes(channel)) {
      throw new BadRequestException("잘못된 요청입니다");
    }

    const all_hands = await this.pool.one(sql`
SELECT ARRAY_AGG(hand) AS hand FROM wpl_aof_situation_hand_range
WHERE situation = ${situation} AND channel = ${channel};
`);

    // TODO: 밖으로 빼기
    const isSameContent = (arr1: any, arr2: any) => {
      if (arr1.length !== arr2.length) {
        return false;
      }

      // 배열을 정렬
      const sorted1 = [...arr1].sort();
      const sorted2 = [...arr2].sort();

      // 정렬된 배열을 비교
      for (let i = 0; i < sorted1.length; i++) {
        if (sorted1[i] !== sorted2[i]) {
          return false;
        }
      }

      return true;
    };

    if (
      !isSameContent(
        all_hands.hand,
        range.map((item) => item.hand),
      )
    ) {
      throw new BadRequestException("모든 핸드가 포함되지 않았습니다");
    }

    // update
    const values = range.map((item) => [channel, situation, item.hand, item.ev]);

    await this.pool.query(sql`
     UPDATE wpl_aof_situation_hand_range AS t
      SET
        ev = b.ev::integer
      FROM (
        VALUES
          ${sql.join(
            values.map((item) => sql`(${sql.join(item, sql`,`)})`),
            sql`,`,
          )}
      ) AS b(situation, hand, ev)
      WHERE t.situation = b.situation
        AND t.hand = b.hand
        AND t.channel = b.channel
`);

    return { result: "success" };
  }
}
