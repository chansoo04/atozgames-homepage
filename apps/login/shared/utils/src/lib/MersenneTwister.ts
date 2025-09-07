/* tslint:disable */
/* eslint-disable */

import { randomBytes } from 'crypto';

/**
 * Mersenne Twister (Pseudo-Random Number Generator)
 * [https://en.wikipedia.org/wiki/Mersenne_Twister#C_code]
 */

const n = 624;
const m = 397;
const w = 32;
const r = 31;
const UMASK = 0xffffffff << r;
const LMASK = 0xffffffff >> (w - r);
const a = 0x9908b0df;
const u = 11;
const s = 7;
const t = 15;
const l = 18;
const b = 0x9d2c5680;
const c = 0xefc60000;
const f = 1812433253;

class MersenneTwister {
  private state: number[];
  private index: number;

  constructor(seed: number = MersenneTwister.generateSecureSeed()) {
    // Default seed to a cryptographically secure random number
    this.state = new Array(n);
    this.index = 0;
    this.initializeState(seed);
  }

  static generateSecureSeed(): number {
    return randomBytes(4).readUInt32BE(0);
  }

  initializeState(seed: number) {
    this.state[0] = seed;
    for (let i = 1; i < n; i++) {
      seed = f * (seed ^ (seed >> (w - 2))) + i;
      this.state[i] = seed >>> 0; // Ensure unsigned 32-bit integer
    }
  }

  randomUint32() {
    if (this.index === 0) this.twist();

    let y = this.state[this.index];
    y ^= y >>> u;
    y ^= (y << s) & b;
    y ^= (y << t) & c;
    y ^= y >>> l;

    this.index = (this.index + 1) % n;
    return y >>> 0; // Ensure unsigned 32-bit integer
  }

  private twist() {
    for (let i = 0; i < n; i++) {
      const x = (this.state[i] & UMASK) + (this.state[(i + 1) % n] & LMASK);
      const xA = x >>> 1;
      this.state[i] = this.state[(i + m) % n] ^ (x & 1 ? xA ^ a : xA);
    }
  }

  random() {
    return this.randomUint32() / 0x100000000;
  }
}

/**
 * @returns random number between 0 and 1
 */
export function generateRandom() {
  const mt = new MersenneTwister();
  return mt.random();
}

/**
 * @param n
 * @returns random string minimum 6 characters
 */
export function generateRandomN(n: number = 6) {
  if (n < 6) n = 6;

  while (true) {
    const mt = new MersenneTwister();

    const secret = new Uint8Array(n * 4);
    for (let i = 0; i < n * 4; i += 4) {
      const random = mt.randomUint32();
      secret[i] = random & 0xff;
      secret[i + 1] = (random >> 8) & 0xff;
      secret[i + 2] = (random >> 16) & 0xff;
      secret[i + 3] = (random >> 24) & 0xff;
    }

    const encode = Buffer.from(secret).toString('base64url');
    const result = encode.replace(/[^a-zA-Z0-9]/g, '');

    if (result.length >= n) return result.substring(0, n);
  }
}

export function newTxGroupID() {
  return generateRandomN(32);
}
