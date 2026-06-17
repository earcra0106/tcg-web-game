import type { FoodId, FoodInfoData, FoodModelData } from './food.ts';
import { boiledEggFoodInfo } from './food-data/boiled-egg.ts';
import { breadFoodInfo } from './food-data/bread.ts';
import { cookedRiceFoodInfo } from './food-data/cooked-rice.ts';
import { eggFoodInfo } from './food-data/egg.ts';
import { friedEggFoodInfo } from './food-data/fried-egg.ts';
import { milkFoodInfo } from './food-data/milk.ts';
import { riceFoodInfo } from './food-data/rice.ts';
import { toastFoodInfo } from './food-data/toast.ts';
import { boiledEggFoodModel } from './food3dmodels/boiled-egg.ts';
import { breadFoodModel } from './food3dmodels/bread.ts';
import { cookedRiceFoodModel } from './food3dmodels/cooked-rice.ts';
import { eggFoodModel } from './food3dmodels/egg.ts';
import { friedEggFoodModel } from './food3dmodels/fried-egg.ts';
import { milkFoodModel } from './food3dmodels/milk.ts';
import { riceFoodModel } from './food3dmodels/rice.ts';
import { toastFoodModel } from './food3dmodels/toast.ts';

export const foodInfos = [
  breadFoodInfo,
  riceFoodInfo,
  eggFoodInfo,
  milkFoodInfo,
  cookedRiceFoodInfo,
  toastFoodInfo,
  friedEggFoodInfo,
  boiledEggFoodInfo,
] as const satisfies readonly FoodInfoData[];

export const foodModels = [
  breadFoodModel,
  riceFoodModel,
  eggFoodModel,
  milkFoodModel,
  cookedRiceFoodModel,
  toastFoodModel,
  friedEggFoodModel,
  boiledEggFoodModel,
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
