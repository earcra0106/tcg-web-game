import { describe, expect, it } from 'vitest';
import type { MachineConnection } from './connections.ts';
import { createFoodItem } from './items.ts';
import {
  advanceMachineRuntime,
  canAcceptMachineInput,
  createMachineRuntime,
  extractMachineOutput,
  MACHINE_OUTPUT_CAPACITY,
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
    const waiting = advanceMachineRuntime({
      runtime: createMachineRuntime(machine('storage-1', 'storage')),
      deltaMs: 1_999,
      nowMs: 1_999,
      hasOutputConnection: true,
      config: { spawnFoodId: 'rice' },
      createItemId,
    });

    expect(waiting.outputBuffer).toEqual([]);

    const runtime = advanceMachineRuntime({
      runtime: waiting,
      deltaMs: 1,
      nowMs: 2_000,
      hasOutputConnection: true,
      config: { spawnFoodId: 'rice' },
      createItemId,
    });

    expect(runtime.outputBuffer).toEqual([
      expect.objectContaining({
        id: 'created-item',
        foodId: 'rice',
        createdAtMs: 2_000,
      }),
    ]);
  });

  it('waits for another interval when storage has no output connection', () => {
    const disconnected = advanceMachineRuntime({
      runtime: createMachineRuntime(machine('storage-1', 'storage')),
      deltaMs: 2_000,
      nowMs: 2_000,
      config: { spawnFoodId: 'rice' },
      createItemId,
    });

    expect(disconnected.outputBuffer).toEqual([]);
    expect(disconnected.storageElapsedMs).toBe(0);

    const connected = advanceMachineRuntime({
      runtime: disconnected,
      deltaMs: 2_000,
      nowMs: 4_000,
      hasOutputConnection: true,
      config: { spawnFoodId: 'rice' },
      createItemId,
    });

    expect(connected.outputBuffer).toHaveLength(1);
  });

  it('keeps only the first storage output while it is waiting', () => {
    let nextItemIndex = 1;
    let runtime = createMachineRuntime(machine('storage-1', 'storage'));

    for (let index = 0; index < MACHINE_OUTPUT_CAPACITY + 1; index += 1) {
      runtime = advanceMachineRuntime({
        runtime,
        deltaMs: 2_000,
        nowMs: (index + 1) * 2_000,
        hasOutputConnection: true,
        config: { spawnFoodId: 'rice' },
        createItemId: () => `item-${nextItemIndex++}`,
      });
    }

    expect(runtime.outputBuffer.map((output) => output.id)).toEqual(['item-1']);
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
      deltaMs: 500,
      nowMs: 500,
      createItemId,
    });

    expect(completed.outputBuffer).toEqual([
      expect.objectContaining({
        foodId: 'cooked-rice',
      }),
    ]);
  });

  it('discards a completed item when an output is already waiting', () => {
    const existingOutput = item('existing-output', 'toast');
    const completed = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('heater-1', 'heater')),
        outputBuffer: [existingOutput],
        process: {
          recipeId: 'cooked-rice',
          outputFoodId: 'cooked-rice',
          remainingMs: 100,
        },
      },
      deltaMs: 100,
      nowMs: 1_000,
      createItemId,
    });

    expect(completed.outputBuffer).toEqual([existingOutput]);
    expect(completed.process).toBeNull();
  });

  it('finishes the current process before applying a changed recipe', () => {
    const completed = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('heater-1', 'heater')),
        inputBuffer: [item('bread-1', 'bread')],
        process: {
          recipeId: 'cooked-rice',
          outputFoodId: 'cooked-rice',
          remainingMs: 100,
        },
      },
      deltaMs: 100,
      nowMs: 1_000,
      config: { recipeId: 'toast' },
      createItemId,
    });

    expect(completed.outputBuffer).toEqual([
      expect.objectContaining({ foodId: 'cooked-rice' }),
    ]);
    expect(completed.inputBuffer).toEqual([]);
    expect(completed.process).toMatchObject({
      recipeId: 'toast',
      outputFoodId: 'toast',
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
      {
        id: 'connection-3',
        fromMachineId: 'splitter-1',
        toMachineId: 'combiner-1',
      },
      {
        id: 'connection-4',
        fromMachineId: 'splitter-1',
        toMachineId: 'shipping-1',
      },
    ];
    const runtime: MachineRuntime = {
      ...createMachineRuntime(machine('splitter-1', 'splitter')),
      outputBuffer: [item('item-1', 'rice')],
    };

    const firstOutput = extractMachineOutput({
      runtime,
      outputConnections: connections,
    });

    expect(firstOutput?.connection.id).toBe('connection-1');

    const secondOutput = extractMachineOutput({
      runtime: {
        ...(firstOutput?.runtime ?? runtime),
        outputBuffer: [item('item-2', 'rice')],
      },
      outputConnections: connections,
    });

    expect(secondOutput?.connection.id).toBe('connection-2');

    const thirdOutput = extractMachineOutput({
      runtime: {
        ...(secondOutput?.runtime ?? runtime),
        outputBuffer: [item('item-3', 'rice')],
      },
      outputConnections: connections,
    });

    expect(thirdOutput?.connection.id).toBe('connection-3');

    const fourthOutput = extractMachineOutput({
      runtime: {
        ...(thirdOutput?.runtime ?? runtime),
        outputBuffer: [item('item-4', 'rice')],
      },
      outputConnections: connections,
    });

    expect(fourthOutput?.connection.id).toBe('connection-4');

    const fifthOutput = extractMachineOutput({
      runtime: {
        ...(fourthOutput?.runtime ?? runtime),
        outputBuffer: [item('item-5', 'rice')],
      },
      outputConnections: connections,
    });

    expect(fifthOutput?.connection.id).toBe('connection-1');
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

    expect(runtime.outputBuffer).toEqual([
      expect.objectContaining({ id: 'item-1' }),
    ]);
    expect(runtime.inputBuffer).toEqual([item('item-2', 'egg')]);
  });

  it('uses the oldest matching ingredients first', () => {
    const runtime = advanceMachineRuntime({
      runtime: {
        ...createMachineRuntime(machine('combiner-1', 'combiner')),
        inputBuffer: [
          item('old-toast', 'toast'),
          item('old-cheese', 'cheese'),
          item('new-toast', 'toast'),
          item('new-cheese', 'cheese'),
        ],
      },
      deltaMs: 0,
      nowMs: 0,
      config: { recipeId: 'cheese-toast' },
      createItemId,
    });

    expect(runtime.process?.recipeId).toBe('cheese-toast');
    expect(runtime.inputBuffer.map((input) => input.id)).toEqual([
      'new-toast',
      'new-cheese',
    ]);
  });

  it('accepts trash input without retaining it', () => {
    const runtime = createMachineRuntime(machine('trash-1', 'trash-bin'));

    expect(canAcceptMachineInput(runtime)).toBe(true);
    expect(receiveMachineInput(runtime, item('item-1', 'rice'))).toBe(runtime);
  });
});
