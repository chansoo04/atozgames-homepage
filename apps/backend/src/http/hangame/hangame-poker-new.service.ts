import { Injectable } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

// 액션 구조 정의
type PokerAction = {
  betting_phase: string;
  sequence: number;
  position: string;
  action: string; // D, B, T, G, C, Q, H, A, M
  hand: string;
  hand_rank: string | null;
  game_result: string | null;
  starting_balance: number; // 100만 단위
  pot_before?: number; // 계산 후 세팅
  action_amount?: number; // 계산 후 세팅
};

@Injectable()
export class HangamePokerNewService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  public updatePotBeforeAndActionAmount(
    preflopActions: PokerAction[],
    flopActions: PokerAction[],
    turnActions: PokerAction[],
    riverActions: PokerAction[],
    participantCount: number,
    channel: number,
    my_position: string,
  ): {
    preflop: PokerAction[];
    flop: PokerAction[];
    turn: PokerAction[];
    river: PokerAction[];
  } {
    // 1) preflop 계산
    const {
      updatedActions: updatedPreflop,
      finalPot: finalPotPreflop,
      diedPositions: diedPositionsPreflop,
      accContributedByPos: preflopAccContributedByPos,
    } = this.calcPhaseActions(preflopActions, participantCount, channel, true);

    // 2) flop에서는 diedPositions에 포함된 플레이어 제외
    const filteredFlop = flopActions.filter((d) => !diedPositionsPreflop.has(d.position));

    // 3) flop 계산: 첫 액션 pot_before = preFlop final Pot
    const {
      updatedActions: updatedFlop,
      finalPot: finalPotFlop,
      diedPositions: diedPositionsFlop,
      accContributedByPos: flopAccContributedByPos,
    } = this.calcPhaseActions(
      filteredFlop,
      participantCount,
      channel,
      false,
      finalPotPreflop,
      preflopAccContributedByPos,
    );

    // 4) turn에서는 diedPositions에 포함된 플레이어 제외
    const filteredTurn = turnActions.filter(
      (d) => !diedPositionsFlop.has(d.position) && !diedPositionsPreflop.has(d.position),
    );

    // 5) turn 계산: 첫 액션 pot_before = flop final Pot
    const {
      updatedActions: updatedTurn,
      finalPot: finalPotTurn,
      diedPositions: diedPositionsTurn,
      accContributedByPos: turnAccContributedByPos,
    } = this.calcPhaseActions(
      filteredTurn,
      participantCount,
      channel,
      false,
      finalPotFlop,
      flopAccContributedByPos,
    );

    // 6) river에서는 diedPositions에서 포함된 플레이어 제외
    const filteredRiver = riverActions.filter(
      (d) =>
        !diedPositionsFlop.has(d.position) &&
        !diedPositionsPreflop.has(d.position) &&
        !diedPositionsTurn.has(d.position),
    );

    // 7) river 계산: 첫 액션 Pot_before = turn final pot
    const { updatedActions: updatedRiver } = this.calcPhaseActions(
      filteredRiver,
      participantCount,
      channel,
      false,
      finalPotTurn,
      turnAccContributedByPos,
    );

    return {
      preflop: updatedPreflop,
      flop: updatedFlop,
      turn: updatedTurn,
      river: updatedRiver,
    };
  }

  private calcPhaseActions(
    actions: PokerAction[],
    participantCount: number,
    channel: number,
    isPreflop: boolean,
    initPot: number = 0,
    accContributedByPos: Record<string, number> = {},
  ): {
    updatedActions: PokerAction[];
    finalPot: number;
    diedPositions: Set<string>;
    accContributedByPos: Record<string, number>;
  } {
    if (!actions || actions.length === 0) {
      return {
        updatedActions: [],
        finalPot: initPot,
        diedPositions: new Set(),
        accContributedByPos,
      };
    }

    // sequence 오름차순 정렬
    actions.sort((a, b) => a.sequence - b.sequence);

    // 누가 다이했는지 추적
    const diedPositions = new Set<string>();

    // 각 position이 이 페이즈에서 이미 낸 총액
    const contributedByPos: Record<string, number> = {};
    // 최대 베팅(레이즈를 포함)이 얼마나 쌓였는지
    let highestBet = 0;
    if (isPreflop) {
      highestBet = channel * 2;
    }

    // preflop이라면 position별 낸 총 금액 셋팅
    if (isPreflop) {
      for (const act of actions) {
        if (act.position === "SB") {
          accContributedByPos[act.position] = channel * 3;
        } else if (act.position === "BB") {
          accContributedByPos[act.position] = channel * 2;
        } else {
          accContributedByPos[act.position] = channel;
        }
      }
    }

    // 초기화
    for (const act of actions) {
      if (isPreflop && ["SB", "BB"].includes(act.position)) {
        if (act.position === "SB") {
          contributedByPos[act.position] = channel * 1;
        } else if (act.position === "BB") {
          contributedByPos[act.position] = channel * 2;
        }
      } else {
        contributedByPos[act.position] = 0;
      }
    }

    for (let i = 0; i < actions.length; i++) {
      const act = actions[i];
      const pos = act.position;

      // 이미 다이한 position이면 그냥 action_amount=0, pot_before=iniPot 등
      if (diedPositions.has(pos)) {
        act.pot_before =
          i === 0 ? initPot : actions[i - 1].pot_before! + (actions[i - 1].action_amount || 0);
        act.action_amount = 0;
        continue;
      }

      // 1) pot_before 계산
      if (i === 0) {
        if (isPreflop) {
          // preflop: sequence=1 =>
          act.pot_before = channel * participantCount + channel * 3;
        } else {
          // not preflop: sequence=1
          act.pot_before = initPot;
        }
      } else {
        // i > 0
        const prev = actions[i - 1];
        act.pot_before = (prev.pot_before || 0) + (prev.action_amount || 0);
      }

      // 2) callAmount = highestBet - 내가 이미 낸 금액
      let callAmount =
        highestBet - contributedByPos[pos] + accContributedByPos[pos] > 35000
          ? 35000 - accContributedByPos[pos]
          : highestBet - contributedByPos[pos];
      if (callAmount < 0) callAmount = 0;

      // 3) action_amount 계산
      const amt = this.calculateActionAmount(
        act.action,
        act.starting_balance,
        act.pot_before,
        callAmount,
        channel,
        accContributedByPos[pos],
      );
      act.action_amount = amt;

      // 4) 다이(D)라면 diedPosition에 추가
      if (act.action === "D") {
        diedPositions.add(pos);
      } else {
        // contributedByPos 갱신
        contributedByPos[pos] += amt;
        accContributedByPos[pos] += amt;

        // highestBet 갱신
        if (contributedByPos[pos] > highestBet) {
          highestBet = contributedByPos[pos];
        }
      }
    }

    // 이 페이즈 끝난 뒤 최종 pot = "마지막 액션 pot_before + action_amount"
    const lastAction = actions[actions.length - 1];
    const finalPot = (lastAction.pot_before || 0) + (lastAction.action_amount || 0);

    return {
      updatedActions: actions,
      finalPot,
      diedPositions,
      accContributedByPos,
    };
  }

  private calculateActionAmount(
    actionType: string,
    startingBalance: number,
    potBefore: number,
    callAmount: number,
    channel: number,
    accContributedByPos: number,
  ): number {
    switch (actionType) {
      case "D": // 다이
        return 0;
      case "G": // 체크
        return 0;
      case "B": // 삥
        return channel;
      case "C": // 콜
        return callAmount;
      case "T": // 따당
        return callAmount * 2;
      case "Q": // 쿼터
        return callAmount + Math.floor((potBefore + callAmount) / 4);
      case "H": //하프
        return callAmount + Math.floor((potBefore + callAmount) / 2);
      case "A": //올인
        return startingBalance - accContributedByPos;
      case "M": //맥스
        return 35000 - accContributedByPos;
      default:
        return 0;
    }
  }

  // TODO: 검산 로직 만들기
  public async inspectUnverifiedGames(): Promise<void> {
    // 1) 검수 안 된 게임 조회
    const unverified = await this.pool.any<{
      id: number;
      participant_count: number;
      channel: number;
    }>(sql`
SELECT id, participant_count, channel
FROM hangame_poker_game_info
WHERE inspection_passed IS NULL
`);

    // 2) 각 game_info마다 검사
    for (const row of unverified) {
      const gameId = row.id;
      const participantCount = row.participant_count;
      const channel = row.channel;

      // game_action 가져오기
      const actions = await this.pool.any<PokerAction>(sql`
SELECT
    id,
    game_id,
    betting_phase,
    sequence,
    position, 
    action,
    hand,
    hand_rank,
    game_result,
    starting_balance,
    pot_before,
    action_amount
FROM hangame_poker_game_action
WHERE game_id = ${gameId}
ORDER BY 
    CASE betting_phase
        WHEN 'preflop' THEN 1
        WHEN 'flop' THEN 2
        WHEN 'turn' THEN 3
        WHEN 'river' THEN 4
        ELSE 5
    END,
    sequence;
`);
      if (actions.length === 0) {
        continue;
      }

      // "검수 성공"인지 "실패"인지 판별
      const [isValid, reason] = this.isGameActionsValid(actions as any, participantCount, channel);

      // 3) 그 결과대로 inspection_passed 업데이트
      await this.pool.query(sql`
UPDATE hangame_poker_game_info
SET inspection_passed = ${isValid},
error_detail = ${reason}
WHERE id = ${gameId}
`);
    }
  }

  private isGameActionsValid(
    actions: PokerAction[],
    participantCount: number,
    channel: number,
  ): [boolean, string | null] {
    // preflop, flop, turn, river 분리 + 시퀀스 정렬
    const preflopActions = actions
      .filter((a) => a.betting_phase === "preflop")
      .sort((a, b) => a.sequence - b.sequence);
    const flopActions = actions
      .filter((a) => a.betting_phase === "flop")
      .sort((a, b) => a.sequence - b.sequence);
    const turnActions = actions
      .filter((a) => a.betting_phase === "turn")
      .sort((a, b) => a.sequence - b.sequence);
    const riverActions = actions
      .filter((a) => a.betting_phase === "river")
      .sort((a, b) => a.sequence - b.sequence);

    /*
     * STEP 1. preflop action 길이 확인
     * */
    const isPreflopAllFold = preflopActions.map((m) => m.action).every((item) => item === "D");

    if (preflopActions.length < participantCount) {
      if (isPreflopAllFold) {
        return [true, "프리플랍 올폴드"];
      }
      return [false, "preflop 참가자가 action 수보다 많음"];
    }

    /*
     * STEP 2-1. preflop 생존자와 flop action 길이 비교
     * */
    const isFlopAllFold = flopActions.map((m) => m.action).every((item) => item === "D");
    // preflop D 플레이어 제거
    const preflopDiedPositions = new Set<string>(
      preflopActions.filter((a) => a.action === "D").map((a) => a.position),
    );

    // preflop 다이 안한 참가자수 = participantCount - preflopDiedPosition.size
    const survivorsInPreflop = participantCount - preflopDiedPositions.size;

    if (flopActions.length < survivorsInPreflop) {
      if (isFlopAllFold) {
        return [true, "플랍 올폴드"];
      }
      if (survivorsInPreflop === 1) {
        return [true, "프리플랍 생존자 1명"];
      }
      return [false, "플랍 참가자가 action 수보다 많음"];
    }

    /*
     * STEP 2-2. flop 생존자와 turn action 길이 비교
     * */
    const isTurnAllFold = turnActions.map((m) => m.action).every((item) => item === "D");
    // flop D 플레이어 제거
    const flopDiedPositions = new Set<string>(
      flopActions.filter((a) => a.action === "D").map((a) => a.position),
    );

    // flop 다이 안한 참가자 수
    const survivorsInFlop = participantCount - preflopDiedPositions.size - flopDiedPositions.size;

    if (turnActions.length < survivorsInFlop) {
      if (isTurnAllFold) {
        return [true, "턴 올폴드"];
      }
      if (survivorsInFlop === 1) {
        return [true, "플랍 생존자 1명"];
      }
      return [false, "턴 참가자가 action 수보다 많음"];
    }

    /*
     * STEP 2-3. turn 생존자와 river action 길이 비교
     * */
    const isRiverAllFold = riverActions.map((m) => m.action).every((item) => item === "D");
    // turn D 플레이어 제거
    const turnDiedPositions = new Set<string>(
      turnActions.filter((a) => a.action === "D").map((a) => a.position),
    );

    // turn  다이 안한 참가자 수
    const survivorsInTurn =
      participantCount -
      preflopDiedPositions.size -
      flopDiedPositions.size -
      turnDiedPositions.size;

    if (riverActions.length < survivorsInTurn) {
      if (isRiverAllFold) {
        return [true, "리버 올폴드"];
      }
      if (survivorsInTurn === 1) {
        return [true, "턴 생존자 1명"];
      }
      return [false, "리버 참가자가 action 수보다 많음"];
    }

    /*
     * STEP 3. action이 D인 참여자가 이후에도 action을 하는지 여부
     * */
    const lastDSequenceByPos: Record<string, { phase: string; seq: number }> = {};

    // 3-1) preflop 액션 순회
    for (const act of preflopActions) {
      if (lastDSequenceByPos[act.position]) {
        return [false, "preflop 이미 죽었는데 morning 액션을 또 함"];
      }
      if (act.action === "D") {
        lastDSequenceByPos[act.position] = { phase: "preflop", seq: act.sequence };
      }
    }

    // 3-2) flop 액션 순회
    for (const act of flopActions) {
      if (lastDSequenceByPos[act.position]) {
        return [false, "preflop 이미 죽었는데 flop 액션을 또함"];
      }
      if (act.action === "D") {
        lastDSequenceByPos[act.position] = { phase: "flop", seq: act.sequence };
      }
    }

    // 3-3) turn 액션 순회
    for (const act of turnActions) {
      if (lastDSequenceByPos[act.position]) {
        return [false, "flop 이미 죽었는데 turn 액션을 또함"];
      }
      if (act.action === "D") {
        lastDSequenceByPos[act.position] = { phase: "turn", seq: act.sequence };
      }
    }

    // 3-4) river 액션 순회
    for (const act of riverActions) {
      if (lastDSequenceByPos[act.position]) {
        return [false, "turn 이미 죽었는데 river 액션을 또함"];
      }
      if (act.action === "D") {
        lastDSequenceByPos[act.position] = { phase: "river", seq: act.sequence };
      }
    }

    // STEP 4. 각 참여자별 action_amount + channel의 금액이 이상하지 않은지 확인
    const sumActionAmount = this.sumDistinctActionAmountsByPosition(actions);
    const startingBalanceByPos = this.getStartingBalanceByPosition(actions);

    for (const pos of Object.keys(sumActionAmount)) {
      const startingBalance = startingBalanceByPos[pos];
      if (startingBalance - channel < sumActionAmount[pos]) {
        return [false, "action_amount와 밸런스 금액 안맞음"];
      }
    }

    return [true, null];
  }

  private sumDistinctActionAmountsByPosition(data) {
    // position별로 action_amount들을 저장할 Map 또는 일반 객체
    const actionMap = {};

    // data 순회
    for (const item of data) {
      const { position, action_amount } = item;

      // 아직 해당 position에 대한 Set이 없다면 초기화
      if (!actionMap[position]) {
        actionMap[position] = new Set();
      }

      // 해당 position에 action_amount 추가 (Set을 사용해 중복 제거)
      actionMap[position].add(action_amount);
    }

    // 최종적으로 position별로 중복 없는 action_amount 합산
    const result = {};
    for (const [position, amounts] of Object.entries(actionMap)) {
      let sum = 0;
      for (const amount of amounts as any) {
        sum += amount;
      }
      result[position] = sum;
    }

    return result;
  }

  private getStartingBalanceByPosition(data) {
    const result = {};

    for (const item of data) {
      const { position, starting_balance } = item;

      // 만약 해당 position에 아직 starting_balance가 없다면 등록
      if (result[position] === undefined) {
        result[position] = starting_balance;
      }

      // 만약 다른 값이 들어온다면, 무시하거나 처리 로직을 추가할 수 있습니다.
      // 하지만 "동일한 position은 같은 starting_balance를 가진다"는 전제에 따라
      // 별도의 체크 로직 없이 넘어갑니다.
    }

    return result;
  }
}
