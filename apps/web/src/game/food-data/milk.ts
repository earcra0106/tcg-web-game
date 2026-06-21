import type { FoodInfoData } from '../food.ts';

export const milkFoodInfo = {
  id: 'milk',
  name: '牛乳',
  ingredientIds: [],
  process: null,
  canSpawnFromStorage: true,
  canBeServed: false,
  canBeIngredient: true,
  difficulty: null,
} as const satisfies FoodInfoData;
