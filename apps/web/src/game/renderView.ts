import type { MachineConnection } from './connections.ts';
import type { FoodId, FoodSpriteId } from './food.ts';
import { getFoodInfo } from './foods.ts';
import type { WorldPosition } from './grid.ts';
import { toWorldPosition } from './grid.ts';
import type { FoodItem } from './items.ts';
import {
  MACHINE_PROCESS_TIME_MS,
  STORAGE_SPAWN_INTERVAL_MS,
  type MachineRuntime,
  type MachineRuntimeConfig,
} from './machineRuntime.ts';
import type { PlacedMachine, PlacementId } from './placement.ts';
import { findMachineById } from './placement.ts';
import {
  calculateShippingEfficiency,
  type ShipmentRecord,
} from './shipping.ts';
import type { SimulationState } from './simulation.ts';
import { getStageGoal, type StageGoal } from './stageGoals.ts';
import type { GameState } from './gameState.ts';

export const DEFAULT_EFFICIENCY_WINDOW_MS = 60_000;

export type RenderMachineView = {
  machine: PlacedMachine;
  operationProgress: RenderMachineProgressView | null;
  hasOutput: boolean;
  heldItems: readonly RenderMachineHeldItemView[];
};

export type RenderMachineProgressView = {
  kind: 'waiting' | 'processing';
  value: number;
};

export type RenderMachineHeldItemView = {
  id: string;
  foodId: FoodId;
  spriteId: FoodSpriteId;
  status: 'input' | 'processing';
  progress: number | null;
};

export type RenderFoodItemView = {
  id: string;
  foodId: FoodId;
  spriteId: FoodSpriteId;
  position: WorldPosition;
};

export type StageHudGoalView = {
  foodId: FoodId;
  foodName: string;
  stageNumbers: readonly number[];
  requiredEfficiency: number;
  currentEfficiency: number;
  isCleared: boolean;
};

export type StageHudView = {
  stageNumber: number;
  goals: readonly StageHudGoalView[];
  isCleared: boolean;
};

export type RenderView = {
  machines: readonly RenderMachineView[];
  connections: readonly MachineConnection[];
  items: readonly RenderFoodItemView[];
  hud: StageHudView;
};

export type CreateRenderViewInput = {
  gameState: GameState;
  simulationState: SimulationState;
  machineConfigs?: Readonly<Record<PlacementId, MachineRuntimeConfig>>;
  seed: string;
  efficiencyWindowMs?: number;
};

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function clampProgress(progress: number) {
  return Math.max(0, Math.min(1, progress));
}

function createMachineProgressView(
  runtime: MachineRuntime | undefined,
): RenderMachineProgressView | null {
  if (runtime === undefined) {
    return null;
  }

  if (runtime.machineId === 'storage') {
    return {
      kind: 'waiting',
      value: clampProgress(
        runtime.storageElapsedMs / STORAGE_SPAWN_INTERVAL_MS,
      ),
    };
  }

  if (runtime.process === null) {
    return null;
  }

  return {
    kind: 'processing',
    value: clampProgress(
      1 - runtime.process.remainingMs / MACHINE_PROCESS_TIME_MS,
    ),
  };
}

function createInputItemView(item: FoodItem): RenderMachineHeldItemView | null {
  const food = getFoodInfo(item.foodId);

  return food === null
    ? null
    : {
        id: item.id,
        foodId: item.foodId,
        spriteId: food.spriteId,
        status: 'input',
        progress: null,
      };
}

export function createMachineHeldItemViews(
  runtime: MachineRuntime | undefined,
): readonly RenderMachineHeldItemView[] {
  if (runtime === undefined) {
    return [];
  }

  const createInputItemViews = (items: readonly FoodItem[]) =>
    [...items]
      .sort((first, second) => second.createdAtMs - first.createdAtMs)
      .flatMap((item) => {
        const view = createInputItemView(item);
        return view === null ? [] : [view];
      });
  const inputItems = createInputItemViews(runtime.inputBuffer);
  const process = runtime.process;

  if (process === null) {
    return inputItems;
  }

  const food = getFoodInfo(process.outputFoodId);

  if (food === null) {
    return inputItems;
  }

  return [
    ...inputItems,
    {
      id: `${runtime.placementId}-process-${process.recipeId}`,
      foodId: process.outputFoodId,
      spriteId: food.spriteId,
      status: 'processing',
      progress: clampProgress(
        1 - process.remainingMs / MACHINE_PROCESS_TIME_MS,
      ),
    },
  ];
}

export function interpolateWorldPosition(
  fromMachine: PlacedMachine,
  toMachine: PlacedMachine,
  progress: number,
): WorldPosition {
  const from = toWorldPosition(fromMachine.position, 1, 0.32);
  const to = toWorldPosition(toMachine.position, 1, 0.32);
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return {
    x: lerp(from.x, to.x, clampedProgress),
    y: lerp(from.y, to.y, clampedProgress),
    z: lerp(from.z, to.z, clampedProgress),
  };
}

export function getCumulativeStageGoals({
  seed,
  stageNumber,
}: {
  seed: string;
  stageNumber: number;
}) {
  return Array.from({ length: stageNumber }, (_, index) =>
    getStageGoal({ seed, stageNumber: index + 1 }),
  );
}

export function createStageHudView({
  stageNumber,
  goals,
  history,
  nowMs,
  windowMs = DEFAULT_EFFICIENCY_WINDOW_MS,
}: {
  stageNumber: number;
  goals: readonly StageGoal[];
  history: readonly ShipmentRecord[];
  nowMs: number;
  windowMs?: number;
}): StageHudView {
  const goalMap = new Map<FoodId, StageHudGoalView>();

  goals.forEach((goal) => {
    const current = goalMap.get(goal.targetFoodId);

    if (current === undefined) {
      const currentEfficiency = calculateShippingEfficiency({
        history,
        targetFoodId: goal.targetFoodId,
        nowMs,
        windowMs,
      });

      goalMap.set(goal.targetFoodId, {
        foodId: goal.targetFoodId,
        foodName: goal.targetFoodName,
        stageNumbers: [goal.stageNumber],
        requiredEfficiency: goal.requiredEfficiency,
        currentEfficiency,
        isCleared: currentEfficiency >= goal.requiredEfficiency,
      });
      return;
    }

    const requiredEfficiency =
      current.requiredEfficiency + goal.requiredEfficiency;

    goalMap.set(goal.targetFoodId, {
      ...current,
      stageNumbers: [...current.stageNumbers, goal.stageNumber],
      requiredEfficiency,
      isCleared: current.currentEfficiency >= requiredEfficiency,
    });
  });

  const hudGoals = [...goalMap.values()];

  return {
    stageNumber,
    goals: hudGoals,
    isCleared: hudGoals.length > 0 && hudGoals.every((goal) => goal.isCleared),
  };
}

export function createRenderView({
  gameState,
  simulationState,
  seed,
  efficiencyWindowMs = DEFAULT_EFFICIENCY_WINDOW_MS,
}: CreateRenderViewInput): RenderView {
  const stageNumber = gameState.stageIndex + 1;
  const goals = getCumulativeStageGoals({ seed, stageNumber });

  return {
    machines: gameState.machines.map((machine) => {
      const runtime = simulationState.machineRuntimes[machine.id];

      return {
        machine,
        operationProgress: createMachineProgressView(runtime),
        hasOutput: (runtime?.outputBuffer.length ?? 0) > 0,
        heldItems: createMachineHeldItemViews(runtime),
      };
    }),
    connections: gameState.connections,
    items: simulationState.items.flatMap((item) => {
      const fromMachine = findMachineById(
        gameState.machines,
        item.fromMachineId,
      );
      const toMachine = findMachineById(gameState.machines, item.toMachineId);
      const food = getFoodInfo(item.foodId);

      if (fromMachine === null || toMachine === null || food === null) {
        return [];
      }

      return [
        {
          id: item.id,
          foodId: item.foodId,
          spriteId: food.spriteId,
          position: interpolateWorldPosition(
            fromMachine,
            toMachine,
            item.progress,
          ),
        },
      ];
    }),
    hud: createStageHudView({
      stageNumber,
      goals,
      history: simulationState.shippingHistory,
      nowMs: simulationState.nowMs,
      windowMs: efficiencyWindowMs,
    }),
  };
}
