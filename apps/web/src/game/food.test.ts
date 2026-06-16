import { describe, expect, it } from 'vitest';
import type { FoodInfoData, FoodModelData } from './food.ts';
import {
  foodInfos,
  foodModels,
  getIngredientNames,
  getProcessedIntoNames,
} from './foods.ts';

describe('food data types', () => {
  it('describes food info data', () => {
    const hamburg: FoodInfoData = {
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
      schemaVersion: 'food-model-v1',
      id: 'hamburg',
      displayName: 'ハンバーグ',
      category: 'dish',
      frontDirection: '-Z',
      unitScale: 1,
      bounds: { size: [2.4, 0.5, 2], center: [0, 0.25, 0] },
      parts: [
        {
          id: 'plate',
          shape: 'cylinder',
          position: [0, 0, 0],
          size: [1.2, 0.08, 1],
          rotation: [0, 0, 0],
          color: '#F8FAFC',
        },
        {
          id: 'patty',
          shape: 'cylinder',
          position: [0, 0.16, 0],
          size: [0.75, 0.22, 0.6],
          rotation: [0, 0, 0],
          color: '#7C2D12',
        },
        {
          id: 'sauce',
          shape: 'cylinder',
          position: [0.05, 0.3, -0.02],
          size: [0.55, 0.04, 0.32],
          rotation: [0, 0, 0],
          color: '#B91C1C',
        },
      ],
      designNotes: ['円柱の重なりで皿と肉を表す。'],
    };

    expect(hamburgModel.parts.map((part) => part.shape)).toEqual([
      'cylinder',
      'cylinder',
      'cylinder',
    ]);
    expect(hamburgModel.parts[2]?.size).toEqual([0.55, 0.04, 0.32]);
  });

  it('registers bread as a basic ingredient with a model', () => {
    const bread = foodInfos.find((food) => food.id === 'bread');
    const breadModel = foodModels.find((model) => model.id === 'bread');

    expect(bread).toMatchObject({
      name: '食パン',
      ingredientIds: [],
      canSpawnFromStorage: true,
      canBeServed: false,
      canBeIngredient: true,
      modelId: 'bread',
    });
    expect(breadModel).toMatchObject({
      schemaVersion: 'food-model-v1',
      displayName: '食パン',
      category: 'ingredient',
      frontDirection: '-Z',
    });
    expect(breadModel?.parts.length).toBeGreaterThan(0);
  });

  it('resolves bread processing sources and targets', () => {
    const bread = foodInfos.find((food) => food.id === 'bread');

    expect(bread).toBeDefined();
    expect(getIngredientNames(bread!)).toEqual([]);
    expect(getProcessedIntoNames('bread')).toEqual([]);
  });
});
