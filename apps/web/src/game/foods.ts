import type { FoodId, FoodInfoData, FoodModelData } from './food.ts';
import { breadFoodInfo } from './food-data/bread.ts';
import { breadFoodModel } from './food3dmodels/bread.ts';

export const foodInfos = [
  breadFoodInfo,
] as const satisfies readonly FoodInfoData[];

export const foodModels = [
  breadFoodModel,
] as const satisfies readonly FoodModelData[];

export function getFoodInfo(id: FoodId) {
  return foodInfos.find((food) => food.id === id) ?? null;
}

export function getFoodModel(id: FoodId) {
  return foodModels.find((model) => model.id === id) ?? null;
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
