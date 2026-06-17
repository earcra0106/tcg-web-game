export type FoodId = string;

export type FoodModelId = string;

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
  modelId: FoodModelId;
};

export type FoodGameData = FoodInfoData;

export type Vector3Tuple = readonly [number, number, number];

export type FoodModelCategory =
  | 'ingredient'
  | 'cut-ingredient'
  | 'intermediate'
  | 'dish';

export type FoodModelShape =
  | 'roundedBox'
  | 'box'
  | 'cylinder'
  | 'cone'
  | 'hemisphere'
  | 'sphere'
  | 'capsule'
  | 'wedge'
  | 'fanWedge';

export type FoodModelMaterial = {
  roughness?: number;
  metalness?: 0;
  opacity?: number;
};

export type FoodModelAppearance = {
  radius?: number;
  bevel?: number;
  segments?: number;
  flatShading?: boolean;
};

export type FoodModelPart = {
  id: string;
  shape: FoodModelShape;
  position: Vector3Tuple;
  size: Vector3Tuple;
  rotation: Vector3Tuple;
  color: `#${string}`;
  material?: FoodModelMaterial;
  appearance?: FoodModelAppearance;
};

export type FoodModelData = {
  id: FoodModelId;
  schemaVersion: 'food-model-v1';
  displayName: string;
  category: FoodModelCategory;
  frontDirection: '-Z';
  unitScale: number;
  pivot: Vector3Tuple;
  bounds: {
    size: Vector3Tuple;
    center: Vector3Tuple;
  };
  parts: readonly FoodModelPart[];
  designNotes: readonly string[];
};
