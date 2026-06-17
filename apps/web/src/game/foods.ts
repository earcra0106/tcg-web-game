import type { FoodId, FoodInfoData, FoodModelData } from './food.ts';
import { breadFoodInfo } from './food-data/bread.ts';
import { eggFoodInfo } from './food-data/egg.ts';
import { milkFoodInfo } from './food-data/milk.ts';
import { riceFoodInfo } from './food-data/rice.ts';
import { breadFoodModel } from './food3dmodels/bread.ts';
import { eggFoodModel } from './food3dmodels/egg.ts';
import { milkFoodModel } from './food3dmodels/milk.ts';
import { riceFoodModel } from './food3dmodels/rice.ts';

export const foodInfos = [
  breadFoodInfo,
  riceFoodInfo,
  eggFoodInfo,
  milkFoodInfo,
] as const satisfies readonly FoodInfoData[];

export const foodModels = [
  breadFoodModel,
  riceFoodModel,
  eggFoodModel,
  milkFoodModel,
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
