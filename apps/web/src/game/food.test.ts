import { describe, expect, it } from 'vitest';
import type { FoodInfoData } from './food.ts';
import {
  foodInfos,
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
    };

    expect(hamburg).toMatchObject({
      id: 'hamburg',
      process: 'heating',
      canBeServed: true,
    });
  });

  it('registers bread as a basic ingredient', () => {
    const bread = foodInfos.find((food) => food.id === 'bread');

    expect(bread).toMatchObject({
      name: '食パン',
      ingredientIds: [],
      canSpawnFromStorage: true,
      canBeServed: false,
      canBeIngredient: true,
    });
  });

  it('registers rice, egg, and milk as basic ingredients', () => {
    const basicIngredients = [
      { id: 'rice', name: '米' },
      { id: 'egg', name: '卵' },
      { id: 'milk', name: '牛乳' },
    ] as const;

    basicIngredients.forEach(({ id, name }) => {
      const food = foodInfos.find((item) => item.id === id);

      expect(food).toMatchObject({
        id,
        name,
        ingredientIds: [],
        process: null,
        canSpawnFromStorage: true,
        canBeServed: false,
        canBeIngredient: true,
        difficulty: null,
      });
    });
  });

  it('resolves bread processing sources and targets', () => {
    const bread = foodInfos.find((food) => food.id === 'bread');

    expect(bread).toBeDefined();
    expect(getIngredientNames(bread!)).toEqual([]);
    expect(getProcessedIntoNames('bread')).toEqual(['トースト']);
  });

  it('registers all foods craftable from the current basic ingredients', () => {
    const craftableFoods = [
      {
        id: 'cooked-rice',
        name: 'ごはん',
        ingredientIds: ['rice'],
        process: 'heating',
        canBeServed: true,
        canBeIngredient: true,
        difficulty: 1,
        category: 'dish',
      },
      {
        id: 'toast',
        name: 'トースト',
        ingredientIds: ['bread'],
        process: 'heating',
        canBeServed: true,
        canBeIngredient: true,
        difficulty: 1,
        category: 'dish',
      },
      {
        id: 'fried-egg',
        name: '目玉焼き',
        ingredientIds: ['egg'],
        process: 'heating',
        canBeServed: true,
        canBeIngredient: true,
        difficulty: 1,
        category: 'dish',
      },
      {
        id: 'boiled-egg',
        name: 'ゆで卵',
        ingredientIds: ['egg'],
        process: 'heating',
        canBeServed: false,
        canBeIngredient: true,
        difficulty: null,
        category: 'intermediate',
      },
    ] as const;

    craftableFoods.forEach((expected) => {
      const food = foodInfos.find((item) => item.id === expected.id);

      expect(food).toMatchObject({
        id: expected.id,
        name: expected.name,
        ingredientIds: expected.ingredientIds,
        process: expected.process,
        canSpawnFromStorage: false,
        canBeServed: expected.canBeServed,
        canBeIngredient: expected.canBeIngredient,
        difficulty: expected.difficulty,
      });
    });
  });
});
