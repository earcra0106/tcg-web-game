export const EFFICIENCY_UNIT_MS = 10_000;

// 既存の難易度カーブを毎分値で定義し、表示単位へ自動換算する。
export const STAGE_GOAL_EFFICIENCY_SETTINGS = {
  introBasePerMinute: 0.55,
  laterBasePerMinute: 0.65,
  increasePerMinute: 0.05,
  stagesPerIncrease: 3,
  maximumPerMinute: 0.95,
} as const;
