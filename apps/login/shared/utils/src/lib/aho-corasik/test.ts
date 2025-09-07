/* eslint-disable no-console */
import { AhoCorasick } from './aho-corasick';
import { allow, slang, testText } from './strings';

export const test = async () => {
  const ac = new AhoCorasick();
  for (const s of slang) {
    ac.add(s);
  }

  for (const t of testText) {
    console.log(ac.search(t));
  }
};

export const defaultStrings = {
  testText,
  slang,
  allow,
};
