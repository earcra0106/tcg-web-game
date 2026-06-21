import type { CSSProperties } from 'react';
import {
  FOOD_SPRITESHEET_SIZE,
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
          '--food-sprite-x': `-${sprite.x}px`,
          '--food-sprite-y': `-${sprite.y}px`,
          '--food-sprite-sheet-size': `${FOOD_SPRITESHEET_SIZE}px`,
        } as CSSProperties
      }
    />
  );
}
