export type FoodId = string;

export type FoodSpriteId = string;

export type CookingProcess = 'cutting' | 'heating' | 'mixing' | 'combining';

export type FoodDifficulty = 1 | 2 | 3;

export type FoodInfoData = {
  id: FoodId;
  name: string;
  ingredientIds: readonly FoodId[];
  process: CookingProcess | null;
  canSpawnFromStorage: boolean;
  canBeServed: boolean;
  canBeIngredient: boolean;
  difficulty: FoodDifficulty | null;
  spriteId: FoodSpriteId;
};

export type FoodGameData = FoodInfoData;
