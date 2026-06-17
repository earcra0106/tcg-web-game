import type { FoodModelData } from '../food.ts';

export const eggFoodModel = {
  schemaVersion: 'food-model-v1',
  id: 'egg',
  displayName: '卵',
  category: 'ingredient',
  frontDirection: '-Z',
  unitScale: 1,
  pivot: [0, 0.51, 0],
  bounds: { size: [0.78, 1.02, 0.72], center: [0, 0.51, 0] },
  parts: [
    {
      id: 'egg-body',
      shape: 'sphere',
      position: [0, 0.52, 0],
      size: [0.7, 0.94, 0.66],
      rotation: [0, 0, 0],
      color: '#F3E2C0',
      material: { roughness: 0.82, metalness: 0 },
      appearance: { radius: 0.14, segments: 8, flatShading: false },
    },
    {
      id: 'upper-pattern',
      shape: 'sphere',
      position: [0.08, 0.38, 0.04],
      size: [0.52, 0.54, 0.5],
      rotation: [0, 0, 0],
      color: '#E4C89E',
      material: { roughness: 0.86, metalness: 0 },
      appearance: { radius: 0.1, segments: 8, flatShading: false },
    },
    {
      id: 'lower-pattern',
      shape: 'sphere',
      position: [-0.08, 0.68, 0.04],
      size: [0.52, 0.54, 0.5],
      rotation: [0, 0, 0],
      color: '#E4C89E',
      material: { roughness: 0.86, metalness: 0 },
      appearance: { radius: 0.1, segments: 8, flatShading: false },
    },
  ],
  designNotes: [
    '縦長の淡い殻色の球体で、殻付き卵のシルエットを優先する。',
    '前面の小さなハイライトで丸みを読みやすくする。',
    '薄い底面影で、図鑑カード上でも接地感を出す。',
  ],
} as const satisfies FoodModelData;
