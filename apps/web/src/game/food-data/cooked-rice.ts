import type { FoodInfoData } from '../food.ts';

export const cookedRiceFoodInfo = {
  id: 'cooked-rice',
  name: 'ごはん',
  ingredientIds: ['rice'],
  process: 'heating',
  canSpawnFromStorage: false,
  canBeServed: true,
  canBeIngredient: true,
  difficulty: 1,
} as const satisfies FoodInfoData;
