import type { FoodId, FoodInfoData } from './food.ts';
import { allFoodInfos } from './food-data/all-foods.ts';

export const foodInfos = allFoodInfos;

export function getFoodInfo(id: FoodId) {
  return foodInfos.find((food) => food.id === id) ?? null;
}

export function getIngredientNames(food: FoodInfoData) {
  return food.ingredientIds.map((id) => getFoodInfo(id)?.name ?? id);
}

export function getProcessedIntoNames(foodId: FoodId) {
  return foodInfos
    .filter((food) =>
      (food.ingredientIds as readonly FoodId[]).includes(foodId),
    )
    .map((food) => food.name);
}
