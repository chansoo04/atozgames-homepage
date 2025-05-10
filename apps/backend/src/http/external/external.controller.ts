import { Controller, Get } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { HangameSeotdaNewService } from "../hangame/hangame-seotda-new.service";
import { HangamePokerNewService } from "../hangame/hangame-poker-new.service";

@Controller("external")
export class ExternalController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    private readonly hangameSeotdaNewService: HangameSeotdaNewService,
    private readonly hangamePokerNewService: HangamePokerNewService,
  ) {}

  @Get("/cron/refresh-hangame_poker_structured_replay_record")
  async refreshHangamePokerStructuredReplayRecord() {
    await this.pool.query(sql`REFRESH MATERIALIZED VIEW hangame_poker_structured_replay_record;`);
    await this.pool.query(sql`ANALYZE hangame_poker_structured_replay_record;`);
    return { result: "success" };
  }

  @Get("/cron/refresh_hangame_daily_summary")
  async refreshHangamePokerDailySummary() {
    await this.pool.query(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY hangame_poker_daily_summary;`);
    await this.pool.query(sql`ANALYZE hangame_poker_daily_summary`);
    await this.pool.query(
      sql`REFRESH MATERIALIZED VIEW CONCURRENTLY hangame_seotda_daily_summary;`,
    );
    await this.pool.query(sql`ANALYZE hangame_seotda_daily_summary`);
    return { result: "success" };
  }

  @Get("/cron/hangame-seotda/db-renewal")
  async renewalSeotda() {
    await this.pool.query(sql`
        UPDATE hangame_seotda_game_action
        SET
        cost_to_call = null,
        cost_to_bbing = null,
        cost_to_check = null,
        cost_to_ddadang = null,
        cost_to_half = null,
        cost_to_quarter = null,
        cost_to_max = null,
        cost_to_allin = null,
        pot_odds = null,
        stack_size = null,
        stack_size_over_pot = null,
        raise_count_so_far = null,
        call_count_so_far = null,
        check_count_so_far = null,
        fold_count_so_far = null,
        behind_player_count = null,
        behind_player_count_if_raise = null
        `);

    const rows = await this.pool.any(sql`
        SELECT * FROM hangame_seotda_game_info
        ORDER BY id ASC
        `);
    for (const row of rows) {
      const { participant_count, channel, my_position, id, draw_relevant_id } = row;
      console.log("ID: ", id);

      await this.pool.transaction(async (t) => {
        const mornings = await t.any(sql`
        SELECT * FROM hangame_seotda_game_action
        WHERE game_id = ${id}
        AND betting_phase = 'morning'
        ORDER BY sequence ASC
        `);
        const dinners = await t.any(sql`
        SELECT * FROM hangame_seotda_game_action
        WHERE game_id = ${id}
        AND betting_phase = 'dinner'
        ORDER BY sequence ASC
        `);

        const {
          morning_participant_count,
          morning_survival_count,
          dinner_participant_count,
          dinner_survival_count,
        } = this.hangameSeotdaNewService.getParticipantAndSurvivalCount(
          mornings as any,
          dinners as any,
          row.participant_count as number,
        );

        await t.query(sql`
    UPDATE hangame_seotda_game_info
    SET
    morning_participant_count = ${morning_participant_count},
    morning_survival_count = ${morning_survival_count},
    dinner_participant_count = ${dinner_participant_count},
    dinner_survival_count = ${dinner_survival_count}
    WHERE id = ${id}
    `);
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

        const { morning: updatedMorning, dinner: updatedDinner } =
          this.hangameSeotdaNewService.updatePotBeforeAndActionAmount(
            mornings as any,
            dinners as any,
            participant_count as number,
            channel as number,
            my_position as number,
            startingPot as number,
          );

        for (const m of updatedMorning) {
          await t
            .query(
              sql`
        UPDATE hangame_seotda_game_action
        SET
        pot_before = ${m.pot_before ?? null},
        action_amount = ${m.action_amount ?? null},
        net_action_amount = ${m.net_action_amount ?? null},
        cost_to_call = ${m.cost_to_call ?? null},
        cost_to_bbing = ${m.cost_to_bbing ?? null},
        cost_to_ddadang = ${m.cost_to_ddadang ?? null},
        cost_to_half = ${m.cost_to_half ?? null},
        cost_to_quarter = ${m.cost_to_quarter ?? null},
        cost_to_max = ${m.cost_to_max ?? null},
        cost_to_allin = ${m.cost_to_allin ?? null},
        cost_to_check = ${m.cost_to_check ?? null},
        pot_odds = ${m.pot_odds ?? null},
        stack_size = ${m.stack_size ?? null},
        stack_size_over_pot = ${m.stack_size_over_pot ?? null},
        raise_count_so_far = ${m.raise_count_so_far ?? null},
        call_count_so_far = ${m.call_count_so_far ?? null},
        check_count_so_far = ${m.check_count_so_far ?? null},
        fold_count_so_far = ${m.fold_count_so_far ?? null},
        behind_player_count = ${m.behind_player_count ?? null},
        behind_player_count_if_raise = ${m.behind_player_count_if_raise ?? null},
        betting_amount_before_action = ${m.betting_amount_before_action ?? null}
        WHERE game_id = ${id} AND betting_phase = 'morning' AND sequence = ${m.sequence}
        `,
            )
            .catch((e) => console.error(id));
        }

        for (const d of updatedDinner) {
          await t
            .query(
              sql`
        UPDATE hangame_seotda_game_action
        SET
        pot_before = ${d.pot_before ?? null},
        action_amount = ${d.action_amount ?? null},
        net_action_amount = ${d.net_action_amount ?? null},
        cost_to_call = ${d.cost_to_call ?? null},
        cost_to_bbing = ${d.cost_to_bbing ?? null},
        cost_to_ddadang = ${d.cost_to_ddadang ?? null},
        cost_to_half = ${d.cost_to_half ?? null},
        cost_to_quarter = ${d.cost_to_quarter ?? null},
        cost_to_max = ${d.cost_to_max ?? null},
        cost_to_allin = ${d.cost_to_allin ?? null},
        cost_to_check = ${d.cost_to_check ?? null},
        pot_odds = ${d.pot_odds ?? null},
        stack_size = ${d.stack_size ?? null},
        stack_size_over_pot = ${d.stack_size_over_pot ?? null},
        raise_count_so_far = ${d.raise_count_so_far ?? null},
        call_count_so_far = ${d.call_count_so_far ?? null},
        check_count_so_far = ${d.check_count_so_far ?? null},
        fold_count_so_far = ${d.fold_count_so_far ?? null},
        behind_player_count = ${d.behind_player_count ?? null},
        behind_player_count_if_raise = ${d.behind_player_count_if_raise ?? null},
        betting_amount_before_action = ${d.betting_amount_before_action ?? null}
        WHERE game_id = ${id} AND betting_phase = 'dinner' AND sequence = ${d.sequence}
        `,
            )
            .catch((e) => console.error(id));
        }
      });
    }

    return { result: "success" };
  }

  @Get("/cron/hangame-seotda-inspection")
  async inspectHangameSeotda() {
    await this.hangameSeotdaNewService.inspectUnverifiedGames();

    return { result: "success" };
  }

  @Get("/cron/hangame-poker-inspection")
  async inspectHangamePoker() {
    await this.hangamePokerNewService.inspectUnverifiedGames();
    return { result: "success" };
  }
}
