import type { FoodId } from './food.ts';

export const COOKERS_GAME_URL = 'https://cookers-web-game.vercel.app/';

export type ShareStageGoal = {
  stageNumber: number;
  targetFoodId: FoodId;
};

export function getShareStageNumbers(completedStageCount: number) {
  if (!Number.isInteger(completedStageCount) || completedStageCount < 0) {
    throw new RangeError('completedStageCount must be a non-negative integer');
  }

  if (completedStageCount === 0) {
    return [];
  }

  const length = Math.min(completedStageCount, 5);

  return Array.from(
    { length },
    (_, index) => completedStageCount - length + index + 1,
  );
}

export function getShareStageGoals({
  completedStageCount,
  getStageGoal,
}: {
  completedStageCount: number;
  getStageGoal: (stageNumber: number) => ShareStageGoal;
}) {
  return getShareStageNumbers(completedStageCount).map((stageNumber) =>
    getStageGoal(stageNumber),
  );
}

export function createSharePostText({
  completedStageCount,
  seed,
}: {
  completedStageCount: number;
  seed: string;
}) {
  const stageNumber = Math.max(1, completedStageCount);
  const headline = `ステージ ${stageNumber} の生産目標を達成！`;

  return `${headline}\nシード値: ${seed}\n\nプレイはこちらから\n${COOKERS_GAME_URL}\n\n#cookers!`;
}

export function createXPostIntentUrl(text: string) {
  const url = new URL('https://x.com/intent/tweet');
  url.searchParams.set('text', text);

  return url.toString();
}

export function createLineShareUrl(text: string) {
  const url = new URL('https://social-plugins.line.me/lineit/share');
  url.searchParams.set('url', COOKERS_GAME_URL);
  url.searchParams.set('text', text);

  return url.toString();
}
