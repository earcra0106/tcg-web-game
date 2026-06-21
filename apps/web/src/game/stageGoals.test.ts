import { describe, expect, it } from 'vitest';
import { getStageGoal } from './stageGoals.ts';

describe('stage goals', () => {
  it('creates the same goal for the same seed and stage number', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 8 })).toEqual(
      getStageGoal({ seed: 'daily', stageNumber: 8 }),
    );
  });

  it('uses fixed introductory goals from easy recipes', () => {
    expect(
      [1, 2, 3, 4].map((stageNumber) =>
        getStageGoal({ seed: 'daily', stageNumber }),
      ),
    ).toEqual([
      expect.objectContaining({
        targetFoodId: 'cooked-rice',
        difficulty: 1,
      }),
      expect.objectContaining({
        targetFoodId: 'toast',
        difficulty: 1,
      }),
      expect.objectContaining({
        targetFoodId: 'salad',
        difficulty: 1,
      }),
      expect.objectContaining({
        targetFoodId: 'potato-salad',
        difficulty: 1,
      }),
    ]);
  });

  it('raises required efficiency as stages progress', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 1 })).toMatchObject({
      requiredEfficiency: 0.6,
    });
    expect(getStageGoal({ seed: 'daily', stageNumber: 12 })).toMatchObject({
      requiredEfficiency: 0.8,
    });
  });

  it('changes goal candidate or required efficiency by stage number', () => {
    const earlyGoal = getStageGoal({ seed: 'daily', stageNumber: 5 });
    const laterGoal = getStageGoal({ seed: 'daily', stageNumber: 12 });

    expect({
      targetFoodId: earlyGoal.targetFoodId,
      requiredEfficiency: earlyGoal.requiredEfficiency,
    }).not.toEqual({
      targetFoodId: laterGoal.targetFoodId,
      requiredEfficiency: laterGoal.requiredEfficiency,
    });
  });

  it('does not choose intermediate foods for normal stage goals', () => {
    const normalGoals = Array.from({ length: 20 }, (_, index) =>
      getStageGoal({ seed: 'normal', stageNumber: index + 5 }),
    );

    expect(normalGoals.map((goal) => goal.targetFoodId)).not.toContain(
      'boiled-egg',
    );
    expect(normalGoals.map((goal) => goal.targetFoodId)).not.toContain(
      'omelet-base',
    );
  });

  it('rejects invalid stage numbers', () => {
    expect(() => getStageGoal({ seed: 'daily', stageNumber: 0 })).toThrow(
      RangeError,
    );
  });
});
