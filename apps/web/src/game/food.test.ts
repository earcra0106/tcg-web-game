import { describe, expect, it } from 'vitest';
import type { FoodInfoData } from './food.ts';
import {
  foodInfos,
  getIngredientNames,
  getProcessedIntoNames,
} from './foods.ts';
import { foodSpritesheetData, getFoodSpriteFrame } from './foodSprites.ts';

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
      spriteId: 'hamburg',
    };

    expect(hamburg).toMatchObject({
      id: 'hamburg',
      process: 'heating',
      canBeServed: true,
      spriteId: 'hamburg',
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
      spriteId: 'bread',
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
        spriteId: id,
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
        spriteId: expected.id,
      });
    });
  });

  it('assigns sprites to all registered foods', () => {
    foodInfos.forEach((food) => {
      expect(getFoodSpriteFrame(food.spriteId)).toMatchObject({
        id: food.spriteId,
        width: 128,
        height: 128,
      });
    });
  });

  it('maps current foods to the requirement-order sprite cells', () => {
    expect(getFoodSpriteFrame('rice')).toMatchObject({ row: 0, column: 0 });
    expect(getFoodSpriteFrame('egg')).toMatchObject({ row: 0, column: 1 });
    expect(getFoodSpriteFrame('milk')).toMatchObject({ row: 0, column: 2 });
    expect(getFoodSpriteFrame('bread')).toMatchObject({ row: 0, column: 3 });
    expect(getFoodSpriteFrame('boiled-egg')).toMatchObject({
      row: 2,
      column: 7,
    });
    expect(getFoodSpriteFrame('cooked-rice')).toMatchObject({
      row: 3,
      column: 2,
    });
    expect(getFoodSpriteFrame('toast')).toMatchObject({ row: 3, column: 3 });
    expect(getFoodSpriteFrame('fried-egg')).toMatchObject({
      row: 3,
      column: 4,
    });
  });

  it('provides PixiJS spritesheet data for the food spritesheet', () => {
    expect(foodSpritesheetData.meta).toMatchObject({
      image: '/assets/sprites/foods.png',
      size: { w: 1024, h: 1024 },
    });
    expect(foodSpritesheetData.frames['bread.png']?.frame).toEqual({
      x: 384,
      y: 0,
      w: 128,
      h: 128,
    });
  });
});
