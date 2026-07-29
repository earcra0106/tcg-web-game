import type { FoodDifficulty, FoodId } from './food.ts';
import { STAGE_GOAL_EFFICIENCY_SETTINGS } from './efficiencySettings.ts';
import { createSeededRandom } from './random.ts';
import { getServableRecipes, type FoodRecipe } from './recipes.ts';
import { getFoodInfo } from './foods.ts';

export type StageGoal = {
  stageNumber: number;
  targetFoodId: FoodId;
  targetFoodName: string;
  difficulty: FoodDifficulty;
  requiredEfficiency: number;
};

export type StageGoalInput = {
  seed: string;
  stageNumber: number;
  recipes?: readonly FoodRecipe[];
};

function assertStageNumber(stageNumber: number) {
  if (!Number.isInteger(stageNumber) || stageNumber < 1) {
    throw new RangeError('stageNumber must be a positive integer');
  }
}

function calculateRequiredEfficiency(stageNumber: number) {
  const { requiredPerStage, multipleOfFive } = STAGE_GOAL_EFFICIENCY_SETTINGS;

  return stageNumber % 5 === 0 ? multipleOfFive : requiredPerStage;
}

function getStageGoalCandidateRule(stageNumber: number) {
  if (stageNumber === 1 || stageNumber === 2) {
    return {
      difficulties: [1] as const,
      requiresSingleStorageIngredient: true,
      excludesSingleStorageIngredient: false,
    };
  }

  const introDifficulties: Partial<Record<number, FoodDifficulty>> = {
    3: 1,
    4: 2,
    5: 1,
    6: 2,
    7: 3,
    8: 2,
    9: 3,
  };
  const introDifficulty = introDifficulties[stageNumber];

  if (introDifficulty !== undefined) {
    return {
      difficulties: [introDifficulty] as const,
      requiresSingleStorageIngredient: false,
      excludesSingleStorageIngredient: stageNumber === 3,
    };
  }

  return {
    difficulties: (stageNumber % 3 === 0
      ? [3]
      : [1, 2, 3]) as readonly FoodDifficulty[],
    requiresSingleStorageIngredient: false,
    excludesSingleStorageIngredient: false,
  };
}

function isSingleStorageIngredientRecipe(recipe: FoodRecipe) {
  if (recipe.inputFoodIds.length !== 1) {
    return false;
  }

  const ingredient = getFoodInfo(recipe.inputFoodIds[0]!);

  return ingredient !== null && ingredient.process === null;
}

function selectRecipe({
  seed,
  stageNumber,
  recipes,
  excludedFoodIds,
}: {
  seed: string;
  stageNumber: number;
  recipes: readonly FoodRecipe[];
  excludedFoodIds: ReadonlySet<FoodId>;
}) {
  const rule = getStageGoalCandidateRule(stageNumber);
  const candidates = recipes.filter(
    (recipe) =>
      recipe.difficulty !== null &&
      rule.difficulties.includes(recipe.difficulty) &&
      !excludedFoodIds.has(recipe.outputFoodId) &&
      (!rule.requiresSingleStorageIngredient ||
        isSingleStorageIngredientRecipe(recipe)) &&
      (!rule.excludesSingleStorageIngredient ||
        !isSingleStorageIngredientRecipe(recipe)),
  );
  const recipe = createSeededRandom(seed, stageNumber).pick(candidates);

  if (recipe === null) {
    throw new Error('No servable recipes are available for stage goals');
  }

  return recipe;
}

function toStageGoal(stageNumber: number, recipe: FoodRecipe): StageGoal {
  if (recipe.difficulty === null) {
    throw new Error(`Stage goal recipe must have difficulty: ${recipe.id}`);
  }

  return {
    stageNumber,
    targetFoodId: recipe.outputFoodId,
    targetFoodName: recipe.name,
    difficulty: recipe.difficulty,
    requiredEfficiency: calculateRequiredEfficiency(stageNumber),
  };
}

export function getStageGoal({
  seed,
  stageNumber,
  recipes,
}: StageGoalInput): StageGoal {
  assertStageNumber(stageNumber);

  const servableRecipes = getServableRecipes(recipes);
  const selectedFoodIds = new Set<FoodId>();
  let selectedRecipe: FoodRecipe | null = null;

  for (
    let currentStageNumber = 1;
    currentStageNumber <= stageNumber;
    currentStageNumber += 1
  ) {
    const recipe = selectRecipe({
      seed,
      stageNumber: currentStageNumber,
      recipes: servableRecipes,
      excludedFoodIds: currentStageNumber <= 9 ? selectedFoodIds : new Set(),
    });

    if (currentStageNumber <= 9) {
      selectedFoodIds.add(recipe.outputFoodId);
    }

    selectedRecipe = recipe;
  }

  return toStageGoal(stageNumber, selectedRecipe!);
}
