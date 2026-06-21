import type { FoodDifficulty, FoodId } from './food.ts';
import { createSeededRandom } from './random.ts';
import {
  findRecipeByOutput,
  getServableRecipes,
  type FoodRecipe,
} from './recipes.ts';

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

const introTargetFoodIds = [
  'cooked-rice',
  'toast',
  'salad',
  'potato-salad',
] as const satisfies readonly FoodId[];

function assertStageNumber(stageNumber: number) {
  if (!Number.isInteger(stageNumber) || stageNumber < 1) {
    throw new RangeError('stageNumber must be a positive integer');
  }
}

function calculateRequiredEfficiency(stageNumber: number) {
  const introEfficiency = 0.55 + stageNumber * 0.05;
  const scaledEfficiency = 0.65 + Math.floor((stageNumber - 1) / 3) * 0.05;
  const efficiency = Math.min(
    0.95,
    stageNumber <= 4 ? introEfficiency : scaledEfficiency,
  );

  return Math.round(efficiency * 100) / 100;
}

function calculateMaxDifficulty(stageNumber: number): FoodDifficulty {
  if (stageNumber >= 11) {
    return 3;
  }

  if (stageNumber >= 6) {
    return 2;
  }

  return 1;
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
  const introTargetFoodId = introTargetFoodIds[stageNumber - 1];

  if (introTargetFoodId !== undefined) {
    const introRecipe = findRecipeByOutput(introTargetFoodId, servableRecipes);

    if (introRecipe !== null) {
      return toStageGoal(stageNumber, introRecipe);
    }
  }

  const maxDifficulty = calculateMaxDifficulty(stageNumber);
  const candidates = servableRecipes.filter(
    (recipe) =>
      recipe.difficulty !== null && recipe.difficulty <= maxDifficulty,
  );
  const random = createSeededRandom(seed, stageNumber);
  const recipe = random.pick(candidates);

  if (recipe === null) {
    throw new Error('No servable recipes are available for stage goals');
  }

  return toStageGoal(stageNumber, recipe);
}
