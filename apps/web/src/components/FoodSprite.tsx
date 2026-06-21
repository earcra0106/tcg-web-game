import type { CSSProperties } from 'react';
import {
  FOOD_SPRITESHEET_COLUMNS,
  FOOD_SPRITESHEET_URL,
  getFoodSpriteFrame,
} from '../game/foodSprites.ts';
import type { FoodSpriteId } from '../game/food.ts';

type FoodSpriteProps = {
  spriteId: FoodSpriteId;
  label: string;
};

export function FoodSprite({ spriteId, label }: FoodSpriteProps) {
  const sprite = getFoodSpriteFrame(spriteId);

  if (!sprite) {
    return null;
  }

  return (
    <span
      className="food-sprite"
      aria-label={label}
      role="img"
      style={
        {
          '--food-sprite-image': `url("${FOOD_SPRITESHEET_URL}")`,
          '--food-sprite-position-x': `${
            (sprite.column / (FOOD_SPRITESHEET_COLUMNS - 1)) * 100
          }%`,
          '--food-sprite-position-y': `${
            (sprite.row / (FOOD_SPRITESHEET_COLUMNS - 1)) * 100
          }%`,
          '--food-sprite-sheet-scale': `${FOOD_SPRITESHEET_COLUMNS * 100}%`,
        } as CSSProperties
      }
    />
  );
}
