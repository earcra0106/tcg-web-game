import type { FoodInfoData } from '../food.ts';

export const boiledEggFoodInfo = {
  id: 'boiled-egg',
  name: 'ゆで卵',
  ingredientIds: ['egg'],
  process: 'heating',
  canSpawnFromStorage: false,
  canBeServed: false,
  canBeIngredient: true,
  difficulty: null,
  modelId: 'boiled-egg',
} as const satisfies FoodInfoData;
