import { describe, expect, it } from 'vitest';
import type { MachineConnection } from './connections.ts';
import { createFoodItem, createTransportingFoodItem } from './items.ts';
import {
  createMachineRuntime,
  MACHINE_INPUT_CAPACITY,
} from './machineRuntime.ts';
import type { MachineId } from './machine.ts';
import type { PlacedMachine } from './placement.ts';
import {
  createInitialSimulationState,
  stepSimulation,
  type SimulationState,
} from './simulation.ts';

function machine(id: string, machineId: MachineId, x: number): PlacedMachine {
  return {
    id,
    machineId,
    position: { x, z: 0 },
  };
}

function connection(
  id: string,
  fromMachineId: string,
  toMachineId: string,
): MachineConnection {
  return {
    id,
    fromMachineId,
    toMachineId,
  };
}

describe('simulation', () => {
  it('moves conveyor items into the connected machine', () => {
    const machines = [
      machine('storage-1', 'storage', 0),
      machine('heater-1', 'heater', 1),
    ];
    const connections = [connection('connection-1', 'storage-1', 'heater-1')];
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: [
        createTransportingFoodItem(
          createFoodItem({
            id: 'item-1',
            foodId: 'rice',
            createdAtMs: 0,
          }),
          'connection-1',
          'storage-1',
          'heater-1',
        ),
      ],
    };

    const nextState = stepSimulation(state, {
      machines,
      connections,
      deltaMs: 600,
    });

    expect(nextState.items).toEqual([]);
    expect(nextState.machineRuntimes['heater-1']?.process).toMatchObject({
      recipeId: 'cooked-rice',
    });
  });

  it('keeps conveyor items waiting when the target cannot accept them', () => {
    const heater = machine('heater-1', 'heater', 1);
    const fullRuntime = {
      ...createMachineRuntime(heater),
      inputBuffer: Array.from({ length: MACHINE_INPUT_CAPACITY }, (_, index) =>
        createFoodItem({
          id: `held-${index}`,
          foodId: 'rice',
          createdAtMs: 0,
        }),
      ),
    };
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: [
        createTransportingFoodItem(
          createFoodItem({
            id: 'item-1',
            foodId: 'rice',
            createdAtMs: 0,
          }),
          'connection-1',
          'storage-1',
          'heater-1',
        ),
      ],
      machineRuntimes: {
        'heater-1': fullRuntime,
      },
    };

    const nextState = stepSimulation(state, {
      machines: [machine('storage-1', 'storage', 0), heater],
      connections: [connection('connection-1', 'storage-1', 'heater-1')],
      deltaMs: 600,
    });

    expect(nextState.items).toEqual([
      expect.objectContaining({
        id: 'item-1',
        progress: 1,
      }),
    ]);
  });

  it('moves conveyor items at a constant speed regardless of distance', () => {
    const machines = [
      machine('storage-1', 'storage', 0),
      machine('shipping-1', 'shipping', 2),
    ];
    const connections = [connection('connection-1', 'storage-1', 'shipping-1')];
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: [
        createTransportingFoodItem(
          createFoodItem({
            id: 'item-1',
            foodId: 'rice',
            createdAtMs: 0,
          }),
          'connection-1',
          'storage-1',
          'shipping-1',
        ),
      ],
    };

    const halfway = stepSimulation(state, {
      machines,
      connections,
      deltaMs: 600,
    });
    const arrived = stepSimulation(halfway, {
      machines,
      connections,
      deltaMs: 600,
    });

    expect(halfway.items).toEqual([
      expect.objectContaining({
        id: 'item-1',
        progress: 0.5,
      }),
    ]);
    expect(arrived.shippingHistory).toEqual([
      expect.objectContaining({
        itemId: 'item-1',
        shippedAtMs: 1_200,
      }),
    ]);
  });

  it('spawns food from storage and ships it through a minimal line', () => {
    const machines = [
      machine('storage-1', 'storage', 0),
      machine('shipping-1', 'shipping', 1),
    ];
    const connections = [connection('connection-1', 'storage-1', 'shipping-1')];
    const spawned = stepSimulation(createInitialSimulationState(), {
      machines,
      connections,
      deltaMs: 1_000,
      machineConfigs: {
        'storage-1': { spawnFoodId: 'rice' },
      },
    });

    expect(spawned.items).toEqual([
      expect.objectContaining({
        foodId: 'rice',
        progress: 0,
      }),
    ]);

    const shipped = stepSimulation(spawned, {
      machines,
      connections,
      deltaMs: 600,
      machineConfigs: {
        'storage-1': { spawnFoodId: 'rice' },
      },
    });

    expect(shipped.shippingHistory).toEqual([
      expect.objectContaining({
        foodId: 'rice',
        shippedAtMs: 1_600,
      }),
    ]);
  });

  it('processes and ships cooked food through a machine line', () => {
    const machines = [
      machine('storage-1', 'storage', 0),
      machine('heater-1', 'heater', 1),
      machine('shipping-1', 'shipping', 2),
    ];
    const connections = [
      connection('connection-1', 'storage-1', 'heater-1'),
      connection('connection-2', 'heater-1', 'shipping-1'),
    ];
    const input = {
      machines,
      connections,
      machineConfigs: {
        'storage-1': { spawnFoodId: 'rice' },
      },
    };
    const spawned = stepSimulation(createInitialSimulationState(), {
      ...input,
      deltaMs: 1_000,
    });
    const received = stepSimulation(spawned, {
      ...input,
      deltaMs: 600,
    });
    const cooked = stepSimulation(received, {
      ...input,
      deltaMs: 1_000,
    });
    const shipped = stepSimulation(cooked, {
      ...input,
      deltaMs: 600,
    });

    expect(shipped.shippingHistory).toEqual([
      expect.objectContaining({
        foodId: 'cooked-rice',
        shippedAtMs: 3_200,
      }),
    ]);
  });
});
