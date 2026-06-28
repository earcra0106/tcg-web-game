import { describe, expect, it } from 'vitest';
import {
  getCraftableFoodIds,
  getShippingFoodIdsForGoals,
  getSpawnableIngredientsForFood,
  getStorageFoodIdsForGoals,
} from './stageTools.ts';
import { getStageGoal, type StageGoal } from './stageGoals.ts';

function goal(stageNumber: number, targetFoodId: StageGoal['targetFoodId']) {
  return {
    ...getStageGoal({ seed: 'daily', stageNumber }),
    targetFoodId,
  };
}

describe('stage tools', () => {
  it('finds every food craftable from unlocked storage foods', () => {
    const craftableFoodIds = getCraftableFoodIds(['lettuce', 'tomato']);

    expect(craftableFoodIds).toEqual(
      expect.arrayContaining([
        'chopped-lettuce',
        'sliced-tomato',
        'tomato-sauce',
        'salad',
      ]),
    );
    expect(craftableFoodIds).not.toContain('toast');
  });

  it('resolves recipes repeatedly for multi-step foods', () => {
    expect(getCraftableFoodIds(['potato', 'carrot'])).toEqual(
      expect.arrayContaining(['cut-potato', 'chopped-carrot', 'potato-salad']),
    );
  });

  it('resolves salad to spawnable storage ingredients', () => {
    expect(getSpawnableIngredientsForFood('salad')).toEqual([
      'lettuce',
      'tomato',
    ]);
  });

  it('keeps storage ingredients available across cumulative goals', () => {
    expect(
      getStorageFoodIdsForGoals([
        goal(1, 'cooked-rice'),
        goal(2, 'toast'),
        goal(3, 'salad'),
      ]),
    ).toEqual(['rice', 'bread', 'lettuce', 'tomato']);
  });

  it('keeps shipping targets available across cumulative goals', () => {
    expect(
      getShippingFoodIdsForGoals([
        goal(1, 'cooked-rice'),
        goal(2, 'toast'),
        goal(3, 'salad'),
      ]),
    ).toEqual(['cooked-rice', 'toast', 'salad']);
  });
});
