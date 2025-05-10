import {
  Controller,
  Post,
  Body,
  Query,
  BadRequestException,
  UnauthorizedException,
  Put,
} from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";
import { HangamePokerNewService } from "./hangame-poker-new.service";

@Controller("hangame-poker")
export class HangamePokerNewController {
  constructor(
    @InjectPool() private readonly pool: DatabasePool,
    private readonly hangamePokerNewService: HangamePokerNewService,
  ) {}

  @Post("/record")
  async createHangamePoker(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // 필수 key 체크
    const key_of_body = Object.keys(body);
    const required_key = [
      "computer",
      "channel",
      "participant_count",
      "game_result",
      "my_result",
      "flop_card",
      "turn_card",
      "river_card",
      "my_position",
    ];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    const game_info = await this.pool.query(sql`
INSERT INTO hangame_poker_game_info
(
  computer,
  channel,
  participant_count,
  game_result,
  my_result,
  flop_card,
  turn_card,
  river_card,
  my_position
)
VALUES
(
  ${body.computer},
  ${body.channel},
  ${body.participant_count},
  ${body.game_result},
  ${body.my_result},
  ${body.flop_card},
  ${body.turn_card},
  ${body.river_card},
  ${body.my_position}
)
RETURNING id
`);
    return game_info.rows[0];
  }

  @Put("/record")
  async updateHangamePoker(@Body() body: any, @Query("key") query: string) {
    if (query !== process.env.DATA_AUTH_KEY) {
      throw new UnauthorizedException();
    }

    // ... (필수 KEY 체크 etc.)
    const key_of_body = Object.keys(body);
    const required_key = ["game_id", "preflop", "flop", "turn", "river"];

    const required_key_check = required_key.every((item) => key_of_body.includes(item));

    if (!required_key_check) {
      throw new BadRequestException("필수 KEY가 오지 않았습니다");
    }

    await this.pool.transaction(async (t) => {
      const game_info = await t.any(sql`
SELECT * FROM hangame_poker_game_info WHERE id = ${body.game_id}
`);

      if (game_info.length !== 1) {
        throw new BadRequestException("존재하지 않는 게임 ID입니다");
      }

      const { participant_count, channel, my_position } = game_info[0];

      const {
        preflop: updatedPreflop,
        flop: updatedFlop,
        turn: updatedTurn,
        river: updatedRiver,
      } = this.hangamePokerNewService.updatePotBeforeAndActionAmount(
        body.preflop,
        body.flop,
        body.turn,
        body.river,
        participant_count as number,
        channel as number,
        my_position as string,
      );

      // preflop
      for (const pf of updatedPreflop) {
        await t.query(sql`
INSERT INTO hangame_poker_game_action
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
  action_amount
) 
VALUES
(
  ${body.game_id},
  'preflop',
  ${pf.sequence},
  ${pf.position},
  ${pf.position === my_position},
  ${pf.action},
  ${pf.hand},
  ${pf.hand_rank ?? null},
  ${pf.game_result ?? null},
  ${pf.starting_balance},
  ${pf.pot_before as number},
  ${pf.action_amount as number}
)
`);
      }

      // flop
      for (const f of updatedFlop) {
        await t.query(sql`
INSERT INTO hangame_poker_game_action
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
  action_amount
) 
VALUES
(
  ${body.game_id},
  'flop',
  ${f.sequence},
  ${f.position},
  ${f.position === my_position},
  ${f.action},
  ${f.hand},
  ${f.hand_rank ?? null},
  ${f.game_result ?? null},
  ${f.starting_balance},
  ${f.pot_before as number},
  ${f.action_amount as number}
)
`);
      }

      // turn
      for (const turn of updatedTurn) {
        await t.query(sql`
INSERT INTO hangame_poker_game_action
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
  action_amount
) 
VALUES
(
  ${body.game_id},
  'turn',
  ${turn.sequence},
  ${turn.position},
  ${turn.position === my_position},
  ${turn.action},
  ${turn.hand},
  ${turn.hand_rank ?? null},
  ${turn.game_result ?? null},
  ${turn.starting_balance},
  ${turn.pot_before as number},
  ${turn.action_amount as number}
)
`);
      }

      // river
      for (const r of updatedRiver) {
        await t.query(sql`
INSERT INTO hangame_poker_game_action
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
  action_amount
) 
VALUES
(
  ${body.game_id},
  'river',
  ${r.sequence},
  ${r.position},
  ${r.position === my_position},
  ${r.action},
  ${r.hand},
  ${r.hand_rank ?? null},
  ${r.game_result ?? null},
  ${r.starting_balance},
  ${r.pot_before as number},
  ${r.action_amount as number}
)
`);
      }
    });

    return { result: "success" };
  }
}
