import { describe, expect, it } from 'vitest';
import { createSeededRandom } from './random.ts';

describe('seeded random', () => {
  it('returns the same sequence for the same seed and salt', () => {
    const left = createSeededRandom('kitchen', 3);
    const right = createSeededRandom('kitchen', 3);

    expect([left.next(), left.next(), left.nextInt(10)]).toEqual([
      right.next(),
      right.next(),
      right.nextInt(10),
    ]);
  });

  it('changes the sequence when salt changes', () => {
    const left = createSeededRandom('kitchen', 1);
    const right = createSeededRandom('kitchen', 2);

    expect(left.next()).not.toBe(right.next());
  });

  it('picks deterministic items', () => {
    const random = createSeededRandom('stage', 7);

    expect(random.pick(['rice', 'egg', 'bread'])).toBe('bread');
  });

  it('rejects invalid integer ranges', () => {
    const random = createSeededRandom('stage');

    expect(() => random.nextInt(0)).toThrow(RangeError);
  });
});
