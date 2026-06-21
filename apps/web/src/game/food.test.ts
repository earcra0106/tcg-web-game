import { describe, expect, it } from 'vitest';
import type { FoodInfoData } from './food.ts';
import {
  foodInfos,
  getIngredientNames,
  getProcessedIntoNames,
} from './foods.ts';
import { foodSpritesheetData, getFoodSpriteFrame } from './foodSprites.ts';

const expectedFoods = [
  ['rice', '米', [], null, true, false, true, null],
  ['egg', '卵', [], null, true, false, true, null],
  ['milk', '牛乳', [], null, true, false, true, null],
  ['bread', '食パン', [], null, true, false, true, null],
  ['beef', '牛肉', [], null, true, false, true, null],
  ['chicken', '鶏肉', [], null, true, false, true, null],
  ['shrimp', 'エビ', [], null, true, false, true, null],
  ['potato', 'ジャガイモ', [], null, true, false, true, null],
  ['carrot', 'ニンジン', [], null, true, false, true, null],
  ['onion', '玉ねぎ', [], null, true, false, true, null],
  ['tomato', 'トマト', [], null, true, false, true, null],
  ['lettuce', 'レタス', [], null, true, false, true, null],
  ['cheese', 'チーズ', [], null, true, false, true, null],
  ['curry-powder', 'カレー粉', [], null, true, false, true, null],
  [
    'sliced-tomato',
    'スライストマト',
    ['tomato'],
    'cutting',
    false,
    false,
    true,
    null,
  ],
  [
    'chopped-onion',
    '刻み玉ねぎ',
    ['onion'],
    'cutting',
    false,
    false,
    true,
    null,
  ],
  [
    'chopped-lettuce',
    '刻みレタス',
    ['lettuce'],
    'cutting',
    false,
    false,
    true,
    null,
  ],
  ['cut-potato', 'ポテト', ['potato'], 'cutting', false, false, true, null],
  ['cooked-beef', '炒め肉', ['beef'], 'heating', false, false, true, null],
  [
    'grilled-chicken',
    'グリルチキン',
    ['chicken'],
    'heating',
    false,
    false,
    true,
    null,
  ],
  [
    'prepared-shrimp',
    '下処理エビ',
    ['shrimp'],
    'cutting',
    false,
    false,
    true,
    null,
  ],
  [
    'chopped-carrot',
    '刻みニンジン',
    ['carrot'],
    'cutting',
    false,
    false,
    true,
    null,
  ],
  [
    'tomato-sauce',
    'トマトソース',
    ['sliced-tomato'],
    'mixing',
    false,
    false,
    true,
    null,
  ],
  ['boiled-egg', 'ゆで卵', ['egg'], 'heating', false, false, true, null],
  [
    'curry-sauce',
    'カレーソース',
    ['curry-powder', 'chopped-onion', 'chopped-carrot'],
    'mixing',
    false,
    false,
    true,
    null,
  ],
  [
    'omelet-base',
    'オムレツのもと',
    ['egg', 'milk', 'cheese'],
    'mixing',
    false,
    false,
    true,
    null,
  ],
  ['cooked-rice', 'ごはん', ['rice'], 'heating', false, true, true, 1],
  ['toast', 'トースト', ['bread'], 'heating', false, true, true, 1],
  ['fried-egg', '目玉焼き', ['egg'], 'heating', false, true, true, 1],
  [
    'french-fries',
    'ポテトフライ',
    ['cut-potato'],
    'heating',
    false,
    true,
    true,
    1,
  ],
  [
    'salad',
    'サラダ',
    ['chopped-lettuce', 'sliced-tomato'],
    'combining',
    false,
    true,
    true,
    1,
  ],
  [
    'beef-steak',
    'ビーフステーキ',
    ['cooked-beef'],
    'cutting',
    false,
    true,
    true,
    1,
  ],
  [
    'chicken-saute',
    'チキンソテー',
    ['grilled-chicken', 'french-fries'],
    'combining',
    false,
    true,
    true,
    1,
  ],
  [
    'cheese-toast',
    'チーズトースト',
    ['toast', 'cheese'],
    'combining',
    false,
    true,
    false,
    1,
  ],
  [
    'potato-salad',
    'ポテトサラダ',
    ['cut-potato', 'chopped-carrot'],
    'mixing',
    false,
    true,
    false,
    1,
  ],
  [
    'fried-egg-toast',
    '目玉焼きトースト',
    ['toast', 'lettuce', 'fried-egg'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  [
    'egg-sandwich',
    '卵サンド',
    ['bread', 'boiled-egg', 'chopped-lettuce'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  ['omelet', 'オムレツ', ['omelet-base'], 'heating', false, true, true, 2],
  [
    'chicken-salad',
    'チキンサラダ',
    ['grilled-chicken', 'salad'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  [
    'shrimp-salad',
    'エビサラダ',
    ['prepared-shrimp', 'salad'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  [
    'beef-tomato-stew',
    '牛肉のトマト煮',
    ['cooked-beef', 'tomato-sauce', 'chopped-onion'],
    'heating',
    false,
    true,
    false,
    2,
  ],
  [
    'chicken-tomato-stew',
    'チキントマト煮',
    ['grilled-chicken', 'tomato-sauce', 'chopped-onion'],
    'heating',
    false,
    true,
    false,
    2,
  ],
  [
    'mixed-grill',
    'ミックスグリル',
    ['beef-steak', 'chicken-saute'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  [
    'tomato-cheese-sandwich',
    'トマトチーズサンド',
    ['bread', 'sliced-tomato', 'cheese'],
    'combining',
    false,
    true,
    false,
    2,
  ],
  [
    'shrimp-omelet',
    'エビオムレツ',
    ['prepared-shrimp', 'omelet-base'],
    'heating',
    false,
    true,
    false,
    3,
  ],
  [
    'hamburg',
    'ハンバーグ',
    ['beef', 'chopped-onion', 'egg', 'bread', 'tomato-sauce', 'milk'],
    'heating',
    false,
    true,
    false,
    3,
  ],
  [
    'curry-rice',
    'カレーライス',
    ['cooked-rice', 'cooked-beef', 'curry-sauce'],
    'combining',
    false,
    true,
    false,
    3,
  ],
  [
    'omurice',
    'オムライス',
    ['cooked-rice', 'grilled-chicken', 'tomato-sauce', 'omelet'],
    'combining',
    false,
    true,
    false,
    3,
  ],
  [
    'fried-rice',
    'チャーハン',
    ['cooked-rice', 'egg', 'chopped-onion', 'chopped-carrot'],
    'mixing',
    false,
    true,
    false,
    3,
  ],
  [
    'shrimp-pilaf',
    'エビピラフ',
    ['cooked-rice', 'prepared-shrimp', 'chopped-onion', 'chopped-carrot'],
    'mixing',
    false,
    true,
    false,
    3,
  ],
  [
    'cheese-curry',
    'チーズカレー',
    ['cooked-rice', 'cut-potato', 'cheese', 'curry-sauce'],
    'combining',
    false,
    true,
    false,
    3,
  ],
  [
    'chicken-curry',
    'チキンカレー',
    ['cooked-rice', 'grilled-chicken', 'curry-sauce'],
    'combining',
    false,
    true,
    false,
    3,
  ],
] as const;

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

  it('registers every food from the food requirements in order', () => {
    expect(foodInfos.map((food) => food.id)).toEqual(
      expectedFoods.map(([id]) => id),
    );
  });

  it('matches the food requirement attributes', () => {
    expectedFoods.forEach(
      ([
        id,
        name,
        ingredientIds,
        process,
        canSpawnFromStorage,
        canBeServed,
        canBeIngredient,
        difficulty,
      ]) => {
        expect(foodInfos.find((food) => food.id === id)).toMatchObject({
          id,
          name,
          ingredientIds,
          process,
          canSpawnFromStorage,
          canBeServed,
          canBeIngredient,
          difficulty,
          spriteId: id,
        });
      },
    );
  });

  it('references only registered ingredient foods', () => {
    const foodIds = new Set(foodInfos.map((food) => food.id));

    foodInfos.forEach((food) => {
      food.ingredientIds.forEach((ingredientId) => {
        expect(foodIds.has(ingredientId)).toBe(true);
      });
    });
  });

  it('resolves processing sources and targets', () => {
    const curryRice = foodInfos.find((food) => food.id === 'curry-rice');

    expect(curryRice).toBeDefined();
    expect(getIngredientNames(curryRice!)).toEqual([
      'ごはん',
      '炒め肉',
      'カレーソース',
    ]);
    expect(getProcessedIntoNames('cooked-rice')).toEqual([
      'カレーライス',
      'オムライス',
      'チャーハン',
      'エビピラフ',
      'チーズカレー',
      'チキンカレー',
    ]);
  });

  it('assigns requirement-order sprite cells to all registered foods', () => {
    foodInfos.forEach((food, index) => {
      expect(getFoodSpriteFrame(food.spriteId)).toMatchObject({
        id: food.spriteId,
        index,
        row: Math.floor(index / 8),
        column: index % 8,
        width: 128,
        height: 128,
      });
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
    expect(foodSpritesheetData.frames['chicken-curry.png']?.frame).toEqual({
      x: 384,
      y: 768,
      w: 128,
      h: 128,
    });
  });
});
