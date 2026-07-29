import { createSeededRandom } from './random.ts';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getJapanDateKey(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function toUuidFromSeed(seed: string) {
  const random = createSeededRandom(seed);
  const bytes = Array.from({ length: 16 }, () => random.nextInt(256));

  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = bytes.map((byte) => byte!.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createDailySeed(date = new Date()) {
  return toUuidFromSeed(`jst-daily:${getJapanDateKey(date)}`);
}

export function createRandomSeed() {
  return crypto.randomUUID();
}

export function isUuidSeed(seed: string) {
  return UUID_PATTERN.test(seed);
}

export function normalizeUuidSeed(seed: string) {
  return seed.trim().toLowerCase();
}
