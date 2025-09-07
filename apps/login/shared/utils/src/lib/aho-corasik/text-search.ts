/**
 * 금지어 찾기
 * 입력된 텍스트에서 금지어를 찾아내는 알고리즘
 * 금지어를 찾아내는 알고리즘은 Aho-Corasick 알고리즘을 사용
 * 금지어와 허용어를 구분하여 금지어가 허용어에 포함되어 있는 경우 무효화
 *
 * @see https://techblog.woowahan.com/15764/
 */

import { Logger } from '@nestjs/common';
import { AhoCorasick } from './aho-corasick';
import { defaultStrings } from './test';
import { TestResult } from './type';

export const DefaultStrings = {
  slang: defaultStrings.slang,
  allow: defaultStrings.allow,
};

enum WordSearchMode {
  /** 기본 Aho-Corasick 알고리즘 */
  AHO_CORASICK,
  /** 허용어가 있으면 금지어에서 허용어 제거 */
  AHO_CORASICK_WITH_ALLOW,
  /** 특수기호에 대해서도 대응, AHO_CORASICK_WITH_ALLOW 확장 */
  AHO_CORASICK_STRICT,
}

export class SearchIncludeWord {
  private banTrie: AhoCorasick;
  private allowTrie: AhoCorasick;

  constructor() {
    this.banTrie = new AhoCorasick();
    this.allowTrie = new AhoCorasick();
  }

  init(banWords?: string[], allowWords?: string[]) {
    banWords = banWords ? banWords : defaultStrings.slang;
    allowWords = allowWords ? allowWords : defaultStrings.allow;

    banWords.forEach(word => this.banTrie.add(word));
    allowWords.forEach(word => this.allowTrie.add(word));

    this.banTrie.buildFail();
    this.allowTrie.buildFail();

    return [this.banTrie.size(), this.allowTrie.size()];
  }

  refreshBanWords(banWords: string[]) {
    this.banTrie = new AhoCorasick();
    banWords.forEach(word => this.banTrie.add(word));
    this.banTrie.buildFail();
  }

  refreshAllowWords(allowWords: string[]) {
    this.allowTrie = new AhoCorasick();
    allowWords.forEach(word => this.allowTrie.add(word));
    this.allowTrie.buildFail();
  }

  /**
   * 금지어 찾기 | 기본적인 Aho-Corasick 알고리즘 사용
   */
  test(word: string): TestResult[] {
    const isBan = this.banTrie.search(word);
    if (!isBan) return [];
    return isBan;
  }

  /**
   * 금지어 찾기 | 허용어가 있으면 금지어에서 허용어 제거
   */
  testWithAllow(word: string): TestResult[] {
    // 금지어 찾기
    const isBan = this.banTrie.search(word);

    // 금지어가 없으면 빈 배열 반환
    if (!isBan) return [];

    // 허용어 찾기
    const isAllow = this.allowTrie.search(word);

    // 허용어가 없으면 금지어 반환
    if (!isAllow) return isBan;

    // * 허용어가 있으면 금지어에서 허용어 제거
    // 허용어 시작점과 종료점 사이에 있는 금지어 제거
    const result: TestResult[] = [];
    isBan.forEach(ban => {
      let isInclude = false;
      isAllow.forEach(allow => {
        if (ban.start! >= allow.start! && ban.end! <= allow.end!) {
          isInclude = true;
        }
      });
      if (!isInclude) result.push(ban);
    });

    return result;
  }

  /**
   * 특수기호에 대해서도 대응
   * 허용: 고르곤졸라, 금지: 졸라
   * 원본: 고르곤-졸-라-피자 => 특수기호삭제: 고르곤졸라피자
   * [0:고] => [0:고]
   * [1:르] => [1:르]
   * [2:곤] => [2:곤]
   * [3:-]  => [3:졸]
   * [4:졸] => [4:라]
   * [5:-] => [5:피]
   * [6:라] => [6:자]
   * [7:-]
   * [8:피]
   * [9:자]
   * map: [0:0, 1:1, 2:2, 3:4, 4:6, 5:8, 6:9]
   * 원본 기준 졸라가 걸려야 하지만 특수기호가 있어서 걸리지 않음
   * 특수기호를 제거한 상태에서 졸라가 걸리면 허용어로 판단
   * 특수기호를 제거한 결과에서 원본과 텍스트 위치를 비교하여 특수기호가 포함된 허용어이면 해당 허용어 무효
   */
  testStrict(word: string): TestResult[] {
    const logger = [];

    const specialRegex = /[`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/ ]/gim;

    // 특수기호 제거, 글자 및 숫자만 남김
    const ignoreSpecial = word.replace(specialRegex, '');
    logger.push(`word: ${word} ignoreSpecial: ${ignoreSpecial}`);

    const isBan = this.banTrie.search(ignoreSpecial);
    if (!isBan) return [];
    logger.push(`isBan: ${JSON.stringify(isBan)}`);

    const isAllow = this.allowTrie.search(ignoreSpecial);
    if (!isAllow) return isBan;
    logger.push(`isAllow: ${JSON.stringify(isAllow)}`);

    const fillteredAllow: TestResult[] = [];

    /**
     * [0:고] => [0:고]
     * [1:르] => [1:르]
     * [2:곤] => [2:곤]
     * [3:-]  => [3:졸]
     * [4:졸] => [4:라]
     * [5:-] => [5:피]
     * [6:라] => [6:자]
     * [7:-]
     * [8:피]
     * [9:자]
     * map: [0:0, 1:1, 2:2, 3:4, 4:6, 5:8, 6:9]
     */
    function createIndexMap(word: string): Map<number, number> {
      const map = new Map<number, number>();
      let index = 0;
      for (let i = 0; i < word.length; i++) {
        if (word.charAt(i).match(specialRegex)) continue;
        map.set(index, i);
        index++;
      }
      return map;
    }

    isAllow.forEach(allow => {
      const map = createIndexMap(word);

      // 허용어 시작점이 원본의 시작점과 다를 수 있음
      // _고르곤졸라 => 고르곤졸라 : 1~5 => 0~4
      const start = map.get(allow.start!);
      const end = map.get(allow.end!);

      // 특수기호가 포함된 허용어는 무효
      // 허용어 길이와 특수기호를 제거한 길이가 같으면 특수기호가 없는 허용어
      if (end! - start! + 1 === allow.length) {
        fillteredAllow.push(allow);
      } else {
        logger.push(
          `ignore allow: ${allow.word} (origin: ${word.substring(start!, end! + 1)})`,
        );
      }
    });

    const result: TestResult[] = [];

    isBan.forEach(ban => {
      let isInclude = false;
      fillteredAllow.forEach(allow => {
        if (ban.start! >= allow.start! && ban.end! <= allow.end!) {
          isInclude = true;
        }
      });
      if (!isInclude) result.push(ban);
    });
    logger.push(`result: ${JSON.stringify(result)}`);

    logger.forEach(log => Logger.debug(log));

    return result;
  }

  /**
   * 금지어 찾기 | 금지어가 있는지 여부만 반환
   */
  isPass(word: string, mode?: WordSearchMode): boolean {
    switch (mode) {
      case WordSearchMode.AHO_CORASICK_STRICT:
        return this.testStrict(word).length === 0;
      case WordSearchMode.AHO_CORASICK_WITH_ALLOW:
        return this.testWithAllow(word).length === 0;
      case WordSearchMode.AHO_CORASICK:
      default:
        return this.test(word).length === 0;
    }
  }
}
