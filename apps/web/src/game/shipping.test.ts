import { describe, expect, it } from 'vitest';
import {
  calculateShippingEfficiency,
  isStageGoalCleared,
  recordShipment,
  type ShipmentRecord,
} from './shipping.ts';
import type { StageGoal } from './stageGoals.ts';

const history: readonly ShipmentRecord[] = [
  { itemId: 'item-1', foodId: 'cooked-rice', shippedAtMs: 10_000 },
  { itemId: 'item-2', foodId: 'toast', shippedAtMs: 20_000 },
  { itemId: 'item-3', foodId: 'cooked-rice', shippedAtMs: 50_000 },
];

describe('shipping', () => {
  it('records shipment history', () => {
    expect(
      recordShipment([], {
        itemId: 'item-1',
        foodId: 'toast',
        shippedAtMs: 500,
      }),
    ).toEqual([
      {
        itemId: 'item-1',
        foodId: 'toast',
        shippedAtMs: 500,
      },
    ]);
  });

  it('calculates target food efficiency within the time window', () => {
    expect(
      calculateShippingEfficiency({
        history,
        targetFoodId: 'cooked-rice',
        nowMs: 60_000,
        windowMs: 60_000,
      }),
    ).toBe(2);
  });

  it('clears only when target food efficiency reaches the goal', () => {
    const goal: StageGoal = {
      stageNumber: 1,
      targetFoodId: 'cooked-rice',
      targetFoodName: 'ごはん',
      difficulty: 1,
      requiredEfficiency: 2,
    };

    expect(
      isStageGoalCleared({
        history,
        goal,
        nowMs: 60_000,
        windowMs: 60_000,
      }),
    ).toBe(true);

    expect(
      isStageGoalCleared({
        history,
        goal: {
          ...goal,
          targetFoodId: 'toast',
        },
        nowMs: 60_000,
        windowMs: 60_000,
      }),
    ).toBe(false);
  });
});
