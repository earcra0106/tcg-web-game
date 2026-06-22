import type { FoodId } from './food.ts';
import { getFoodInfo } from './foods.ts';
import { findRecipeByOutput } from './recipes.ts';
import type { StageGoal } from './stageGoals.ts';

export function getSpawnableIngredientsForFood(
  foodId: FoodId,
  seen = new Set<FoodId>(),
): readonly FoodId[] {
  if (seen.has(foodId)) {
    return [];
  }

  seen.add(foodId);

  const food = getFoodInfo(foodId);

  if (food === null) {
    return [];
  }

  if (food.canSpawnFromStorage) {
    return [foodId];
  }

  const recipe = findRecipeByOutput(foodId);

  if (recipe === null) {
    return [];
  }

  return recipe.inputFoodIds.flatMap((ingredientId) =>
    getSpawnableIngredientsForFood(ingredientId, seen),
  );
}

function uniqueFoodIds(foodIds: readonly FoodId[]) {
  return [...new Set(foodIds)];
}

export function getStorageFoodIdsForGoals(goals: readonly StageGoal[]) {
  return uniqueFoodIds(
    goals.flatMap((goal) => getSpawnableIngredientsForFood(goal.targetFoodId)),
  );
}

export function getShippingFoodIdsForGoals(goals: readonly StageGoal[]) {
  return uniqueFoodIds(goals.map((goal) => goal.targetFoodId));
}
