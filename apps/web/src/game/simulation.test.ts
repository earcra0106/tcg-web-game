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

function machine(
  id: string,
  machineId: MachineId,
  x: number,
  foodId?: PlacedMachine['foodId'],
): PlacedMachine {
  return {
    id,
    machineId,
    position: { x, z: 0 },
    foodId,
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
      machines: [
        machine('storage-1', 'storage', 0),
        heater,
        machine('shipping-1', 'shipping', 2, 'rice'),
      ],
      connections: [
        connection('connection-1', 'storage-1', 'heater-1'),
        connection('connection-2', 'heater-1', 'shipping-1'),
      ],
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
      machine('shipping-1', 'shipping', 2, 'rice'),
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
      machine('shipping-1', 'shipping', 1, 'rice'),
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
      machine('shipping-1', 'shipping', 2, 'cooked-rice'),
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

  it('passes splitter inputs through all branches immediately in round-robin order', () => {
    const splitter = machine('splitter-1', 'splitter', 0);
    const machines = [
      splitter,
      machine('shipping-1', 'shipping', 1, 'rice'),
      machine('shipping-2', 'shipping', 2, 'rice'),
      machine('shipping-3', 'shipping', 3, 'rice'),
      machine('shipping-4', 'shipping', 4, 'rice'),
    ];
    const connections = [
      connection('connection-1', 'splitter-1', 'shipping-1'),
      connection('connection-2', 'splitter-1', 'shipping-2'),
      connection('connection-3', 'splitter-1', 'shipping-3'),
      connection('connection-4', 'splitter-1', 'shipping-4'),
    ];
    const state: SimulationState = {
      ...createInitialSimulationState(),
      machineRuntimes: {
        'splitter-1': {
          ...createMachineRuntime(splitter),
          inputBuffer: [
            createFoodItem({ id: 'item-1', foodId: 'rice', createdAtMs: 0 }),
            createFoodItem({ id: 'item-2', foodId: 'rice', createdAtMs: 0 }),
            createFoodItem({ id: 'item-3', foodId: 'rice', createdAtMs: 0 }),
            createFoodItem({ id: 'item-4', foodId: 'rice', createdAtMs: 0 }),
          ],
        },
      },
    };

    const nextState = stepSimulation(state, {
      machines,
      connections,
      deltaMs: 0,
    });

    expect(nextState.items.map((item) => item.connectionId)).toEqual([
      'connection-1',
      'connection-2',
      'connection-3',
      'connection-4',
    ]);
    expect(nextState.machineRuntimes['splitter-1']).toMatchObject({
      inputBuffer: [],
      outputBuffer: [],
      roundRobinIndex: 4,
    });
  });

  it('removes food traveling on a deleted conveyor', () => {
    const machines = [
      machine('storage-1', 'storage', 0),
      machine('heater-1', 'heater', 1),
    ];
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: [
        createTransportingFoodItem(
          createFoodItem({
            id: 'item-1',
            foodId: 'rice',
            createdAtMs: 0,
          }),
          'deleted-connection',
          'storage-1',
          'heater-1',
        ),
      ],
    };

    const nextState = stepSimulation(state, {
      machines,
      connections: [],
      deltaMs: 600,
    });

    expect(nextState.items).toEqual([]);
    expect(nextState.machineRuntimes['heater-1']?.inputBuffer).toEqual([]);
  });

  it('removes all food retained by a deleted machine', () => {
    const deletedMachine = machine('heater-1', 'heater', 1);
    const state: SimulationState = {
      ...createInitialSimulationState(),
      machineRuntimes: {
        'heater-1': {
          ...createMachineRuntime(deletedMachine),
          inputBuffer: [
            createFoodItem({
              id: 'input-1',
              foodId: 'egg',
              createdAtMs: 0,
            }),
          ],
          outputBuffer: [
            createFoodItem({
              id: 'output-1',
              foodId: 'fried-egg',
              createdAtMs: 0,
            }),
          ],
        },
      },
    };

    const nextState = stepSimulation(state, {
      machines: [],
      connections: [],
      deltaMs: 0,
    });

    expect(nextState.machineRuntimes).toEqual({});
  });

  it('keeps six foods at a machine without an exit and removes the oldest', () => {
    const heater = machine('heater-1', 'heater', 1);
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: Array.from({ length: 7 }, (_, index) => ({
        ...createTransportingFoodItem(
          createFoodItem({
            id: `item-${index + 1}`,
            foodId: 'egg',
            createdAtMs: index,
          }),
          `connection-${index + 1}`,
          `storage-${index + 1}`,
          'heater-1',
        ),
        progress: 1,
      })),
    };
    const sources = Array.from({ length: 7 }, (_, index) =>
      machine(`storage-${index + 1}`, 'storage', index + 2),
    );
    const connections = Array.from({ length: 7 }, (_, index) =>
      connection(`connection-${index + 1}`, `storage-${index + 1}`, 'heater-1'),
    );

    const nextState = stepSimulation(state, {
      machines: [...sources, heater],
      connections,
      deltaMs: 0,
      machineConfigs: {
        'heater-1': { recipeId: 'toast' },
      },
    });

    expect(
      nextState.machineRuntimes['heater-1']?.inputBuffer.map((food) => food.id),
    ).toEqual(['item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7']);
  });

  it.each(['splitter', 'merger'] as const)(
    'discards food immediately when a %s has no exit',
    (machineId) => {
      const target = machine(`${machineId}-1`, machineId, 1);
      const state: SimulationState = {
        ...createInitialSimulationState(),
        machineRuntimes: {
          [target.id]: {
            ...createMachineRuntime(target),
            inputBuffer: [
              createFoodItem({
                id: 'held-input',
                foodId: 'egg',
                createdAtMs: 0,
              }),
            ],
            outputBuffer: [
              createFoodItem({
                id: 'held-output',
                foodId: 'milk',
                createdAtMs: 0,
              }),
            ],
          },
        },
        items: [
          {
            ...createTransportingFoodItem(
              createFoodItem({
                id: 'item-1',
                foodId: 'rice',
                createdAtMs: 0,
              }),
              'connection-1',
              'storage-1',
              target.id,
            ),
            progress: 1,
          },
        ],
      };

      const nextState = stepSimulation(state, {
        machines: [machine('storage-1', 'storage', 0), target],
        connections: [connection('connection-1', 'storage-1', target.id)],
        deltaMs: 0,
      });

      expect(nextState.items).toEqual([]);
      expect(nextState.machineRuntimes[target.id]?.inputBuffer).toEqual([]);
      expect(nextState.machineRuntimes[target.id]?.outputBuffer).toEqual([]);
    },
  );

  it('counts only food matching the shipping port target', () => {
    const shipping = machine('shipping-1', 'shipping', 1, 'rice');
    const state: SimulationState = {
      ...createInitialSimulationState(),
      items: ['rice', 'egg'].map((foodId, index) => ({
        ...createTransportingFoodItem(
          createFoodItem({
            id: `item-${index + 1}`,
            foodId,
            createdAtMs: 0,
          }),
          `connection-${index + 1}`,
          `storage-${index + 1}`,
          shipping.id,
        ),
        progress: 1,
      })),
    };
    const connections = [
      connection('connection-1', 'storage-1', shipping.id),
      connection('connection-2', 'storage-2', shipping.id),
    ];

    const nextState = stepSimulation(state, {
      machines: [
        machine('storage-1', 'storage', 0),
        machine('storage-2', 'storage', 2),
        shipping,
      ],
      connections,
      deltaMs: 0,
    });

    expect(nextState.items).toEqual([]);
    expect(nextState.shippingHistory.map((record) => record.foodId)).toEqual([
      'rice',
    ]);
    expect(nextState.machineRuntimes[shipping.id]?.inputBuffer).toEqual([]);
  });
});
