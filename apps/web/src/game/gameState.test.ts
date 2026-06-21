import { describe, expect, it } from 'vitest';
import {
  connectMachinesInState,
  createInitialGameState,
  placeMachineInState,
  removeMachineFromState,
} from './gameState.ts';

describe('game state', () => {
  it('creates the initial game state', () => {
    expect(createInitialGameState()).toEqual({
      machines: [],
      connections: [],
      stageIndex: 0,
      selection: {
        selectedMachineId: null,
      },
    });
  });

  it('places machines through state updates', () => {
    const state = createInitialGameState();
    const nextState = placeMachineInState(state, {
      id: 'machine-1',
      machineId: 'cutter',
      position: { x: 0, z: 0 },
    });

    expect(nextState).not.toBe(state);
    expect(nextState.machines).toHaveLength(1);
  });

  it('keeps state identity when placement is rejected', () => {
    const state = placeMachineInState(createInitialGameState(), {
      id: 'machine-1',
      machineId: 'cutter',
      position: { x: 0, z: 0 },
    });

    expect(
      placeMachineInState(state, {
        id: 'machine-2',
        machineId: 'heater',
        position: { x: 0, z: 0 },
      }),
    ).toBe(state);
  });

  it('connects existing machines through state updates', () => {
    const state = [
      {
        id: 'machine-1',
        machineId: 'cutter' as const,
        position: { x: 0, z: 0 },
      },
      {
        id: 'machine-2',
        machineId: 'heater' as const,
        position: { x: 1, z: 0 },
      },
    ].reduce(placeMachineInState, createInitialGameState());

    const nextState = connectMachinesInState(state, {
      id: 'connection-1',
      fromMachineId: 'machine-1',
      toMachineId: 'machine-2',
    });

    expect(nextState.connections).toEqual([
      {
        id: 'connection-1',
        fromMachineId: 'machine-1',
        toMachineId: 'machine-2',
      },
    ]);
  });

  it('removes a machine and its related connections', () => {
    const state = connectMachinesInState(
      [
        {
          id: 'machine-1',
          machineId: 'cutter' as const,
          position: { x: 0, z: 0 },
        },
        {
          id: 'machine-2',
          machineId: 'heater' as const,
          position: { x: 1, z: 0 },
        },
      ].reduce(placeMachineInState, {
        ...createInitialGameState(),
        selection: { selectedMachineId: 'machine-1' },
      }),
      {
        id: 'connection-1',
        fromMachineId: 'machine-1',
        toMachineId: 'machine-2',
      },
    );

    const nextState = removeMachineFromState(state, 'machine-1');

    expect(nextState.machines).toEqual([
      {
        id: 'machine-2',
        machineId: 'heater',
        position: { x: 1, z: 0 },
      },
    ]);
    expect(nextState.connections).toEqual([]);
    expect(nextState.selection.selectedMachineId).toBeNull();
  });
});
