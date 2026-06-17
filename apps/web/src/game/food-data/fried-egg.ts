import type { FoodInfoData } from '../food.ts';

export const friedEggFoodInfo = {
  id: 'fried-egg',
  name: '目玉焼き',
  ingredientIds: ['egg'],
  process: 'heating',
  canSpawnFromStorage: false,
  canBeServed: true,
  canBeIngredient: true,
  difficulty: 1,
  modelId: 'fried-egg',
} as const satisfies FoodInfoData;
