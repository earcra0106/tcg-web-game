import type { FoodSpriteId } from '../game/food.ts';
import type { WorldPosition } from '../game/grid.ts';
import { SpritePlane } from './SpritePlane.tsx';

type FoodItemObjectProps = {
  spriteId: FoodSpriteId;
  position: WorldPosition;
};

export function FoodItemObject({ spriteId, position }: FoodItemObjectProps) {
  return (
    <SpritePlane
      kind="food"
      id={spriteId}
      size={0.42}
      position={[position.x, position.y, position.z]}
      billboard
      renderOrder={30}
    />
  );
}
