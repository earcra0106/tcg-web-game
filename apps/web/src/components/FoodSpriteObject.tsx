import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  FOOD_SPRITESHEET_COLUMNS,
  FOOD_SPRITESHEET_URL,
  getFoodSpriteFrame,
} from '../game/foodSprites.ts';
import type { FoodSpriteId } from '../game/food.ts';

type FoodSpriteObjectProps = {
  spriteId: FoodSpriteId;
};

export function FoodSpriteObject({ spriteId }: FoodSpriteObjectProps) {
  const sourceTexture = useLoader(THREE.TextureLoader, FOOD_SPRITESHEET_URL);
  const sprite = getFoodSpriteFrame(spriteId);
  const texture = useMemo(() => {
    if (!sprite) {
      return null;
    }

    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.wrapS = THREE.ClampToEdgeWrapping;
    nextTexture.wrapT = THREE.ClampToEdgeWrapping;
    nextTexture.repeat.set(
      1 / FOOD_SPRITESHEET_COLUMNS,
      1 / FOOD_SPRITESHEET_COLUMNS,
    );
    nextTexture.offset.set(
      sprite.column / FOOD_SPRITESHEET_COLUMNS,
      1 - (sprite.row + 1) / FOOD_SPRITESHEET_COLUMNS,
    );
    nextTexture.needsUpdate = true;

    return nextTexture;
  }, [sourceTexture, sprite]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) {
    return null;
  }

  return (
    <mesh position={[0, 0.72, 0]}>
      <planeGeometry args={[1.55, 1.55]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
