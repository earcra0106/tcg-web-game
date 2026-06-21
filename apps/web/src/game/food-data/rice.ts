import type { FoodInfoData } from '../food.ts';

export const riceFoodInfo = {
  id: 'rice',
  name: '米',
  ingredientIds: [],
  process: null,
  canSpawnFromStorage: true,
  canBeServed: false,
  canBeIngredient: true,
  difficulty: null,
} as const satisfies FoodInfoData;
