import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getFoodInfo } from '../game/foods.ts';
import { toWorldPosition } from '../game/grid.ts';
import { getMachineInfo } from '../game/machine.ts';
import { getMachineSpriteFrame } from '../game/machineSprites.ts';
import type { PlacedMachine, PlacementId } from '../game/placement.ts';
import { SpritePlane } from './SpritePlane.tsx';

type MachineObjectProps = {
  machine: PlacedMachine;
  isSelected: boolean;
  isConnectionSource: boolean;
  onPointerDown: (
    machineId: PlacementId,
    event: ThreeEvent<PointerEvent>,
  ) => void;
  onPointerUp: (
    machineId: PlacementId,
    event: ThreeEvent<PointerEvent>,
  ) => void;
};

function FoodRing({
  foodId,
  color,
  smallBadge,
}: {
  foodId: string | undefined;
  color: string;
  smallBadge?: boolean;
}) {
  const food = foodId !== undefined ? getFoodInfo(foodId) : null;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
        <ringGeometry args={[0.46, 0.52, 64]} />
        <meshBasicMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {food ? (
        <SpritePlane
          kind="food"
          id={food.spriteId}
          size={smallBadge ? 0.44 : 0.72}
          position={smallBadge ? [-0.34, 0.08, -0.34] : [0, 0.08, 0]}
        />
      ) : null}
    </group>
  );
}

export function MachineObject({
  machine,
  isSelected,
  isConnectionSource,
  onPointerDown,
  onPointerUp,
}: MachineObjectProps) {
  const position = toWorldPosition(machine.position, 1, 0);
  const label = getMachineInfo(machine.machineId)?.name ?? machine.machineId;
  const hasSprite = getMachineSpriteFrame(machine.machineId) !== null;

  return (
    <group
      position={[position.x, position.y, position.z]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown(machine.id, event);
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        onPointerUp(machine.id, event);
      }}
      userData={{ label }}
    >
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.92, 0.024, 0.92]} />
        <meshStandardMaterial color={isSelected ? '#fff5cc' : '#fffdf9'} />
      </mesh>
      {machine.machineId === 'storage' ? (
        <FoodRing foodId={machine.foodId} color="#ff77b7" />
      ) : machine.machineId === 'shipping' ? (
        <FoodRing foodId={machine.foodId} color="#50b86b" smallBadge />
      ) : hasSprite ? (
        <SpritePlane
          kind="machine"
          id={machine.machineId}
          size={0.78}
          position={[0, 0.08, 0]}
        />
      ) : (
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 0.22, 24]} />
          <meshStandardMaterial color="#7fa6a4" />
        </mesh>
      )}
      {isSelected || isConnectionSource ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.09, 0]}>
          <ringGeometry args={[0.56, 0.6, 64]} />
          <meshBasicMaterial
            color={isConnectionSource ? '#ff9f43' : '#597877'}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
    </group>
  );
}
