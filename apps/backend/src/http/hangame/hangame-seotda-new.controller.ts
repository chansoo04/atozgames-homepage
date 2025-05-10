import {
  Controller,
  Post,
  Body,
  Query,
  BadRequestException,
  UnauthorizedException,
  Put,
  Get,
  UseGuards,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { HangameSeotdaNewService } from "./hangame-seotda-new.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("hangame-seotda")
export class HangameSeotdaNewController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    private readonly hangameSeotdaNewService: HangameSeotdaNewService,
  ) {}

  @Post("/record")
  async createHangameSeotda(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // ... (필수 KEY 체크 etc.)
    const key_of_body = Object.keys(body);
    const required_key = [
      "computer",
      "channel",
      "participant_count",
      "game_result",
      "my_result",
      "my_position",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    // 2) DB 기록
    return await this.pool.transaction(async (t) => {
      const game_info = await t.query(sql`
        INSERT INTO hangame_seotda_game_info
        (
          computer,
          channel,
          participant_count,
          game_result,
          my_result,
          my_position,
          draw_relevant_id
        )
        VALUES
        (
          ${body.computer},
          ${body.channel},
          ${body.participant_count},
          ${body.game_result},
          ${body.my_result},
          ${body.my_position},
          ${body.draw_relevant_id ?? null}
        )
        RETURNING id
      `);

      return game_info.rows[0];
    });
  }

  @Put("/record")
  async updateHangameSeotda(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // ... (필수 KEY 체크 etc.)
    const key_of_body = Object.keys(body);
    const required_key = ["game_id", "morning", "dinner"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    await this.pool.transaction(async (t) => {
      const game_info = await t.any(sql`
SELECT * FROM hangame_seotda_game_info WHERE id = ${body.game_id}
`);

      if (game_info.length !== 1) {
        throw new BadRequestException("존재하지 않는 게임 ID입니다");
      }

      const { participant_count, channel, my_position, draw_relevant_id } = game_info[0];

      // 0) morning_participant_count, morning_survival_count
      //    dinner_participant_count, dinner_survival_count 계산
      const {
        morning_participant_count,
        morning_survival_count,
        dinner_participant_count,
        dinner_survival_count,
      } = this.hangameSeotdaNewService.getParticipantAndSurvivalCount(
        body.morning,
        body.dinner,
        participant_count as number,
      );

      await t.query(sql`
UPDATE hangame_seotda_game_info
SET 
morning_participant_count = ${morning_participant_count},
morning_survival_count = ${morning_survival_count},
dinner_participant_count = ${dinner_participant_count},
dinner_survival_count = ${dinner_survival_count}
WHERE id = ${body.game_id}
`);

      // 무승부 startingPot 처리
      let startingPot = 0;
      if (draw_relevant_id !== null) {
        const pastGame = await this.pool.one(sql`
SELECT * FROM hangame_seotda_game_action
WHERE game_id = ${draw_relevant_id}
AND betting_phase = 'dinner'
ORDER BY sequence DESC
LIMIT 1
`);
        startingPot = (pastGame.pot_before as number) + (pastGame.action_amount as number);
      }

      // 1) pot_before/action_amount 계산
      const {
        morning: updatedMorning,
        dinner: updatedDinner,
        finalPotMorning,
        finalPotDinner,
      } = this.hangameSeotdaNewService.updatePotBeforeAndActionAmount(
        body.morning,
        body.dinner,
        participant_count as number,
        channel as number,
        my_position as number,
        startingPot as number,
      );

      // morning
      for (const m of updatedMorning) {
        await t.query(sql`
          INSERT INTO hangame_seotda_game_action
          (
            game_id,
            betting_phase,
            sequence,
            position,
            is_me,
            action,
            hand,
            hand_rank,
            game_result,
            starting_balance,
            pot_before,
            action_amount,
            net_action_amount,
            cost_to_call,
            cost_to_bbing,
            cost_to_ddadang,
            cost_to_half,
            cost_to_quarter,
            cost_to_max,
            cost_to_allin,
            cost_to_check,
            pot_odds,
            stack_size,
            stack_size_over_pot,
            raise_count_so_far,
            call_count_so_far,
            check_count_so_far,
            fold_count_so_far,
            behind_player_count,
            behind_player_count_if_raise,
            betting_amount_before_action
          )
          VALUES
          (
            ${body.game_id},
            'morning',
            ${m.sequence},
            ${m.position},
            ${m.position === my_position},
            ${m.action},
            ${m.hand},
            ${m.hand_rank ?? null},
            ${m.game_result ?? null},
            ${m.starting_balance},
            ${m.pot_before as number},
            ${m.action_amount as number},
            ${m.net_action_amount as number},
            ${m.cost_to_call ?? null},
            ${m.cost_to_bbing ?? null},
            ${m.cost_to_ddadang ?? null},
            ${m.cost_to_half ?? null},
            ${m.cost_to_quarter ?? null},
            ${m.cost_to_max ?? null},
            ${m.cost_to_allin ?? null},
            ${m.cost_to_check ?? null},
            ${m.pot_odds ?? null},
            ${m.stack_size ?? null},
            ${m.stack_size_over_pot ?? null},
            ${m.raise_count_so_far ?? null},
            ${m.call_count_so_far ?? null},
            ${m.check_count_so_far ?? null},
            ${m.fold_count_so_far ?? null},
            ${m.behind_player_count ?? null},
            ${m.behind_player_count_if_raise ?? null},
            ${m.betting_amount_before_action ?? null}
          )
        `);
      }

      // dinner
      for (const d of updatedDinner) {
        await t.query(sql`
          INSERT INTO hangame_seotda_game_action
          (
            game_id,
            betting_phase,
            sequence,
            position,
            is_me,
            action,
            hand,
            hand_rank,
            game_result,
            starting_balance,
            pot_before,
            action_amount,
            net_action_amount,
            cost_to_call,
            cost_to_bbing,
            cost_to_ddadang,
            cost_to_half,
            cost_to_quarter,
            cost_to_max,
            cost_to_allin,
            cost_to_check,
            pot_odds,
            stack_size,
            stack_size_over_pot,
            raise_count_so_far,
            call_count_so_far,
            check_count_so_far,
            fold_count_so_far,
            behind_player_count,
            behind_player_count_if_raise,
            betting_amount_before_action
          )
          VALUES
          (
            ${body.game_id},
            'dinner',
            ${d.sequence},
            ${d.position},
            ${d.position === my_position},
            ${d.action},
            ${d.hand},
            ${d.hand_rank ?? null},
            ${d.game_result ?? null},
            ${d.starting_balance},
            ${d.pot_before as number},
            ${d.action_amount as number},
            ${d.net_action_amount as number},
            ${d.cost_to_call ?? null},
            ${d.cost_to_bbing ?? null},
            ${d.cost_to_ddadang ?? null},
            ${d.cost_to_half ?? null},
            ${d.cost_to_quarter ?? null},
            ${d.cost_to_max ?? null},
            ${d.cost_to_allin ?? null},
            ${d.cost_to_check ?? null},
            ${d.pot_odds ?? null},
            ${d.stack_size ?? null},
            ${d.stack_size_over_pot ?? null},
            ${d.raise_count_so_far ?? null},
            ${d.call_count_so_far ?? null},
            ${d.check_count_so_far ?? null},
            ${d.fold_count_so_far ?? null},
            ${d.behind_player_count ?? null},
            ${d.behind_player_count_if_raise ?? null},
            ${d.betting_amount_before_action ?? null}
          )
        `);
      }
    });

    return { result: "success" };
  }
}

/*

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

        (
            SELECT array_agg(a2.action ORDER BY a2.sequence)
            FROM hangame_seotda_game_action a2
            WHERE a2.game_id       = a.game_id
              AND a2.betting_phase = a.betting_phase
              AND a2.sequence      < a.sequence
        ) AS prior_actions
    FROM hangame_seotda_game_action a
             JOIN hangame_seotda_game_info g
                  ON g.id = a.game_id
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

* */
