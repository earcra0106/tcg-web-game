import type { FoodInfoData } from '../food.ts';

export const breadFoodInfo = {
  id: 'bread',
  name: '食パン',
  ingredientIds: [],
  process: null,
  canSpawnFromStorage: true,
  canBeServed: false,
  canBeIngredient: true,
  difficulty: null,
  spriteId: 'bread',
} as const satisfies FoodInfoData;
