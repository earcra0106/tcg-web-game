import { describe, expect, it } from 'vitest';
import { getFoodInfo } from './foods.ts';
import { getRecipes } from './recipes.ts';
import { getStageGoal } from './stageGoals.ts';

describe('stage goals', () => {
  it('creates the same goal for the same seed and stage number', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 8 })).toEqual(
      getStageGoal({ seed: 'daily', stageNumber: 8 }),
    );
  });

  it('uses a single storage ingredient recipe for stages 1 and 2', () => {
    const goals = [1, 2].map((stageNumber) =>
      getStageGoal({ seed: 'daily', stageNumber }),
    );

    for (const goal of goals) {
      const recipe = getRecipes().find(
        (candidate) => candidate.outputFoodId === goal.targetFoodId,
      );

      expect(goal.difficulty).toBe(1);
      expect(recipe?.inputFoodIds).toHaveLength(1);
      expect(getFoodInfo(recipe?.inputFoodIds[0] ?? '')?.process).toBeNull();
    }
  });

  it('uses the specified difficulties without repeats through stage 9', () => {
    const goals = Array.from({ length: 9 }, (_, index) =>
      getStageGoal({ seed: 'daily', stageNumber: index + 1 }),
    );

    expect(goals.map((goal) => goal.difficulty)).toEqual([
      1, 1, 1, 2, 1, 2, 3, 2, 3,
    ]);
    expect(new Set(goals.map((goal) => goal.targetFoodId)).size).toBe(9);
  });

  it('excludes single storage ingredient recipes for stage 3', () => {
    const goal = getStageGoal({ seed: 'daily', stageNumber: 3 });
    const recipe = getRecipes().find(
      (candidate) => candidate.outputFoodId === goal.targetFoodId,
    );

    expect(recipe).toBeDefined();
    expect(
      recipe?.inputFoodIds.length === 1 &&
        getFoodInfo(recipe.inputFoodIds[0]!)?.process === null,
    ).toBe(false);
  });

  it('uses difficulty 3 for every third stage from stage 10', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 12 }).difficulty).toBe(3);
  });

  it('allows stage 10 and later goals to repeat an earlier food', () => {
    const hasRepeatedGoal = Array.from({ length: 100 }, (_, index) => {
      const seed = `repeat-${index}`;
      const earlierFoodIds = new Set(
        Array.from(
          { length: 9 },
          (_, stageIndex) =>
            getStageGoal({ seed, stageNumber: stageIndex + 1 }).targetFoodId,
        ),
      );

      return earlierFoodIds.has(
        getStageGoal({ seed, stageNumber: 10 }).targetFoodId,
      );
    }).some(Boolean);

    expect(hasRepeatedGoal).toBe(true);
  });

  it('increases required efficiency by 5 per stage except multiples of five', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 1 })).toMatchObject({
      requiredEfficiency: 5,
    });
    expect(getStageGoal({ seed: 'daily', stageNumber: 4 })).toMatchObject({
      requiredEfficiency: 20,
    });
    expect(getStageGoal({ seed: 'daily', stageNumber: 6 })).toMatchObject({
      requiredEfficiency: 30,
    });
  });

  it('requires efficiency of 10 for stage numbers that are multiples of five', () => {
    expect(getStageGoal({ seed: 'daily', stageNumber: 5 })).toMatchObject({
      requiredEfficiency: 10,
    });
    expect(getStageGoal({ seed: 'daily', stageNumber: 10 })).toMatchObject({
      requiredEfficiency: 10,
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
