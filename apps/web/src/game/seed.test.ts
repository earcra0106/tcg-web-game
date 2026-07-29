import { describe, expect, it, vi } from 'vitest';
import {
  createDailySeed,
  createRandomSeed,
  isUuidSeed,
  normalizeUuidSeed,
} from './seed.ts';

describe('seed', () => {
  it('creates the same UUID for the same Japan date', () => {
    const first = createDailySeed(new Date('2026-07-29T01:00:00.000Z'));
    const second = createDailySeed(new Date('2026-07-29T14:59:59.000Z'));

    expect(first).toBe(second);
    expect(isUuidSeed(first)).toBe(true);
  });

  it('changes the daily UUID at midnight in Japan', () => {
    expect(createDailySeed(new Date('2026-07-29T14:59:59.000Z'))).not.toBe(
      createDailySeed(new Date('2026-07-29T15:00:00.000Z')),
    );
  });

  it('uses the browser crypto UUID for random seeds', () => {
    const randomUUID = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('123e4567-e89b-42d3-a456-426614174000');

    expect(createRandomSeed()).toBe('123e4567-e89b-42d3-a456-426614174000');

    randomUUID.mockRestore();
  });

  it('validates and normalizes UUID input', () => {
    expect(isUuidSeed('123E4567-E89B-42D3-A456-426614174000')).toBe(true);
    expect(isUuidSeed('not-a-seed')).toBe(false);
    expect(normalizeUuidSeed('  123E4567-E89B-42D3-A456-426614174000  ')).toBe(
      '123e4567-e89b-42d3-a456-426614174000',
    );
  });
});
