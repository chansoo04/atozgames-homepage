import { Injectable } from "@nestjs/common";
import { InjectPool } from "nestjs-slonik";
import { DatabasePool, sql } from "slonik";

// 액션 구조 정의
type SeotdaAction = {
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
  betting_amount_before_action?: number; // 계산 후 세팅
  net_action_amount?: number | null; // 계산 후 세팅
  cost_to_call?: number | null; // 콜 하는데 필요한 금액
  cost_to_bbing?: number | null; // 삥 하는데 필요한 금액
  cost_to_check?: number | null; //  체크 하는데 필요한 금액
  cost_to_ddadang?: number | null; //  따당 하는데 필요한 금액
  cost_to_half?: number | null; //  하프 하는데 필요한 금액
  cost_to_quarter?: number | null; //  쿼터 하는데 필요한 금액
  cost_to_max?: number | null; // 맥스 하는데 필요한 금액
  cost_to_allin?: number | null; // 올인 하는데 필요한 금액
  pot_odds?: number | null; // 팟오즈: 내가 콜해야되는 금액 / (내가 콜해야되는 금액 + 콜 하기전 팟) * 1000
  stack_size?: number | null; // 스택 사이즈, 액션 전 남은 스택
  stack_size_over_pot?: number | null; //stack_size / pot_before
  raise_count_so_far: number; //지금까지 레이즈 카운트가 몇인가? (내 액션 전)
  call_count_so_far: number; // 지금까지 콜 카운트가 몇인가? (내 액션 전)
  check_count_so_far: number; // 이것도 추가해주세요
  fold_count_so_far: number; // 지금까지 다이 카운트가 몇인가? (내 액션 전)
  behind_player_count?: number | null; //내 뒤에 액션해야하는 사람 수(내 액션 고려 X)
  behind_player_count_if_raise?: number | null; //내 뒤에 액션해야하는 사람 수(레이즈 시)
};

// starting_balance는 앤티 내고 난 다음의 금액을 의미한다

@Injectable()
export class HangameSeotdaNewService {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  /**
   * (1) morning 페이즈 액션들을 계산해 pot_before/action_amount를 채움
   * (2) morning에서 다이(D)한 자리는 dinner에서 제외
   * (3) dinner 액션들도 계산하되, 첫 액션 pot_before는 "morning의 마지막 액션 pot_before+action_amount"
   */
  public updatePotBeforeAndActionAmount(
    morningActions: SeotdaAction[],
    dinnerActions: SeotdaAction[],
    participantCount: number,
    channel: number,
    myPosition: number,
    startingPot: number,
  ): {
    morning: SeotdaAction[];
    dinner: SeotdaAction[];
    finalPotMorning: number;
    finalPotDinner: number;
  } {
    // 1) morning 계산
    const {
      updatedActions: updatedMorning,
      finalPot: finalPotMorning,
      diedPositions,
      accContributedByPos: morningAccContributedByPos,
    } = this.calcPhaseActions(morningActions, participantCount, channel, true, startingPot);

    // 2) dinner에서는 diedPositions에 포함된 플레이어 제외 (선택사항)
    const filteredDinner = dinnerActions.filter((d) => !diedPositions.has(d.position));

    // 3) dinner 계산: 첫 액션 pot_before = morning 최종 pot (finalPotMorning)
    const { updatedActions: updatedDinner, finalPot: finalPotDinner } = this.calcPhaseActions(
      filteredDinner,
      participantCount,
      channel,
      false,
      finalPotMorning,
      morningAccContributedByPos,
    );

    return {
      morning: updatedMorning,
      dinner: updatedDinner,
      finalPotMorning,
      finalPotDinner,
    };
  }

  /**
   * 한 페이즈(morning/dinner)에 대해 sequence 순으로 액션을 진행.
   * - i=0일 때:
   *   - morning이면 pot_before = channel*participantCount
   *   - dinner이면 pot_before = initPot (즉, morning 마지막 액션의 pot_before+action_amount)
   * - i>0일 때:
   *   - pot_before = "직전 액션 pot_before + 직전 액션 action_amount"
   *
   * 액션별 action_amount는 섯다 공식(간단 버전)에 따라 계산.
   *
   * @param actions          이 페이즈의 액션들
   * @param participantCount 인원 수
   * @param channel          Ante(100만 단위)
   * @param isMorning        true면 morning, false면 dinner
   * @param initPot          이전 페이즈의 최종 pot (기본=0)
   */
  private calcPhaseActions(
    actions: SeotdaAction[],
    participantCount: number,
    channel: number,
    isMorning: boolean,
    initPot: number,
    accContributedByPos: Record<number, number> = {}, // 각 position이 누적으로 낸 총액
  ): {
    updatedActions: SeotdaAction[];
    finalPot: number;
    diedPositions: Set<string>;
    accContributedByPos: Record<number, number>;
  } {
    if (!actions || actions.length === 0) {
      // 액션이 없으면 그대로 리턴
      return {
        updatedActions: [],
        finalPot: initPot,
        diedPositions: new Set(),
        accContributedByPos,
      };
    }

    // sequence 오름차순 정렬
    actions.sort((a, b) => a.sequence - b.sequence);

    // 시작 참여자 수 구하기
    const startingPositions: string[] = [...new Set(actions.map((item) => item.position))];
    let behind_player_count: number | null = null;
    let behind_player_count_if_raise: number | null = null;

    // 누가 다이했는지 추적
    const diedPositions = new Set<string>();

    // MAX, ALLIN 유저 추적
    const MaxAllinPositions = new Set<string>();

    // 선배팅 액션 여부 확인
    const earlyBettingActions: string[] = [];

    // raise count, call count, fold count
    const actionCounts: Record<string, number> = {
      raise_count_so_far: 0,
      call_count_so_far: 0,
      fold_count_so_far: 0,
      check_count_so_far: 0,
    };

    // 각 position이 이 페이즈에서 이미 낸 총액
    const contributedByPos: Record<number, number> = {};
    // 최대 베팅(레이즈를 포함)이 얼마나 쌓였는지
    let highestBet = 0;

    // 아침이라면 position별 낸 총 금액 셋팅
    if (isMorning) {
      for (const act of actions) {
        accContributedByPos[act.position] = channel;
      }
    }

    // 초기화
    for (const act of actions) {
      contributedByPos[act.position] = 0;
    }

    for (let i = 0; i < actions.length; i++) {
      const act = actions[i];
      const pos = act.position;
      act.betting_amount_before_action = accContributedByPos[pos];

      // 이미 다이한 position이면 그냥 action_amount=0, pot_before=initPot 등
      if (diedPositions.has(pos)) {
        act.pot_before =
          i === 0 ? initPot : actions[i - 1].pot_before! + (actions[i - 1].action_amount || 0);
        act.action_amount = 0;
        continue;
      }

      // 0-1) behind_player_count, behind_player_count_if_raise 계산
      if (i === 0) {
        behind_player_count = startingPositions.length - 1;
        behind_player_count_if_raise = startingPositions.length - 1;
      } else if (i === 1) {
        behind_player_count = (behind_player_count as number) - 1;
        if (["M", "D", "A"].includes(actions[i - 1].action)) {
          // Max, Allin, Die 시 한명 제거
          behind_player_count_if_raise = (behind_player_count_if_raise as number) - 1;
        } else {
          // 그렇지 않을 경우 그대로 유지
          behind_player_count_if_raise = (behind_player_count_if_raise as number) + 1 - 1;
        }
      } else {
        behind_player_count = (behind_player_count as number) - 1;
        behind_player_count_if_raise = (behind_player_count_if_raise as number) - 1;
      }
      act.behind_player_count = behind_player_count;
      act.behind_player_count_if_raise = behind_player_count_if_raise;

      if (act.action === "D") {
        diedPositions.add(pos);
      }
      if (act.action === "M" || act.action === "A") {
        MaxAllinPositions.add(pos);
      }
      // MAX다음 콜이면 넣어줘야함
      if (act.action === "C" && MaxAllinPositions.size > 0) {
        MaxAllinPositions.add(pos);
      }

      // 0-2) i가 1 이상일 때, 내 액션에 따라서 behind_player_count, behind_player_count_if_raise 재세팅
      if (i !== 0) {
        const livingPlayerCount = startingPositions.length - diedPositions.size;
        if (["Q", "H", "B", "T", "M", "A"].includes(act.action)) {
          behind_player_count = livingPlayerCount - 1;
        }
        behind_player_count_if_raise = livingPlayerCount - MaxAllinPositions.size;
      }

      // 1) pot_before 계산
      if (i === 0) {
        // 첫 액션
        if (isMorning) {
          // morning: sequence=1 => pot_before=channel*participantCount
          act.pot_before = initPot > 0 ? initPot : channel * participantCount;
        } else {
          // dinner: sequence=1 => pot_before=initPot(= morning마지막 액션 pot_before+action_amount)
          act.pot_before = initPot;
        }
      } else {
        // i>0
        const prev = actions[i - 1];
        act.pot_before = (prev.pot_before || 0) + (prev.action_amount || 0);
      }

      // 2-1) callAmount = highestBet - 내가 이미 낸 금액
      let callAmount =
        highestBet - contributedByPos[pos] + accContributedByPos[pos] > 35000
          ? 35000 - accContributedByPos[pos]
          : highestBet - contributedByPos[pos];
      if (callAmount < 0) callAmount = 0;

      // 2-2) pot odds 계산
      const pot_odds = Math.round(
        (callAmount * 1000) /
          (callAmount + Object.values(accContributedByPos).reduce((acc, val) => acc + val, 0)),
      );
      act.pot_odds = pot_odds;

      // 2-3) stack_size(액션 전 남은 스택) 계산
      const stack_size = act.starting_balance - accContributedByPos[pos];
      act.stack_size = stack_size;

      // 2-4) stack_size_over_pot 계산
      const stack_size_over_pot = Math.round((stack_size * 100) / act.pot_before) / 100;
      act.stack_size_over_pot = stack_size_over_pot;

      // 2-5) actionCounts 업데이트
      act.raise_count_so_far = actionCounts.raise_count_so_far;
      act.call_count_so_far = actionCounts.call_count_so_far;
      act.check_count_so_far = actionCounts.check_count_so_far;
      act.fold_count_so_far = actionCounts.fold_count_so_far;

      if (act.action === "D") {
        actionCounts.fold_count_so_far += 1;
      } else if (act.action === "G") {
        actionCounts.check_count_so_far += 1;
      } else if (act.action === "C") {
        actionCounts.check_count_so_far += 1;
      } else {
        actionCounts.raise_count_so_far += 1;
      }

      // 3) action_amount 계산
      const amt = this.calculateActionAmount(
        act.action,
        act.starting_balance,
        act.pot_before,
        callAmount,
        channel,
        accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
      );
      act.action_amount = amt;
      act.net_action_amount = null;

      // 5) 가능한 action 확인하기
      const availableActions = this.getAvailableActions(
        act,
        earlyBettingActions,
        isMorning,
        contributedByPos,
        accContributedByPos,
        highestBet,
      );

      if (availableActions.includes("C")) {
        act.cost_to_call = this.calculateActionAmount(
          "C",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("B")) {
        act.cost_to_bbing = this.calculateActionAmount(
          "B",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("G")) {
        act.cost_to_check = 0;
      }

      if (availableActions.includes("T")) {
        act.cost_to_ddadang = this.calculateActionAmount(
          "T",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("H")) {
        act.cost_to_half = this.calculateActionAmount(
          "H",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("Q")) {
        act.cost_to_quarter = this.calculateActionAmount(
          "Q",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("M")) {
        act.cost_to_max = this.calculateActionAmount(
          "M",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      if (availableActions.includes("A")) {
        act.cost_to_allin = this.calculateActionAmount(
          "A",
          act.starting_balance,
          act.pot_before,
          callAmount,
          channel,
          accContributedByPos[pos], // 해당 포지션에서 지금까지 낸 누적 금액
        );
      }

      // early betting actions 추가
      earlyBettingActions.push(act.action);

      // 4) 다이(D)면 diedPositions에 추가
      if (act.action === "D") {
        diedPositions.add(pos);
      } else {
        // contributedByPos 갱신
        contributedByPos[pos] += act.action_amount;
        accContributedByPos[pos] += act.action_amount;

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

  /**
   * 액션별 배팅 금액 + 가능한 액션 처리
   */
  // TODO: 고도화 필요..
  // ex) 아침에서 H, Q등을 계산하여 M 활성화 여부 결정 필요
  private getAvailableActions(
    act: SeotdaAction,
    earlyBettingActions: string[],
    isMorning: boolean,
    contributedByPos: Record<number, number>,
    accContributedByPos: Record<number, number>,
    highestBet: number,
  ) {
    // 1) 아침 첫액션은 하프/다이
    if (isMorning && act.sequence === 1) {
      return ["H", "D"];
    }

    // 2) 앞에서 M이 있다면 M 또는 D
    if (earlyBettingActions.includes("M")) {
      return ["M", "D", "C"];
    }

    // 3) 앞에서 올인이 나오고 내 보유금액이 콜 금액보다 작다면 A 또는 D
    // TODO: 어떻게 하지??

    const result = ["D"];
    // 4) 삥 또는 따당 선택
    if (
      earlyBettingActions.includes("Q") ||
      earlyBettingActions.includes("H") ||
      earlyBettingActions.includes("B") ||
      earlyBettingActions.includes("T")
    ) {
      result.push("T");
    } else {
      result.push("B");
    }

    // 5) 콜 또는 체크 선택
    if (
      earlyBettingActions.includes("Q") ||
      earlyBettingActions.includes("H") ||
      earlyBettingActions.includes("B") ||
      earlyBettingActions.includes("T")
    ) {
      result.push("C");
    } else {
      result.push("G");
    }

    // 8) 쿼터 추가
    result.push("Q");
    // 7) 하프 추가
    result.push("H");
    // 8) 맥스 또는 올인 추가
    if (act.starting_balance < 35000) {
      result.push("A");
    } else {
      result.push("M");
    }

    return result;
  }

  /**
   * 액션별 배팅금액을 간단 공식으로 계산 (콜, 하프, 쿼터, 따당 등).
   *  - 'H': 하프 = call + ( (pot_before + call)/2 )
   *  - 'Q': 쿼터 = call + ( (pot_before + call)/4 )
   *  - 'C': 콜 = call
   *  - 'B': 삥 = 간단히 2000 (혹은 channel)
   *  - 'T': 따당 = call*2
   *  - 'G': 체크 = 0
   *  - 'D': 다이 = 0
   *  - 'A': 올인(예시) = starting_balance
   *  - 'M': 맥스(임의)
   */
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
        return channel; // 실제로는 channel
      case "C": // 콜
        return callAmount;
      case "T": // 따당
        return Math.min(callAmount * 2, 35000 - channel);
      case "Q": // 쿼터
        return Math.min(callAmount + Math.floor((potBefore + callAmount) / 4), 35000 - channel);
      case "H": // 하프
        return Math.min(callAmount + Math.floor((potBefore + callAmount) / 2), 35000 - channel);
      case "A": // 올인
        return startingBalance - accContributedByPos;
      case "M": // 맥스
        return 35000 - accContributedByPos;
      default:
        return 0;
    }
  }

  /**
   * (예시) 10분마다 cron으로 호출되는 "검수 로직" 메서드.
   * 1) inspection_passed = null 인 game_info 목록 조회
   * 2) 각 game_id에 대해 game_action 조회
   * 3) 베팅 로직이 정상적이면 inspection_passed=true, 아니면 false 로 update
   */
  public async inspectUnverifiedGames(): Promise<void> {
    // 1) 검수 안 된 게임 조회
    const unverified = await this.pool.query<{
      id: number;
      participant_count: number;
      channel: number;
    }>(sql`
      SELECT id, participant_count, channel
      FROM hangame_seotda_game_info
      WHERE inspection_passed IS NULL
    `);

    // 2) 각 game_info마다 검사
    for (const row of unverified.rows) {
      const gameId = row.id;
      const participantCount = row.participant_count;
      const channel = row.channel;

      // game_action 가져오기
      const actionsResult = await this.pool.query<SeotdaAction>(sql`
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
          action_amount,
          pot_odds
        FROM hangame_seotda_game_action
        WHERE game_id = ${gameId}
        ORDER BY betting_phase,
                 sequence
      `);
      const actions = actionsResult.rows;
      if (actions.length === 0) {
        continue;
      }

      // "검수 성공"인지 "실패"인지 판별
      const [isValid, reason] = this.isGameActionsValid(
        row,
        actions as any,
        participantCount,
        channel,
      );

      // 3) 그 결과대로 inspection_passed 업데이트
      await this.pool.query(sql`
        UPDATE hangame_seotda_game_info
        SET inspection_passed = ${isValid},
        error_detail = ${reason}
        WHERE id = ${gameId}
      `);
    }
  }

  /**
   * 주어진 game_action 데이터가 "말이 되는 섯다 베팅 로직"인지 간단 검수
   * 필요하면 훨씬 더 세부적인 규칙(아침에 폴드 1명 => 강제종료? etc.)을 추가
   *
   * @param actions        이 게임의 game_action 전체 (morning+dinner)
   * @param participantCount  인원 수
   * @param channel        Ante
   * @returns true면 검사 통과, false면 이상
   */
  private isGameActionsValid(
    game_info: any,
    actions: SeotdaAction[],
    participantCount: number,
    channel: number,
  ): [boolean, string | null] {
    // 0) morning/dinner 분리 + 시퀀스 정렬
    const morningActions = actions
      .filter((a) => a.betting_phase === "morning")
      .sort((a, b) => a.sequence - b.sequence);
    const dinnerActions = actions
      .filter((a) => a.betting_phase === "dinner")
      .sort((a, b) => a.sequence - b.sequence);

    const {
      morning_participant_count,
      morning_survival_count,
      dinner_participant_count,
      dinner_survival_count,
    } = this.getParticipantAndSurvivalCount(
      morningActions,
      dinnerActions,
      game_info.participant_count as number,
    );

    /**
     * STEP 1. morning action의 길이를 확인
     *  - "morning action의 길이가 participant_count보다 크다면 오류"
     */
    const isMorningAllFold = morningActions.map((m) => m.action).every((item) => item === "D");

    if (morningActions.length < participantCount) {
      // 예: 참가자가 2명인데, morning 액션이 3개 이상(3번 sequence)
      // (단순 기준) => 오류 처리
      if (isMorningAllFold) {
        return [true, "아침 올폴드"];
      }
      return [false, "morning 참가자가 action 수보다 많음"];
    }

    /**
     * STEP 2. morning에서 살아남은 참여자들의 숫자와
     *         dinner action의 길이를 비교
     *  - "dinner action의 길이가 morning에서 D하지 않은 참여자의 숫자보다 크다면 오류"
     */
    const isDinnerAllFold = dinnerActions.map((m) => m.action).every((item) => item === "D");
    // morning에서 D를 한 플레이어(중복제거)
    const morningDiedPositions = new Set<string>(
      morningActions.filter((a) => a.action === "D").map((a) => a.position),
    );

    // morning에서 "다이하지 않은" 참가자 수 = participantCount - morningDiedPositions.size
    const survivorsInMorning = participantCount - morningDiedPositions.size;

    if (dinnerActions.length < survivorsInMorning) {
      // 예: 살아남은 1명밖에 없는데, dinner 액션이 2개 이상이면 말이 안 됨 등
      if (isDinnerAllFold) {
        return [true, "저녁 올폴드"];
      }
      if (survivorsInMorning === 1) {
        return [true, "아침 생존자 1명"];
      }
      return [false, "dinner 참가자가 action 수보다 많음"];
    }

    /**
     * STEP 3. action이 D인 참여자가 이후에도 action을 하는지 여부
     *  - "action D를 한 참여자가 이후 시퀀스(또는 이후 페이즈)에서
     *     다시 액션을 했다면 오류"
     */

    // 방법: 각 포지션별로 "마지막으로 D한 시퀀스" 추적
    //  - morning, dinner 상관없이 시퀀스가 커지면 "이후 액션"이라 보고 오류 체크
    const lastDSequenceByPos: Record<number, { phase: string; seq: number }> = {};

    // 3-1) morning 액션 순회
    for (const act of morningActions) {
      // 만약 이전에 D한 기록이 있고, 그 sequence보다 지금 act.sequence가 크면 => 오류
      if (lastDSequenceByPos[act.position]) {
        // 이미 D를 한 적이 있는데, 다시 액션이 들어왔다 => 오류
        return [false, "morning 이미 죽었는데 morning 액션을 또함"];
      }
      if (act.action === "D") {
        // 이 포지션은 D함
        lastDSequenceByPos[act.position] = { phase: "morning", seq: act.sequence };
      }
    }

    // 3-2) dinner 액션 순회
    for (const act of dinnerActions) {
      // 만약 이전에 D한 기록이 있으면 => 오류
      if (lastDSequenceByPos[act.position]) {
        // 이 포지션은 morning에서 D했는데 dinner에 또 액션이 있다 => 오류
        return [false, "morning 이미 죽었는데 dinner 액션을 또함"];
      }
      if (act.action === "D") {
        lastDSequenceByPos[act.position] = { phase: "dinner", seq: act.sequence };
      }
    }

    // STEP 4. 각 참여자별 action_amount + channel의 금액이 이상하지 않은지 확인
    const sumActionAmount = this.sumDistinctActionAmountsByPosition(actions);
    const startingBalanceByPos = this.getStartingBalanceByPosition(actions);

    for (const pos of Object.keys(sumActionAmount)) {
      const startingBalance = startingBalanceByPos[pos];
      if (startingBalance - channel < sumActionAmount[pos]) {
        return [false, "action_amount와 밸런스금액 안맞음"];
      }
    }

    /*
     * STEP 5. hand_rank가 알리 or (땡으로 끝나는데), action이 ‘D’인 데이터가 존재
     * */
    const handRank알리or땡배열 = dinnerActions.filter(
      (item) => item.hand_rank?.endsWith("땡") || item.hand_rank === "알리",
    );
    for (const handRank알리or땡 of handRank알리or땡배열) {
      if (handRank알리or땡.action === "D") {
        return [false, "hand_rank가 알리 또는 ~땡인데 액션이 D"];
      }
    }

    /*
     * STEP 6. betting_phase가 morning이고 sequence가 1인데 action이 D or H가 아닌 데이터가 존재
     * */
    const 첫모닝액션 = morningActions[0];
    if (!["H", "D"].includes(첫모닝액션.action)) {
      return [false, "morning 첫 액션이 D or H가 아님"];
    }

    /*
     * STEP 7. beqtting_phase가 dinner이고 sequence가 1인데 action이 [’C’,’T’] 중 하나인 데이터가 존재
     * */
    if (dinnerActions.length > 0) {
      const 첫디너액션 = dinnerActions[0];
      if (["C", "T"].includes(첫디너액션.action)) {
        return [false, "dinner 첫 액션이 C or T임"];
      }
    }

    /*
     * STEP 8. action M을 한 이후 추가 액션을 하는 경우
     * */
    const lastMSequenceByPos: Record<number, { phase: string; seq: number }> = {};

    // 8-1) morning 액션 순회
    for (const act of morningActions) {
      // 만약 이전에 M한 기록이 있고, 그 sequence보다 지금 act.sequence가 크면 => 오류
      if (lastMSequenceByPos[act.position]) {
        // 이미 M를 한 적이 있는데, 다시 액션이 들어왔다 => 오류
        return [false, "morning 이미 MAX했는데 morning 액션을 또함"];
      }
      if (act.action === "M") {
        // 이 포지션은 M함
        lastMSequenceByPos[act.position] = { phase: "morning", seq: act.sequence };
      }
    }

    // 8-2) dinner 액션 순회
    for (const act of dinnerActions) {
      // 만약 이전에 D한 기록이 있으면 => 오류
      if (lastMSequenceByPos[act.position]) {
        // 이 포지션은 morning에서 M했는데 dinner에 또 액션이 있다 => 오류
        return [false, "morning 이미 MAX했는데 dinner 액션을 또함"];
      }
      if (act.action === "M") {
        lastMSequenceByPos[act.position] = { phase: "dinner", seq: act.sequence };
      }
    }

    /*
     * STEP 9-1. betting_phaser가 morning이고 hand가 null인 데이터가 존재
     * STEP 9-2.  dinner이고 hand_rank가 null인 데이터가 존재
     * */
    for (const act of morningActions) {
      if (act.hand === null) {
        return [false, "morning에 hand가 없음"];
      }
    }
    for (const act of dinnerActions) {
      if (act.hand_rank === null) {
        return [false, "dinner에 hand_rank가 없음"];
      }
    }

    /*
     * STEP 10-1. 마지막 저녁 액션이 D, C, G, M이 아닌 경우
     * STEP 10-2. 마지막 액션이 G인데, 앞에 레이즈가 나온 경우
     * */
    if (dinnerActions.length > 0) {
      const 마지막저녁액션 = dinnerActions[dinnerActions.length - 1];
      if (!["D", "C", "G", "M", "A"].includes(마지막저녁액션.action)) {
        return [false, "저녁 마지막 액션이 D, C, G, M, A이 아님"];
      }
      const 저녁액션총합 = dinnerActions.map((item) => item.action);
      const 저녁배팅여부 = 저녁액션총합.some((item) => ["H", "M", "Q", "B", "T"].includes(item));
      if (저녁배팅여부 && 마지막저녁액션.action === "G") {
        return [false, "저녁에 배팅이 있는데 마지막 액션이 G임"];
      }
    }

    /*
     * STEP 11. morning에서 action이 G인 경우
     * */
    for (const act of morningActions) {
      if (act.action === "G") {
        return [false, "morning에서 action이 G임"];
      }
    }

    /*
     * STEP 12. pot_odds가 null인 경우
     * */
    for (const act of morningActions) {
      if (act.pot_odds === null) {
        return [false, "morning pot_odds null"];
      }
    }

    for (const act of dinnerActions) {
      if (act.pot_odds === null) {
        return [false, "dinner pot_odds null"];
      }
    }

    /*
     * STEP 13-1. morning 올폴드 시  마지막 유저의 액션 데이터가 있는 경우
     * STEP 13-2. dinner 올폴드 시 마지막 유저의 액션 데이터가 있는 경우
     * */
    if (morning_survival_count === 1 && morningActions.length > 0) {
      const 마지막아침액션 = morningActions[morningActions.length - 1];
      if (마지막아침액션.action !== "D") {
        return [false, "morning 올폴드에서 마지막 유저의 액션이 D가 아님"];
      }
    }

    if (dinner_survival_count === 1 && dinnerActions.length > 0) {
      const 마지막저녁액션 = dinnerActions[dinnerActions.length - 1];
      if (마지막저녁액션.action !== "D") {
        return [false, "dinner 올폴드에서 마지막 유저의 액션이 D가 아님"];
      }
    }

    /*
     * STEP 14. M이 2회 이상 나올 경우
     * */
    const 전체액션 = [...morningActions, ...dinnerActions];
    let 맥스횟수 = 0;
    for (const act of 전체액션) {
      if (act.action === "M") {
        맥스횟수 = 맥스횟수 + 1;
      }
      if (맥스횟수 > 1) {
        return [false, "MAX 2회 이상 발생"];
      }
    }

    /*
     * STEP 15. morning에서 sequence 순서상 앞에 레이즈가 없는데 (B,T,Q,H,M,A)  action이 C인 경우
     * */
    const 아침앞액션 = new Set<string>();
    for (const act of morningActions) {
      const isIncluded = ["B", "T", "Q", "H", "M", "A"].some((item) => 아침앞액션.has(item));
      if (!isIncluded && act.action === "C") {
        return [false, "morning 앞에 레이즈 없는데 콜"];
      }
      아침앞액션.add(act.action);
    }

    /*
     * STEP 16-1. game_info에서 morning_participant_count 가 0 또는 1인 경우
     * STEP 16-2. game_info에서 dinner_participant_count가 가 0 또는 1인 경우
     * STEP 16-3. game_info에서 participant_count가 0 또는 1인 경우
     * */
    if ([0, 1].includes(game_info.morning_participant_count)) {
      return [false, "game_info 아침 참여자 0 또는 1"];
    }
    if ([0, 1].includes(game_info.dinner_participant_count)) {
      return [false, "game_info 저녁 참여자 0 또는 1"];
    }
    if ([0, 1].includes(game_info.participant_count)) {
      return [false, "game_info 참여자 0 또는 1"];
    }

    /*
     * STEP 17. (morning or dinner)에 sequence ≥3 and position == 1인데 액션이 (B or G)인 경우
     * */
    for (const act of [...morningActions, ...dinnerActions]) {
      if (act.sequence >= 3 && act.position === "1" && ["B", "G"].includes(act.action)) {
        return [false, "sequence >= 3, position = 1인데 action이 B, G임"];
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

  public getParticipantAndSurvivalCount(
    morningActions: SeotdaAction[],
    dinnerActions: SeotdaAction[],
    participant_count: number,
  ): {
    morning_participant_count: number | null;
    morning_survival_count: number | null;
    dinner_participant_count: number | null;
    dinner_survival_count: number | null;
  } {
    const result: {
      morning_participant_count: number | null;
      morning_survival_count: number | null;
      dinner_participant_count: number | null;
      dinner_survival_count: number | null;
    } = {
      morning_participant_count: null,
      morning_survival_count: null,
      dinner_participant_count: null,
      dinner_survival_count: null,
    };

    // 아침 액션 길이 확인
    if (morningActions.length === 0) {
      return result;
    }

    // STEP 1-1. 아침 참여자 수 확인
    const morningUniquePositions = [...new Set(morningActions.map((item) => item.position))];
    // result.morning_participant_count = morningUniquePositions.length;
    result.morning_participant_count = participant_count;

    // STEP 1-2. 아침 죽은 사람 확인
    const morningPositionsWithD = [
      ...new Set(morningActions.filter((item) => item.action === "D").map((item) => item.position)),
    ];
    result.morning_survival_count = morningUniquePositions.length - morningPositionsWithD.length;

    // 저녁 액션 길이 확인
    if (dinnerActions.length === 0) {
      return result;
    }

    // STEP 2-1. 저녁 참여자 수 확인
    const dinnerUniquePositions = [...new Set(dinnerActions.map((item) => item.position))];
    result.dinner_participant_count = result.morning_survival_count;

    // STEP 1-2. 아침 죽은 사람 확인
    const dinnerPositionsWithD = [
      ...new Set(dinnerActions.filter((item) => item.action === "D").map((item) => item.position)),
    ];
    result.dinner_survival_count = dinnerUniquePositions.length - dinnerPositionsWithD.length;

    return result;
  }
}
