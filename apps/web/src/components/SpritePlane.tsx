import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  FOOD_SPRITESHEET_COLUMNS,
  FOOD_SPRITESHEET_URL,
  getFoodSpriteFrame,
} from '../game/foodSprites.ts';
import type { FoodSpriteId } from '../game/food.ts';
import {
  MACHINE_SPRITESHEET_COLUMNS,
  MACHINE_SPRITESHEET_URL,
  getMachineSpriteFrame,
} from '../game/machineSprites.ts';
import type { MachineId } from '../game/machine.ts';

type SpritePlaneProps = {
  kind: 'food' | 'machine';
  id: FoodSpriteId | MachineId;
  size: number;
  position?: [number, number, number];
};

export function SpritePlane({
  kind,
  id,
  size,
  position = [0, 0, 0],
}: SpritePlaneProps) {
  const url = kind === 'food' ? FOOD_SPRITESHEET_URL : MACHINE_SPRITESHEET_URL;
  const sourceTexture = useLoader(THREE.TextureLoader, url);
  const texture = useMemo(() => {
    const sprite =
      kind === 'food'
        ? getFoodSpriteFrame(id)
        : getMachineSpriteFrame(id as MachineId);

    if (!sprite) {
      return null;
    }

    const columns =
      kind === 'food' ? FOOD_SPRITESHEET_COLUMNS : MACHINE_SPRITESHEET_COLUMNS;
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.wrapS = THREE.ClampToEdgeWrapping;
    nextTexture.wrapT = THREE.ClampToEdgeWrapping;
    nextTexture.repeat.set(1 / columns, 1 / columns);
    nextTexture.offset.set(
      sprite.column / columns,
      1 - (sprite.row + 1) / columns,
    );
    nextTexture.needsUpdate = true;

    return nextTexture;
  }, [id, kind, sourceTexture]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) {
    return null;
  }

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
