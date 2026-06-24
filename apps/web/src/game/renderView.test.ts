import { describe, expect, it } from 'vitest';
import type { MachineConnection } from './connections.ts';
import type { GameState } from './gameState.ts';
import { createFoodItem, createTransportingFoodItem } from './items.ts';
import { createMachineRuntime } from './machineRuntime.ts';
import type { PlacedMachine } from './placement.ts';
import {
  createRenderView,
  createStageHudView,
  interpolateWorldPosition,
} from './renderView.ts';
import { createInitialSimulationState } from './simulation.ts';
import type { StageGoal } from './stageGoals.ts';

function machine(id: string, x: number): PlacedMachine {
  return {
    id,
    machineId: 'storage',
    position: { x, z: 0 },
    foodId: 'rice',
  };
}

function goal(
  stageNumber: number,
  targetFoodId: StageGoal['targetFoodId'],
  requiredEfficiency: number,
): StageGoal {
  return {
    stageNumber,
    targetFoodId,
    targetFoodName: targetFoodId,
    difficulty: 1,
    requiredEfficiency,
  };
}

describe('render view', () => {
  it('interpolates food item world position by transport progress', () => {
    const fromMachine = machine('from', 0);
    const toMachine = machine('to', 2);

    expect(interpolateWorldPosition(fromMachine, toMachine, 0)).toEqual({
      x: 0,
      y: 0.32,
      z: 0,
    });
    expect(interpolateWorldPosition(fromMachine, toMachine, 0.5)).toEqual({
      x: 1,
      y: 0.32,
      z: 0,
    });
    expect(interpolateWorldPosition(fromMachine, toMachine, 1)).toEqual({
      x: 2,
      y: 0.32,
      z: 0,
    });
  });

  it('creates food item views from transporting simulation items', () => {
    const machines = [machine('from', 0), machine('to', 2)];
    const connections: readonly MachineConnection[] = [
      { id: 'connection-1', fromMachineId: 'from', toMachineId: 'to' },
    ];
    const gameState: GameState = {
      machines,
      connections,
      stageIndex: 0,
      selection: { selectedMachineId: null },
    };
    const simulationState = {
      ...createInitialSimulationState(),
      items: [
        {
          ...createTransportingFoodItem(
            createFoodItem({
              id: 'item-1',
              foodId: 'rice',
              createdAtMs: 0,
            }),
            'connection-1',
            'from',
            'to',
          ),
          progress: 0.5,
        },
      ],
      machineRuntimes: {
        from: {
          ...createMachineRuntime(machines[0]!),
          outputBuffer: [
            createFoodItem({
              id: 'held',
              foodId: 'rice',
              createdAtMs: 0,
            }),
          ],
        },
      },
    };

    const view = createRenderView({
      gameState,
      simulationState,
      seed: 'daily',
    });

    expect(view.items).toEqual([
      expect.objectContaining({
        id: 'item-1',
        foodId: 'rice',
        position: { x: 1, y: 0.32, z: 0 },
      }),
    ]);
    expect(view.machines[0]).toMatchObject({
      hasOutput: true,
      isProcessing: false,
    });
  });

  it('summarizes cumulative goals and combines duplicate target foods', () => {
    const hud = createStageHudView({
      stageNumber: 3,
      goals: [
        goal(1, 'toast', 1),
        goal(2, 'cooked-rice', 1),
        goal(3, 'toast', 1),
      ],
      history: [
        { itemId: 'toast-1', foodId: 'toast', shippedAtMs: 10_000 },
        { itemId: 'toast-2', foodId: 'toast', shippedAtMs: 20_000 },
        { itemId: 'rice-1', foodId: 'cooked-rice', shippedAtMs: 30_000 },
      ],
      nowMs: 60_000,
      windowMs: 60_000,
    });

    expect(hud.goals).toEqual([
      expect.objectContaining({
        foodId: 'toast',
        stageNumbers: [1, 3],
        requiredEfficiency: 2,
        currentEfficiency: 2,
        isCleared: true,
      }),
      expect.objectContaining({
        foodId: 'cooked-rice',
        requiredEfficiency: 1,
        currentEfficiency: 1,
        isCleared: true,
      }),
    ]);
    expect(hud.isCleared).toBe(true);
  });

  it('marks cumulative goals uncleared when any target is below requirement', () => {
    const hud = createStageHudView({
      stageNumber: 2,
      goals: [goal(1, 'toast', 1), goal(2, 'cooked-rice', 2)],
      history: [
        { itemId: 'toast-1', foodId: 'toast', shippedAtMs: 10_000 },
        { itemId: 'rice-1', foodId: 'cooked-rice', shippedAtMs: 30_000 },
      ],
      nowMs: 60_000,
      windowMs: 60_000,
    });

    expect(hud.goals.map((item) => item.isCleared)).toEqual([true, false]);
    expect(hud.isCleared).toBe(false);
  });
});
