import { describe, expect, it } from 'vitest';
import {
  advanceTransportingFoodItem,
  createFoodItem,
  createTransportingFoodItem,
} from './items.ts';

describe('food items', () => {
  it('creates a food item instance', () => {
    expect(
      createFoodItem({
        id: 'item-1',
        foodId: 'rice',
        createdAtMs: 120,
      }),
    ).toEqual({
      id: 'item-1',
      foodId: 'rice',
      createdAtMs: 120,
    });
  });

  it('creates and advances a transporting food item', () => {
    const item = createTransportingFoodItem(
      createFoodItem({
        id: 'item-1',
        foodId: 'rice',
        createdAtMs: 0,
      }),
      'connection-1',
      'storage-1',
      'heater-1',
    );

    expect(advanceTransportingFoodItem(item, 0.4)).toMatchObject({
      progress: 0.4,
    });
    expect(advanceTransportingFoodItem(item, 2)).toMatchObject({
      progress: 1,
    });
  });
});
