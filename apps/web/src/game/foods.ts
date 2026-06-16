import type { FoodId, FoodInfoData, FoodModelData } from './food.ts';

export const foodInfos = [
  {
    id: 'bread',
    name: '食パン',
    ingredientIds: [],
    process: null,
    canSpawnFromStorage: true,
    canBeServed: false,
    canBeIngredient: true,
    difficulty: null,
    modelId: 'bread',
  },
  {
    id: 'toast',
    name: 'トースト',
    ingredientIds: ['bread'],
    process: 'heating',
    canSpawnFromStorage: false,
    canBeServed: true,
    canBeIngredient: true,
    difficulty: 1,
    modelId: 'toast',
  },
  {
    id: 'egg-sandwich',
    name: '卵サンド',
    ingredientIds: ['bread', 'boiled-egg', 'chopped-lettuce'],
    process: 'combining',
    canSpawnFromStorage: false,
    canBeServed: true,
    canBeIngredient: false,
    difficulty: 2,
    modelId: 'egg-sandwich',
  },
  {
    id: 'tomato-cheese-sandwich',
    name: 'トマトチーズサンド',
    ingredientIds: ['bread', 'sliced-tomato', 'cheese'],
    process: 'combining',
    canSpawnFromStorage: false,
    canBeServed: true,
    canBeIngredient: false,
    difficulty: 2,
    modelId: 'tomato-cheese-sandwich',
  },
  {
    id: 'hamburg',
    name: 'ハンバーグ',
    ingredientIds: [
      'beef',
      'chopped-onion',
      'egg',
      'bread',
      'tomato-sauce',
      'milk',
    ],
    process: 'heating',
    canSpawnFromStorage: false,
    canBeServed: true,
    canBeIngredient: false,
    difficulty: 3,
    modelId: 'hamburg',
  },
] as const satisfies readonly FoodInfoData[];

export const foodModels = [
  {
    schemaVersion: 'food-model-v1',
    id: 'bread',
    displayName: '食パン',
    category: 'ingredient',
    frontDirection: '-Z',
    unitScale: 1,
    bounds: { size: [1.12, 1.08, 0.42], center: [0, 0.54, 0] },
    parts: [
      {
        id: 'crust-body',
        shape: 'roundedBox',
        position: [0, 0.54, 0],
        size: [1.08, 1.04, 0.36],
        rotation: [0, 0, 0],
        color: '#C8843E',
        material: { roughness: 0.88, metalness: 0 },
        appearance: { radius: 0.16, segments: 6, flatShading: false },
      },
      {
        id: 'soft-center',
        shape: 'roundedBox',
        position: [0, 0.54, -0.2],
        size: [0.84, 0.78, 0.06],
        rotation: [0, 0, 0],
        color: '#F3D28A',
        material: { roughness: 0.9, metalness: 0 },
        appearance: { radius: 0.12, segments: 6, flatShading: false },
      },
      {
        id: 'top-crumb-highlight',
        shape: 'roundedBox',
        position: [-0.18, 0.86, -0.24],
        size: [0.28, 0.08, 0.04],
        rotation: [0, 0, -0.12],
        color: '#F7DFA9',
        material: { roughness: 0.92, metalness: 0 },
        appearance: { radius: 0.03, segments: 4, flatShading: false },
      },
      {
        id: 'lower-crumb-highlight',
        shape: 'roundedBox',
        position: [0.22, 0.36, -0.24],
        size: [0.22, 0.06, 0.04],
        rotation: [0, 0, 0.16],
        color: '#F7DFA9',
        material: { roughness: 0.92, metalness: 0 },
        appearance: { radius: 0.03, segments: 4, flatShading: false },
      },
      {
        id: 'bottom-crust-shadow',
        shape: 'box',
        position: [0, 0.06, -0.21],
        size: [0.86, 0.05, 0.05],
        rotation: [0, 0, 0],
        color: '#A9652E',
        material: { roughness: 0.9, metalness: 0 },
        appearance: { radius: 0.02, segments: 4, flatShading: false },
      },
    ],
    designNotes: [
      '四角い一枚食パンとして読めるよう、厚めの耳と淡い中身を正面に置く。',
      '丸みのある外形で、温かいボクセル調の食材に見えるようにする。',
      '小さなハイライトでパンの柔らかい断面を表現する。',
    ],
  },
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
