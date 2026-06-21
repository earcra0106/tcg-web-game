import type { MachineId } from './machine.ts';
import { gridKey, isValidGridPosition, type GridPosition } from './grid.ts';

export type PlacementId = string;

export type PlacedMachine = {
  id: PlacementId;
  machineId: MachineId;
  position: GridPosition;
};

export function findMachineAtPosition(
  machines: readonly PlacedMachine[],
  position: GridPosition,
) {
  const key = gridKey(position);

  return machines.find((machine) => gridKey(machine.position) === key) ?? null;
}

export function findMachineById(
  machines: readonly PlacedMachine[],
  machineId: PlacementId,
) {
  return machines.find((machine) => machine.id === machineId) ?? null;
}

export function placeMachine(
  machines: readonly PlacedMachine[],
  machine: PlacedMachine,
) {
  if (!isValidGridPosition(machine.position)) {
    return machines;
  }

  if (findMachineById(machines, machine.id)) {
    return machines;
  }

  if (findMachineAtPosition(machines, machine.position)) {
    return machines;
  }

  return [...machines, machine];
}

export function removeMachine(
  machines: readonly PlacedMachine[],
  machineId: PlacementId,
) {
  return machines.filter((machine) => machine.id !== machineId);
}
