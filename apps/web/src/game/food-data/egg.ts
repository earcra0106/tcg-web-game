import type { FoodInfoData } from '../food.ts';

export const eggFoodInfo = {
  id: 'egg',
  name: '卵',
  ingredientIds: [],
  process: null,
  canSpawnFromStorage: true,
  canBeServed: false,
  canBeIngredient: true,
  difficulty: null,
  modelId: 'egg',
} as const satisfies FoodInfoData;
