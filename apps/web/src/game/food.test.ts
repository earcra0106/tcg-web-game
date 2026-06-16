import { describe, expect, it } from 'vitest';
import type { FoodGameData, FoodModelData } from './food.ts';

describe('food data types', () => {
  it('describes food game data', () => {
    const hamburg: FoodGameData = {
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
    };

    expect(hamburg).toMatchObject({
      id: 'hamburg',
      process: 'heating',
      canBeServed: true,
      modelId: 'hamburg',
    });
  });

  it('describes a food model as primitive parts', () => {
    const hamburgModel: FoodModelData = {
      id: 'hamburg',
      name: 'ハンバーグ',
      bounds: [2.4, 0.5, 2],
      materials: [
        { id: 'plate', color: '#f8fafc', roughness: 0.35 },
        { id: 'meat', color: '#7c2d12', roughness: 0.85 },
        { id: 'sauce', color: '#b91c1c', roughness: 0.6 },
      ],
      parts: [
        {
          id: 'plate',
          primitive: 'cylinder',
          materialId: 'plate',
          position: [0, 0, 0],
          scale: [1.2, 0.08, 1],
        },
        {
          id: 'patty',
          primitive: 'cylinder',
          materialId: 'meat',
          position: [0, 0.16, 0],
          scale: [0.75, 0.22, 0.6],
        },
        {
          id: 'sauce',
          primitive: 'cylinder',
          materialId: 'sauce',
          position: [0.05, 0.3, -0.02],
          scale: [0.55, 0.04, 0.32],
        },
      ],
    };

    expect(hamburgModel.parts.map((part) => part.primitive)).toEqual([
      'cylinder',
      'cylinder',
      'cylinder',
    ]);
    expect(hamburgModel.parts[2]?.scale).toEqual([0.55, 0.04, 0.32]);
  });
});
