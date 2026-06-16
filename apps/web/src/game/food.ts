export type FoodId = string;

export type FoodModelId = string;

export type CookingProcess = 'cutting' | 'heating' | 'mixing' | 'combining';

export type FoodDifficulty = 1 | 2 | 3;

export type FoodGameData = {
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

export type Vector3Tuple = readonly [number, number, number];

export type FoodModelPrimitiveKind =
  | 'box'
  | 'roundedBox'
  | 'sphere'
  | 'cylinder'
  | 'cone';

export type FoodModelMaterialData = {
  id: string;
  color: `#${string}`;
  roughness?: number;
  metalness?: number;
};

export type FoodModelPartData = {
  id: string;
  primitive: FoodModelPrimitiveKind;
  materialId: FoodModelMaterialData['id'];
  position: Vector3Tuple;
  scale: Vector3Tuple;
  rotation?: Vector3Tuple;
};

export type FoodModelData = {
  id: FoodModelId;
  name: string;
  bounds: Vector3Tuple;
  materials: readonly FoodModelMaterialData[];
  parts: readonly FoodModelPartData[];
};
