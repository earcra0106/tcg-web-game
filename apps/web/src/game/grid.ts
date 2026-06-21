export type GridPosition = {
  x: number;
  z: number;
};

export type WorldPosition = {
  x: number;
  y: number;
  z: number;
};

export type GridDirection = 'north' | 'south' | 'west' | 'east';

export function isValidGridPosition(position: GridPosition) {
  return Number.isInteger(position.x) && Number.isInteger(position.z);
}

export function gridKey(position: GridPosition) {
  return `${position.x}:${position.z}`;
}

export function isSameGridPosition(first: GridPosition, second: GridPosition) {
  return first.x === second.x && first.z === second.z;
}

export function toWorldPosition(
  position: GridPosition,
  cellSize = 1,
  y = 0,
): WorldPosition {
  return {
    x: position.x * cellSize,
    y,
    z: position.z * cellSize,
  };
}

export function getAdjacentPosition(
  position: GridPosition,
  direction: GridDirection,
): GridPosition {
  if (direction === 'north') {
    return { x: position.x, z: position.z - 1 };
  }

  if (direction === 'south') {
    return { x: position.x, z: position.z + 1 };
  }

  if (direction === 'west') {
    return { x: position.x - 1, z: position.z };
  }

  return { x: position.x + 1, z: position.z };
}

export function getAdjacentDirection(
  from: GridPosition,
  to: GridPosition,
): GridDirection | null {
  const dx = to.x - from.x;
  const dz = to.z - from.z;

  if (dx === 0 && dz === -1) {
    return 'north';
  }

  if (dx === 0 && dz === 1) {
    return 'south';
  }

  if (dx === -1 && dz === 0) {
    return 'west';
  }

  if (dx === 1 && dz === 0) {
    return 'east';
  }

  return null;
}
