import type { SpritesheetData } from 'pixi.js';
import type { FoodSpriteId } from './food.ts';

export const FOOD_SPRITESHEET_URL = '/assets/sprites/foods.png';
export const FOOD_SPRITESHEET_SIZE = 1024;
export const FOOD_SPRITE_SIZE = 128;
export const FOOD_SPRITESHEET_COLUMNS =
  FOOD_SPRITESHEET_SIZE / FOOD_SPRITE_SIZE;

const foodSpriteIndexes = {
  rice: 0,
  egg: 1,
  milk: 2,
  bread: 3,
  'boiled-egg': 23,
  'cooked-rice': 26,
  toast: 27,
  'fried-egg': 28,
} as const satisfies Record<string, number>;

export type FoodSpriteFrame = {
  id: FoodSpriteId;
  key: `${string}.png`;
  index: number;
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const foodSpriteFrames = Object.entries(foodSpriteIndexes).map(
  ([id, index]) => {
    const column = index % FOOD_SPRITESHEET_COLUMNS;
    const row = Math.floor(index / FOOD_SPRITESHEET_COLUMNS);

    return {
      id,
      key: `${id}.png`,
      index,
      column,
      row,
      x: column * FOOD_SPRITE_SIZE,
      y: row * FOOD_SPRITE_SIZE,
      width: FOOD_SPRITE_SIZE,
      height: FOOD_SPRITE_SIZE,
    };
  },
) satisfies readonly FoodSpriteFrame[];

export const foodSpritesheetData = {
  frames: Object.fromEntries(
    foodSpriteFrames.map((sprite) => [
      sprite.key,
      {
        frame: {
          x: sprite.x,
          y: sprite.y,
          w: sprite.width,
          h: sprite.height,
        },
        sourceSize: { w: sprite.width, h: sprite.height },
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: sprite.width,
          h: sprite.height,
        },
        anchor: { x: 0.5, y: 0.5 },
      },
    ]),
  ),
  meta: {
    image: FOOD_SPRITESHEET_URL,
    format: 'RGBA8888',
    size: { w: FOOD_SPRITESHEET_SIZE, h: FOOD_SPRITESHEET_SIZE },
    scale: '1',
  },
} satisfies SpritesheetData;

export function getFoodSpriteFrame(spriteId: FoodSpriteId) {
  return foodSpriteFrames.find((sprite) => sprite.id === spriteId) ?? null;
}
