export type SeededRandom = {
  next: () => number;
  nextInt: (maxExclusive: number) => number;
  pick: <T>(items: readonly T[]) => T | null;
};

function hashSeed(seed: string, salt: number) {
  let hash = 2166136261 ^ salt;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed: string, salt = 0): SeededRandom {
  let state = hashSeed(seed, salt);

  const next = () => {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    nextInt(maxExclusive) {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new RangeError('maxExclusive must be a positive integer');
      }

      return Math.floor(next() * maxExclusive);
    },
    pick(items) {
      if (items.length === 0) {
        return null;
      }

      return items[this.nextInt(items.length)] ?? null;
    },
  };
}
