import { describe, expect, it } from 'vitest';
import {
  findMachineAtPosition,
  findMachineById,
  placeMachine,
  removeMachine,
  type PlacedMachine,
} from './placement.ts';

const cutter: PlacedMachine = {
  id: 'machine-1',
  machineId: 'cutter',
  position: { x: 0, z: 0 },
};

describe('machine placement', () => {
  it('places a machine into an empty integer grid cell', () => {
    expect(placeMachine([], cutter)).toEqual([cutter]);
  });

  it('rejects non-integer grid positions', () => {
    const machines: readonly PlacedMachine[] = [];
    const nextMachines = placeMachine(machines, {
      id: 'machine-2',
      machineId: 'heater',
      position: { x: 1.5, z: 0 },
    });

    expect(nextMachines).toBe(machines);
  });

  it('prevents duplicate placement in the same cell', () => {
    const machines = [cutter];
    const nextMachines = placeMachine(machines, {
      id: 'machine-2',
      machineId: 'heater',
      position: { x: 0, z: 0 },
    });

    expect(nextMachines).toBe(machines);
  });

  it('prevents duplicate placement ids', () => {
    const machines = [cutter];
    const nextMachines = placeMachine(machines, {
      id: 'machine-1',
      machineId: 'heater',
      position: { x: 1, z: 0 },
    });

    expect(nextMachines).toBe(machines);
  });

  it('finds machines by id and position', () => {
    expect(findMachineById([cutter], 'machine-1')).toBe(cutter);
    expect(findMachineAtPosition([cutter], { x: 0, z: 0 })).toBe(cutter);
    expect(findMachineAtPosition([cutter], { x: 1, z: 0 })).toBeNull();
  });

  it('removes a placed machine', () => {
    expect(removeMachine([cutter], 'machine-1')).toEqual([]);
  });
});
