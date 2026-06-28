import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { FoodId } from '../game/food.ts';
import { getFoodInfo } from '../game/foods.ts';
import { toWorldPosition } from '../game/grid.ts';
import { getMachineInfo } from '../game/machine.ts';
import { getMachineSpriteFrame } from '../game/machineSprites.ts';
import type { PlacedMachine, PlacementId } from '../game/placement.ts';
import type { RenderMachineHeldItemView } from '../game/renderView.ts';
import type { RenderMachineProgressView } from '../game/renderView.ts';
import { MachineHeldItems } from './MachineHeldItems.tsx';
import { SpritePlane } from './SpritePlane.tsx';

const MACHINE_RENDER_ORDER = 10;
const MACHINE_BASE_Y = 0.105;
const MACHINE_BASE_HEIGHT = 0.034;
const MACHINE_RING_Y = 0.13;
const MACHINE_SPRITE_Y = 0.2;

type MachineObjectProps = {
  machine: PlacedMachine;
  isSelected: boolean;
  isConnectionSource: boolean;
  operationProgress?: RenderMachineProgressView | null;
  hasOutput?: boolean;
  heldItems?: readonly RenderMachineHeldItemView[];
  craftableFoodIds: readonly FoodId[];
  selectedRecipeId: FoodId | null;
  onSelectRecipe: (recipeId: FoodId | null) => void;
  showHeldItems?: boolean;
  opacity?: number;
  isInteractive?: boolean;
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
  opacity,
}: {
  foodId: string | undefined;
  color: string;
  smallBadge?: boolean;
  opacity: number;
}) {
  const food = foodId !== undefined ? getFoodInfo(foodId) : null;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, MACHINE_RING_Y, 0]}
        renderOrder={MACHINE_RENDER_ORDER}
      >
        <ringGeometry args={[0.46, 0.52, 64]} />
        <meshBasicMaterial
          color={color}
          transparent={opacity < 1}
          opacity={opacity}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {food ? (
        <SpritePlane
          kind="food"
          id={food.spriteId}
          size={smallBadge ? 0.44 : 0.72}
          position={
            smallBadge
              ? [-0.34, MACHINE_SPRITE_Y, -0.34]
              : [0, MACHINE_SPRITE_Y, 0]
          }
          billboard
          renderOrder={MACHINE_RENDER_ORDER + 1}
          opacity={opacity}
        />
      ) : null}
    </group>
  );
}

function ProgressGauge({
  progress,
  opacity,
}: {
  progress: RenderMachineProgressView | null;
  opacity: number;
}) {
  if (progress === null || progress.value <= 0) {
    return null;
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, MACHINE_RING_Y + 0.03, 0]}
      renderOrder={MACHINE_RENDER_ORDER + 0.5}
    >
      <circleGeometry
        args={[0.6, 64, Math.PI / 2, progress.value * Math.PI * 2]}
      />
      <meshBasicMaterial
        color={progress.kind === 'waiting' ? '#50b86b' : '#ffcf5a'}
        transparent
        opacity={0.82 * opacity}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function MachineObject({
  machine,
  isSelected,
  isConnectionSource,
  operationProgress = null,
  hasOutput = false,
  heldItems = [],
  craftableFoodIds,
  selectedRecipeId,
  onSelectRecipe,
  showHeldItems = false,
  opacity = 1,
  isInteractive = true,
  onPointerDown,
  onPointerUp,
}: MachineObjectProps) {
  const position = toWorldPosition(machine.position, 1, 0);
  const label = getMachineInfo(machine.machineId)?.name ?? machine.machineId;
  const hasSprite = getMachineSpriteFrame(machine.machineId) !== null;

  return (
    <group
      position={[position.x, position.y, position.z]}
      onPointerDown={
        isInteractive
          ? (event) => {
              event.stopPropagation();
              onPointerDown(machine.id, event);
            }
          : undefined
      }
      onPointerUp={
        isInteractive
          ? (event) => {
              event.stopPropagation();
              onPointerUp(machine.id, event);
            }
          : undefined
      }
      userData={{ label }}
    >
      <mesh
        position={[0, MACHINE_BASE_Y, 0]}
        renderOrder={MACHINE_RENDER_ORDER}
      >
        <cylinderGeometry args={[0.48, 0.48, MACHINE_BASE_HEIGHT, 48]} />
        <meshStandardMaterial
          color={isSelected ? '#fff5cc' : '#fffdf9'}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      {machine.machineId === 'storage' ? (
        <FoodRing foodId={machine.foodId} color="#ff77b7" opacity={opacity} />
      ) : machine.machineId === 'shipping' ? (
        <FoodRing
          foodId={machine.foodId}
          color="#50b86b"
          smallBadge
          opacity={opacity}
        />
      ) : hasSprite ? (
        <SpritePlane
          kind="machine"
          id={machine.machineId}
          size={0.78}
          position={[0, MACHINE_SPRITE_Y, 0]}
          billboard
          renderOrder={MACHINE_RENDER_ORDER + 1}
          opacity={opacity}
        />
      ) : (
        <mesh
          position={[0, MACHINE_SPRITE_Y, 0]}
          renderOrder={MACHINE_RENDER_ORDER + 1}
        >
          <cylinderGeometry args={[0.28, 0.34, 0.22, 24]} />
          <meshStandardMaterial
            color="#7fa6a4"
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      )}
      {isSelected || isConnectionSource ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, MACHINE_RING_Y + 0.015, 0]}
          renderOrder={MACHINE_RENDER_ORDER + 2}
        >
          <ringGeometry args={[0.56, 0.6, 64]} />
          <meshBasicMaterial
            color={isConnectionSource ? '#ff9f43' : '#597877'}
            depthTest={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
      <ProgressGauge progress={operationProgress} opacity={opacity} />
      {hasOutput ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, MACHINE_RING_Y + 0.03, 0]}
          renderOrder={MACHINE_RENDER_ORDER + 3}
        >
          <ringGeometry args={[0.62, 0.66, 64]} />
          <meshBasicMaterial
            color="#50b86b"
            transparent
            opacity={0.82}
            depthTest={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}
      {showHeldItems ? (
        <MachineHeldItems
          items={heldItems}
          machineId={machine.machineId}
          selectedRecipeId={selectedRecipeId}
          craftableFoodIds={craftableFoodIds}
          onSelectRecipe={onSelectRecipe}
        />
      ) : null}
    </group>
  );
}
