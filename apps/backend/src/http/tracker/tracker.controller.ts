import { Controller, Get, UseGuards, Res, Inject } from "@nestjs/common";
import { Response } from "express";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { AuthGuard } from "http/auth/auth.guard";
import pg from "pg";
import { CsvExportService } from "utility/csv-export.service";

@Controller("tracker")
export class TrackerController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    @Inject("PG_POOL") private readonly pgPool: pg.Pool,
    private readonly csvExportService: CsvExportService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("wpl/error-count")
  async wplErrorCount() {
    const result = await this.pool.any(sql`
WITH group_cond AS (
    SELECT
        group_id,
        MAX(
                CASE
                    WHEN position = 'BB' THEN
                        (CASE WHEN action = 'A' THEN 1 ELSE 0 END) +
                        (length(previous_action) - length(replace(previous_action, 'A', '')))
                    END
        ) AS n_bb,
        MIN(result) AS min_result
    FROM wpl_aof_record
    GROUP BY group_id
)
SELECT COUNT(*) AS total_count
FROM wpl_aof_record w
         LEFT JOIN group_cond g ON w.group_id = g.group_id
WHERE
    (
        -- 조건 1: 개별 행 기준 세부 조건들
        (action = 'A' AND (position = '1' OR position = 'D') AND result = 0)
            OR (action = 'A' AND position = 'SB' AND result = -0.5)
            OR (action = 'A' AND position = 'BB' AND result = -1)
        )
   OR (result < -10)  -- 조건 2: result가 -10 미만
   OR (
    -- 조건 3: 그룹 기준 (동일 group_id 내에서)
    g.n_bb IS NOT NULL
        AND g.n_bb >= 2
        AND g.min_result > 12 * (g.n_bb - 1)
    )
   OR (
    -- 조건 4: position이 'BB'이고, previous_action이 'F' 또는 'FF' 또는 'FFF'이며, action이 'A' 또는 'F'
    position = 'BB'
        AND previous_action IN ('F', 'FF', 'FFF')
        AND action IN ('A', 'F')
    )
   OR (
    -- 조건 5: position이 'BB'이고, previous_action에 'A'가 포함되어 있는데 action이 빈 텍스트 또는 NULL
    position = 'BB'
        AND previous_action LIKE '%A%'
        AND (action = '' OR action IS NULL)
    );
`);
    return result[0].total_count;
  }

  @UseGuards(AuthGuard)
  @Get("wpl/error-detail")
  async wplErrorDetail(@Res() res: Response) {
    const ids: any = await this.pool.any(sql`
WITH group_cond AS (
    SELECT
        group_id,
        MAX(
                CASE
                    WHEN position = 'BB' THEN
                        (CASE WHEN action = 'A' THEN 1 ELSE 0 END) +
                        (length(previous_action) - length(replace(previous_action, 'A', '')))
                    END
        ) AS n_bb,
        MIN(result) AS min_result
    FROM wpl_aof_record
    GROUP BY group_id
)
SELECT array_agg(w.group_id) AS group_ids
FROM wpl_aof_record w
         LEFT JOIN group_cond g ON w.group_id = g.group_id
WHERE
w.channel = '마스터' AND
    (
        -- 조건 1: 개별 행 기준 세부 조건들
        (action = 'A' AND (position = '1' OR position = 'D') AND result = 0)
            OR (action = 'A' AND position = 'SB' AND result = -0.5)
            OR (action = 'A' AND position = 'BB' AND result = -1)
        )
   OR (result < -10)  -- 조건 2: result가 -10 미만
   OR (
    -- 조건 3: 그룹 기준 (동일 group_id 내에서)
    g.n_bb IS NOT NULL
        AND g.n_bb >= 2
        AND g.min_result > 12 * (g.n_bb - 1)
    )
   OR (
    -- 조건 4: position이 'BB'이고, previous_action이 'F' 또는 'FF' 또는 'FFF'이며, action이 'A' 또는 'F'
    position = 'BB'
        AND previous_action IN ('F', 'FF', 'FFF')
        AND action IN ('A', 'F')
    )
   OR (
    -- 조건 5: position이 'BB'이고, previous_action에 'A'가 포함되어 있는데 action이 빈 텍스트 또는 NULL
    position = 'BB'
        AND previous_action LIKE '%A%'
        AND (action = '' OR action IS NULL)
    );
`);
    const stringified_group_ids = "(" + ids[0].group_ids.join(", ") + ")";

    const client = await this.pgPool.connect();
    const sql_query = `SELECT * FROM wpl_aof_record WHERE group_id IN ${stringified_group_ids}`;

    await this.csvExportService.streamQueryToCsv(
      res,
      client,
      sql_query,
      "WPL_AOF_ERROR_RECORD.csv",
    );
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker/error-count")
  async hangamePokerErrorCount() {
    const result = await this.pool.any(sql`
SELECT
    COUNT(*) AS total_count
FROM hangame_poker_ev
WHERE
    earlyraise != 99
AND (
    -- 내 핸드가 AA일때 -ev
    (room = '20억' AND myhand = 'AA' AND ev < 0)
        OR
        -- 포지션 0 존재
    (room = '20억' AND position NOT IN ('1', '2', '3', '4', '5', '6', 'SB', 'BB', 'D', 'BB/Check', 'BB/max', 'BB/Fold'))
        OR
        -- 인원수 3이하
    (room = '20억' AND participant <= 3 AND created_at > '2024-12-31 15:00:00.000000 +00:00')
        OR
        -- result가 -350보다 작은 경우
    (room = '20억' AND result < -350)
        OR
        -- result가 [인원수 -1] * 350 보다 큰 경우
    (room = '20억' AND totalmax != 0 AND result > totalmax * 350 + 20 * participant)
        OR
        -- 내 액션 F
    (room = '20억(안봤다)' AND action = 'F')
        OR
        -- 총맥스 3 이하
    (room = '20억(안봤다)' AND totalmax <= 3)
        OR
        -- 내 핸드 존재 ( . 이 아닌 경우)
    (room = '20억(안봤다)' AND myhand != '.')
    )
`);

    return result[0].total_count;
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker/error-detail")
  async hangamePokerErrorDetail(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
SELECT
    id,
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
WHERE
   earlyraise != 99
AND (
    -- 내 핸드가 AA일때 -ev
    (room = '20억' AND myhand = 'AA' AND ev < 0)
        OR
        -- 포지션 0 존재
    (room = '20억' AND position NOT IN ('1', '2', '3', '4', '5', '6', 'SB', 'BB', 'D', 'BB/Check', 'BB/max', 'BB/Fold'))
        OR
        -- 인원수 3이하
    (room = '20억' AND participant <= 3 AND created_at > '2024-12-31 15:00:00.000000 +00:00')
        OR
        -- result가 -350보다 작은 경우
    (room = '20억' AND result < -350)
        OR
        -- result가 [인원수 -1] * 350 보다 큰 경우
    (room = '20억' AND totalmax != 0 AND result > totalmax * 350 + 20 * participant)
        OR
        -- 내 액션 F
    (room = '20억(안봤다)' AND action = 'F')
        OR
        -- 총맥스 3 이하
    (room = '20억(안봤다)' AND totalmax <= 3)
        OR
        -- 내 핸드 존재 ( . 이 아닌 경우)
    (room = '20억(안봤다)' AND myhand != '.')
    )
ORDER BY id DESC;
    `;

    await this.csvExportService.streamQueryToCsv(
      res,
      client,
      sql,
      "HANGAME_POKER_ERROR_RECORD.csv",
    );
  }

  @UseGuards(AuthGuard)
  @Get("hangame-seotda/error-count")
  async getHangameSeotdaDataErrorCount() {
    const result = await this.pool.one(sql`
SELECT COUNT(*) AS count FROM hangame_seotda_game_info WHERE inspection_passed = false
`);

    return result.count;
  }

  @UseGuards(AuthGuard)
  @Get("hangame-seotda/error-detail")
  async hangameSeotdaErrorDetail(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
WITH
-- (1) 배팅 페이즈별 플레이어 카드
player_hand_per_phase AS (
    SELECT
        ga.game_id,
        ga.position,
        ga.betting_phase,
        MIN(ga.hand) AS phase_hand
    FROM hangame_seotda_game_action ga
    WHERE ga.betting_phase IN ('morning', 'dinner')
    GROUP BY ga.game_id, ga.position, ga.betting_phase
),

-- (2) 액션 + "전체 앞 액션" (prior_actions) 배열
actions_with_prefix AS (
    SELECT
        a.game_id,
        g.participant_count,
        a.betting_phase,
        a.sequence          AS current_seq,
        a.position          AS current_position,
        a.is_me,
        a.action            AS current_action,

        -- 추가: hand_rank, game_result
        a.hand_rank,
        a.game_result,
        g.error_detail,

        (
            SELECT array_agg(a2.action ORDER BY a2.sequence)
            FROM hangame_seotda_game_action a2
            WHERE a2.game_id       = a.game_id
              AND a2.betting_phase = a.betting_phase
              AND a2.sequence      < a.sequence
        ) AS prior_actions
    FROM hangame_seotda_game_action a
             JOIN hangame_seotda_game_info g
                  ON g.id = a.game_id AND g.inspection_passed = false
    WHERE a.betting_phase IN ('morning', 'dinner')
)

SELECT
    awp.game_id,
    awp.participant_count,
    awp.betting_phase,
    awp.current_seq,
    awp.current_position,
    awp.is_me,
    ph.phase_hand AS player_phase_hand,
    awp.current_action,

    -- 최종 SELECT에 hand_rank, game_result 추가
    awp.hand_rank,
    awp.game_result,
    awp.error_detail,

    array_to_string(awp.prior_actions, ',') AS front_actions
FROM actions_with_prefix awp
         JOIN player_hand_per_phase ph
              ON ph.game_id       = awp.game_id
                  AND ph.position      = awp.current_position
                  AND ph.betting_phase = awp.betting_phase
ORDER BY
    awp.game_id,
    CASE awp.betting_phase
        WHEN 'morning' THEN 1
        WHEN 'dinner' THEN 2
        ELSE 3
        END,
    awp.current_seq;
    `;

    await this.csvExportService.streamQueryToCsv(
      res,
      client,
      sql,
      "HANGAME_SEOTDA_ERROR_RECORD.csv",
    );
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker-new/error-count")
  async getHangamePokerNewDataErrorCount() {
    const result = await this.pool.one(sql`
SELECT COUNT(*) AS count FROM hangame_poker_game_info WHERE inspection_passed = false
`);

    return result.count;
  }

  @UseGuards(AuthGuard)
  @Get("hangame-poker-new/error-detail")
  async hangamePokerNewErrorDetail(@Res() res: Response) {
    const client = await this.pgPool.connect();
    const sql = `
WITH
-- (1) 배팅 페이즈별 플레이어 카드
player_hand_per_phase AS (
    SELECT
        ga.game_id,
        ga.position,
        ga.betting_phase,
        MIN(ga.hand) AS phase_hand
    FROM hangame_poker_game_action ga
    WHERE ga.betting_phase IN ('preflop', 'flop', 'turn', 'river')
    GROUP BY ga.game_id, ga.position, ga.betting_phase
),

-- (2) 액션 + "전체 앞 액션" (prior_actions) 배열
actions_with_prefix AS (
    SELECT
        a.game_id,
        g.participant_count,
        a.betting_phase,
        a.sequence          AS current_seq,
        a.position          AS current_position,
        a.is_me,
        a.action            AS current_action,

        -- 추가: hand_rank, game_result
        a.hand_rank,
        a.game_result,

        (
            SELECT array_agg(a2.action ORDER BY a2.sequence)
            FROM hangame_poker_game_action a2
            WHERE a2.game_id       = a.game_id
              AND a2.betting_phase = a.betting_phase
              AND a2.sequence      < a.sequence
        ) AS prior_actions
    FROM hangame_poker_game_action a
             JOIN hangame_poker_game_info g
                  ON g.id = a.game_id
    WHERE a.betting_phase IN ('preflop', 'flop', 'turn', 'river')
)

SELECT
    awp.game_id,
    awp.participant_count,
    awp.betting_phase,
    awp.current_seq,
    awp.current_position,
    awp.is_me,
    ph.phase_hand AS player_phase_hand,
    awp.current_action,

    -- 최종 SELECT에 hand_rank, game_result 추가
    awp.hand_rank,
    awp.game_result,

    array_to_string(awp.prior_actions, ',') AS front_actions
FROM actions_with_prefix awp
         JOIN player_hand_per_phase ph
              ON ph.game_id       = awp.game_id
                  AND ph.position      = awp.current_position
                  AND ph.betting_phase = awp.betting_phase
ORDER BY
    awp.game_id,
    CASE awp.betting_phase
        WHEN 'preflop' THEN 1
        WHEN 'flop' THEN 2
        WHEN 'turn' THEN 3
        WHEN 'river' THEN 4
        ELSE 5
        END,
    awp.current_seq;
    `;

    await this.csvExportService.streamQueryToCsv(
      res,
      client,
      sql,
      "HANGAME_POKER_NEW_ERROR_RECORD.csv",
    );
  }
}
