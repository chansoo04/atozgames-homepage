/**
 * Aho-Corasick algorithm implementation
 * @see https://en.wikipedia.org/wiki/Aho%E2%80%93Corasick_algorithm
 * @see https://www.npmjs.com/package/aho-corasick
 */

import { test } from './test';
import { TestResult } from './type';

class Trie {
  public size: number = 0;

  constructor(
    public next: { [key: string]: Trie } = {},
    public is_word: boolean | null = null,
    public value: string | null = null,
    public fail: Trie | null = null,
  ) {}

  add(word: string, original_word?: string): Trie {
    const chr: string = word.charAt(0);
    let node = this.next[chr];

    if (!node) {
      this.size++;
      node = this.next[chr] = new Trie();
      if (original_word) {
        node.value = original_word.substring(
          0,
          original_word.length - word.length + 1,
        );
      } else {
        node.value = chr;
      }
    }
    if (word.length > 1) {
      return node.add(word.substring(1), original_word || word);
    } else {
      node.is_word = true;
      return node;
    }
  }

  exploreFailLink(node: Trie): Trie | null {
    const word = node.value;
    for (let i = 0; i < word!.length; i++) {
      const chr = word!.charAt(i);
      node = node.next[chr];
      if (!node) {
        return null;
      }
    }
    return node;
  }
}

export class AhoCorasick {
  trie: Trie;

  constructor() {
    this.trie = new Trie();
  }

  size = () => this.trie.size;

  add(word: string) {
    return this.trie.add(word);
  }

  buildFail(node: Trie = this.trie) {
    if (node.value) {
      for (let i = 1; i < node.value.length; i++) {
        const fail_node = this.trie.exploreFailLink(node);
        if (fail_node) {
          node.fail = fail_node;
          break;
        }
      }
    }

    for (const key in node.next) {
      const sub_node = node.next[key];
      this.buildFail(sub_node);
    }

    return this;
  }

  private foreachMatch(
    node: Trie,
    pos: number,
    callback: (word: string, offset: number) => void,
  ): AhoCorasick {
    while (node) {
      if (node.is_word) {
        const offset = pos - node.value!.length;
        callback(node.value!, offset);
      }
      node = node.fail!;
    }
    return this;
  }

  search(str: string, callback?: (word: string, offset: number) => void) {
    if (this.size() === 0) {
      throw new Error('No words added');
    }

    const result: TestResult[] = [];

    callback =
      callback ||
      ((word: string, offset: number) => {
        result.push({
          start: offset,
          end: offset + word.length - 1,
          word,
          length: word.length,
        });
      });

    let current: Trie | null = this.trie;
    current = this.trie;

    for (let idx = 0; idx < str.length; idx++) {
      const chr = str.charAt(idx);
      while (current && !current.next[chr]) {
        current = current.fail;
      }
      if (!current) {
        current = this.trie;
      }
      if (current.next[chr]) {
        current = current.next[chr];
        if (callback) {
          this.foreachMatch(current, idx + 1, callback);
        }
      }
    }

    return result;
  }

  public test = test;

  public setDefaultWord(slang: string[]) {
    for (const s of slang) {
      this.add(s);
    }
  }
}
