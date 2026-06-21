import { describe, expect, it } from 'vitest';
import {
  getAdjacentDirection,
  getAdjacentPosition,
  gridKey,
  isSameGridPosition,
  isValidGridPosition,
  toWorldPosition,
} from './grid.ts';

describe('grid helpers', () => {
  it('creates stable keys from integer coordinates', () => {
    expect(gridKey({ x: 2, z: -3 })).toBe('2:-3');
    expect(gridKey({ x: 2, z: -3 })).toBe(gridKey({ x: 2, z: -3 }));
  });

  it('checks grid position equality', () => {
    expect(isSameGridPosition({ x: 1, z: 2 }, { x: 1, z: 2 })).toBe(true);
    expect(isSameGridPosition({ x: 1, z: 2 }, { x: 2, z: 1 })).toBe(false);
  });

  it('accepts only integer grid coordinates', () => {
    expect(isValidGridPosition({ x: 0, z: -1 })).toBe(true);
    expect(isValidGridPosition({ x: 0.5, z: -1 })).toBe(false);
    expect(isValidGridPosition({ x: 0, z: -1.5 })).toBe(false);
  });

  it('converts grid coordinates into world coordinates', () => {
    expect(toWorldPosition({ x: 3, z: -2 }, 4, 1)).toEqual({
      x: 12,
      y: 1,
      z: -8,
    });
  });

  it('calculates adjacent positions and directions', () => {
    const origin = { x: 4, z: 5 };

    expect(getAdjacentPosition(origin, 'north')).toEqual({ x: 4, z: 4 });
    expect(getAdjacentPosition(origin, 'east')).toEqual({ x: 5, z: 5 });
    expect(getAdjacentDirection(origin, { x: 4, z: 6 })).toBe('south');
    expect(getAdjacentDirection(origin, { x: 6, z: 5 })).toBeNull();
  });
});
