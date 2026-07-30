import { describe, expect, it } from 'vitest';
import {
  COOKERS_GAME_URL,
  createSharePostText,
  createXPostIntentUrl,
  getShareStageGoals,
  getShareStageNumbers,
} from './share.ts';

describe('share helpers', () => {
  it('uses the first stage goal before any stage is cleared', () => {
    expect(getShareStageNumbers(0)).toEqual([1]);
  });

  it('returns at most the latest five cleared stages in chronological order', () => {
    expect(getShareStageNumbers(3)).toEqual([1, 2, 3]);
    expect(getShareStageNumbers(7)).toEqual([3, 4, 5, 6, 7]);
  });

  it('builds the image goals from the selected stage numbers', () => {
    expect(
      getShareStageGoals({
        completedStageCount: 2,
        getStageGoal: (stageNumber) => ({
          stageNumber,
          targetFoodId: `food-${stageNumber}`,
        }),
      }),
    ).toEqual([
      { stageNumber: 1, targetFoodId: 'food-1' },
      { stageNumber: 2, targetFoodId: 'food-2' },
    ]);
  });

  it('builds the cleared-stage post text', () => {
    expect(
      createSharePostText({ completedStageCount: 4, seed: 'daily-seed' }),
    ).toBe(
      `ステージ 4 の生産目標を達成！\nシード値: daily-seed\n\nプレイはこちらから\n${COOKERS_GAME_URL}\n\n#cookers!`,
    );
  });

  it('builds the in-progress post text before a stage is cleared', () => {
    expect(
      createSharePostText({ completedStageCount: 0, seed: 'daily-seed' }),
    ).toBe(
      `自動料理に挑戦中!\nシード値: daily-seed\n\nプレイはこちらから\n${COOKERS_GAME_URL}\n\n#cookers!`,
    );
  });

  it('encodes the post text in an X intent URL', () => {
    const text = 'テスト\n#cookers!';
    const url = new URL(createXPostIntentUrl(text));

    expect(url.origin).toBe('https://x.com');
    expect(url.pathname).toBe('/intent/post');
    expect(url.searchParams.get('text')).toBe(text);
  });
});
