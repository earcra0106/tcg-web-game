import type { CookingProcess, FoodId, FoodInfoData } from './food.ts';
import { foodInfos } from './foods.ts';
import type { MachineId } from './machine.ts';

export type FoodRecipe = {
  id: FoodId;
  name: string;
  process: CookingProcess;
  inputFoodIds: readonly FoodId[];
  outputFoodId: FoodId;
  outputFood: FoodInfoData;
  canBeServed: boolean;
  difficulty: FoodInfoData['difficulty'];
};

export type RecipeSearchInput = {
  machineId: MachineId;
  inputFoodIds: readonly FoodId[];
  recipeId?: FoodId | null;
  recipes?: readonly FoodRecipe[];
};

export const machineProcessMap = {
  storage: null,
  shipping: null,
  splitter: null,
  merger: null,
  cutter: 'cutting',
  heater: 'heating',
  mixer: 'mixing',
  combiner: 'combining',
  'trash-bin': null,
} as const satisfies Record<MachineId, CookingProcess | null>;

export function getProcessForMachine(machineId: MachineId) {
  return machineProcessMap[machineId];
}

export function normalizeFoodIds(foodIds: readonly FoodId[]) {
  return [...foodIds].sort((left, right) => left.localeCompare(right));
}

function hasSameInputs(
  leftFoodIds: readonly FoodId[],
  rightFoodIds: readonly FoodId[],
) {
  const left = normalizeFoodIds(leftFoodIds);
  const right = normalizeFoodIds(rightFoodIds);

  return (
    left.length === right.length &&
    left.every((foodId, index) => foodId === right[index])
  );
}

export function getRecipes(
  sourceFoodInfos: readonly FoodInfoData[] = foodInfos,
): readonly FoodRecipe[] {
  return sourceFoodInfos
    .filter((food): food is FoodInfoData & { process: CookingProcess } => {
      return food.process !== null;
    })
    .map((food) => ({
      id: food.id,
      name: food.name,
      process: food.process,
      inputFoodIds: food.ingredientIds,
      outputFoodId: food.id,
      outputFood: food,
      canBeServed: food.canBeServed,
      difficulty: food.difficulty,
    }));
}

export function getServableRecipes(recipes = getRecipes()) {
  return recipes.filter((recipe) => recipe.canBeServed);
}

export function findRecipeByOutput(
  outputFoodId: FoodId,
  recipes = getRecipes(),
) {
  return recipes.find((recipe) => recipe.outputFoodId === outputFoodId) ?? null;
}

export function findRecipesByProcess(
  process: CookingProcess,
  recipes = getRecipes(),
) {
  return recipes.filter((recipe) => recipe.process === process);
}

export function findRecipesForMachine(
  machineId: MachineId,
  recipes = getRecipes(),
) {
  const process = getProcessForMachine(machineId);

  if (process === null) {
    return [];
  }

  return findRecipesByProcess(process, recipes);
}

export function findCookableRecipe({
  machineId,
  inputFoodIds,
  recipeId = null,
  recipes = getRecipes(),
}: RecipeSearchInput) {
  const process = getProcessForMachine(machineId);

  if (process === null) {
    return null;
  }

  const processRecipes = recipes.filter((recipe) => recipe.process === process);

  if (recipeId !== null) {
    const recipe = processRecipes.find(
      (candidate) => candidate.id === recipeId,
    );

    return recipe !== undefined &&
      hasSameInputs(recipe.inputFoodIds, inputFoodIds)
      ? recipe
      : null;
  }

  return (
    processRecipes.find((recipe) =>
      hasSameInputs(recipe.inputFoodIds, inputFoodIds),
    ) ?? null
  );
}
