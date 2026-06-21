import { describe, expect, it } from 'vitest';
import type { MachineConnection } from './connections.ts';
import { createFoodItem } from './items.ts';
import {
  advanceMachineRuntime,
  canAcceptMachineInput,
  createMachineRuntime,
  extractMachineOutput,
  receiveMachineInput,
  type MachineRuntime,
} from './machineRuntime.ts';
import type { MachineId } from './machine.ts';
import type { PlacedMachine } from './placement.ts';

function machine(id: string, machineId: MachineId): PlacedMachine {
  return {
    id,
    machineId,
    position: { x: 0, z: 0 },
  };
}

function item(id: string, foodId: string) {
  return createFoodItem({
    id,
    foodId,
    createdAtMs: 0,
  });
}

function createItemId() {
  return 'created-item';
}

describe('machine runtime', () => {
  it('spawns configured storage food at fixed intervals', () => {
    const runtime = advanceMachineRuntime({
      runtime: createMachineRuntime(machine('storage-1', 'storage')),
      deltaMs: 1_000,
      nowMs: 1_000,
      config: { spawnFoodId: 'rice' },
      createItemId,
    });

    expect(runtime.outputBuffer).toMatchObject({
      id: 'created-item',
      foodId: 'rice',
      createdAtMs: 1_000,
    });
  });

  it('processes matching recipes for production machines', () => {
    const processing = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('heater-1', 'heater')),
        inputBuffer: [item('item-1', 'rice')],
      },
      deltaMs: 0,
      nowMs: 0,
      createItemId,
    });

    expect(processing.process).toMatchObject({
      recipeId: 'cooked-rice',
      outputFoodId: 'cooked-rice',
    });
    expect(processing.inputBuffer).toEqual([]);

    const completed = advanceMachineRuntime({
      runtime: processing,
      deltaMs: 1_000,
      nowMs: 1_000,
      createItemId,
    });

    expect(completed.outputBuffer).toMatchObject({
      foodId: 'cooked-rice',
    });
  });

  it('does not start processing until required ingredients are available', () => {
    const runtime = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('combiner-1', 'combiner')),
        inputBuffer: [item('item-1', 'sliced-tomato')],
      },
      deltaMs: 1_000,
      nowMs: 1_000,
      createItemId,
    });

    expect(runtime.process).toBeNull();
    expect(runtime.inputBuffer).toHaveLength(1);
  });

  it('keeps ingredients that do not match the requested recipe', () => {
    const runtime = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('heater-1', 'heater')),
        inputBuffer: [item('item-1', 'rice')],
      },
      deltaMs: 1_000,
      nowMs: 1_000,
      config: { recipeId: 'toast' },
      createItemId,
    });

    expect(runtime.process).toBeNull();
    expect(runtime.inputBuffer).toEqual([item('item-1', 'rice')]);
  });

  it('routes splitter output in round-robin order', () => {
    const connections: readonly MachineConnection[] = [
      {
        id: 'connection-1',
        fromMachineId: 'splitter-1',
        toMachineId: 'heater-1',
      },
      {
        id: 'connection-2',
        fromMachineId: 'splitter-1',
        toMachineId: 'cutter-1',
      },
    ];
    const runtime: MachineRuntime = {
      ...createMachineRuntime(machine('splitter-1', 'splitter')),
      outputBuffer: item('item-1', 'rice'),
    };

    const firstOutput = extractMachineOutput({
      runtime,
      outputConnections: connections,
      occupiedConnectionIds: new Set(),
    });

    expect(firstOutput?.connection.id).toBe('connection-1');

    const secondOutput = extractMachineOutput({
      runtime: {
        ...(firstOutput?.runtime ?? runtime),
        outputBuffer: item('item-2', 'rice'),
      },
      outputConnections: connections,
      occupiedConnectionIds: new Set(),
    });

    expect(secondOutput?.connection.id).toBe('connection-2');
  });

  it('passes merger inputs through in received order', () => {
    const runtime = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('merger-1', 'merger')),
        inputBuffer: [item('item-1', 'rice'), item('item-2', 'egg')],
      },
      deltaMs: 0,
      nowMs: 0,
      createItemId,
    });

    expect(runtime.outputBuffer).toMatchObject({ id: 'item-1' });
    expect(runtime.inputBuffer).toEqual([item('item-2', 'egg')]);
  });

  it('accepts trash input without retaining it', () => {
    const runtime = createMachineRuntime(machine('trash-1', 'trash-bin'));

    expect(canAcceptMachineInput(runtime)).toBe(true);
    expect(receiveMachineInput(runtime, item('item-1', 'rice'))).toBe(runtime);
  });
});
