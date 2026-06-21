import type { FoodInfoData } from '../food.ts';

export const toastFoodInfo = {
  id: 'toast',
  name: 'トースト',
  ingredientIds: ['bread'],
  process: 'heating',
  canSpawnFromStorage: false,
  canBeServed: true,
  canBeIngredient: true,
  difficulty: 1,
} as const satisfies FoodInfoData;
