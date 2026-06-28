import type { FoodId } from './food.ts';
import { getFoodInfo } from './foods.ts';
import { findRecipeByOutput, getRecipes, type FoodRecipe } from './recipes.ts';
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

export function getCraftableFoodIds(
  unlockedFoodIds: readonly FoodId[],
  recipes: readonly FoodRecipe[] = getRecipes(),
) {
  const craftableFoodIds = new Set(unlockedFoodIds);
  let didAddFood = true;

  while (didAddFood) {
    didAddFood = false;

    recipes.forEach((recipe) => {
      if (
        craftableFoodIds.has(recipe.outputFoodId) ||
        !recipe.inputFoodIds.every((foodId) => craftableFoodIds.has(foodId))
      ) {
        return;
      }

      craftableFoodIds.add(recipe.outputFoodId);
      didAddFood = true;
    });
  }

  return [...craftableFoodIds];
}
