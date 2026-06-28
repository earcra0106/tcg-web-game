import type { FoodDifficulty, FoodId } from './food.ts';
import {
  EFFICIENCY_UNIT_MS,
  STAGE_GOAL_EFFICIENCY_SETTINGS,
} from './efficiencySettings.ts';
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
  const {
    introBasePerMinute,
    laterBasePerMinute,
    increasePerMinute,
    stagesPerIncrease,
    maximumPerMinute,
  } = STAGE_GOAL_EFFICIENCY_SETTINGS;
  const introEfficiencyPerMinute =
    introBasePerMinute + stageNumber * increasePerMinute;
  const scaledEfficiencyPerMinute =
    laterBasePerMinute +
    Math.floor((stageNumber - 1) / stagesPerIncrease) * increasePerMinute;
  const efficiencyPerMinute = Math.min(
    maximumPerMinute,
    stageNumber <= 4 ? introEfficiencyPerMinute : scaledEfficiencyPerMinute,
  );
  const efficiency = efficiencyPerMinute * (EFFICIENCY_UNIT_MS / 60_000);

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
