import { Billboard } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import {
  FOOD_SPRITESHEET_SIZE,
  FOOD_SPRITESHEET_URL,
  getFoodSpriteFrame,
} from '../game/foodSprites.ts';
import type { FoodSpriteId } from '../game/food.ts';
import {
  MACHINE_SPRITESHEET_HEIGHT,
  MACHINE_SPRITESHEET_URL,
  MACHINE_SPRITESHEET_WIDTH,
  getMachineSpriteFrame,
} from '../game/machineSprites.ts';
import type { MachineId } from '../game/machine.ts';
import { createSpriteTextureLayout } from '../game/spriteTexture.ts';

type SpritePlaneProps = {
  kind: 'food' | 'machine';
  id: FoodSpriteId | MachineId;
  size: number;
  position?: [number, number, number];
  billboard?: boolean;
  renderOrder?: number;
};

export function SpritePlane({
  kind,
  id,
  size,
  position = [0, 0, 0],
  billboard = false,
  renderOrder = 10,
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

    const sheetWidth =
      kind === 'food' ? FOOD_SPRITESHEET_SIZE : MACHINE_SPRITESHEET_WIDTH;
    const sheetHeight =
      kind === 'food' ? FOOD_SPRITESHEET_SIZE : MACHINE_SPRITESHEET_HEIGHT;
    const layout = createSpriteTextureLayout({
      frame: sprite,
      sheetWidth,
      sheetHeight,
    });
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.wrapS = THREE.ClampToEdgeWrapping;
    nextTexture.wrapT = THREE.ClampToEdgeWrapping;
    nextTexture.repeat.set(...layout.repeat);
    nextTexture.offset.set(...layout.offset);
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

  const mesh = (
    <mesh
      position={billboard ? undefined : position}
      rotation={billboard ? undefined : [-Math.PI / 2, 0, 0]}
      renderOrder={renderOrder}
    >
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.08}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );

  if (billboard) {
    return (
      <Billboard position={position} renderOrder={renderOrder}>
        {mesh}
      </Billboard>
    );
  }

  return mesh;
}
