import { describe, expect, it } from 'vitest';
import {
  COOKERS_GAME_URL,
  createLineShareUrl,
  createSharePostText,
  createXPostIntentUrl,
  getShareStageGoals,
  getShareStageNumbers,
} from './share.ts';

describe('share helpers', () => {
  it('uses no food image before any stage is cleared', () => {
    expect(getShareStageNumbers(0)).toEqual([]);
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

  it('uses stage 1 in the post text before a stage is cleared', () => {
    expect(
      createSharePostText({ completedStageCount: 0, seed: 'daily-seed' }),
    ).toBe(
      `ステージ 1 の生産目標を達成！\nシード値: daily-seed\n\nプレイはこちらから\n${COOKERS_GAME_URL}\n\n#cookers!`,
    );
  });

  it('encodes the post text in an X intent URL', () => {
    const text = 'テスト\n#cookers!';
    const url = new URL(createXPostIntentUrl(text));

    expect(url.origin).toBe('https://x.com');
    expect(url.pathname).toBe('/intent/tweet');
    expect(url.searchParams.get('text')).toBe(text);
  });

  it('encodes the game URL and post text in a LINE share URL', () => {
    const text = 'テスト\n#cookers!';
    const url = new URL(createLineShareUrl(text));

    expect(url.origin).toBe('https://social-plugins.line.me');
    expect(url.pathname).toBe('/lineit/share');
    expect(url.searchParams.get('url')).toBe(COOKERS_GAME_URL);
    expect(url.searchParams.get('text')).toBe(text);
  });
});
