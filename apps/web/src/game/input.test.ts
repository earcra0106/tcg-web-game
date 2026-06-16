import { describe, expect, it } from 'vitest';
import {
  createInitialInputState,
  directionForCode,
  getMovementVector,
  updateInputState,
} from './input.ts';

describe('input state', () => {
  it('creates a neutral input state', () => {
    expect(createInitialInputState()).toEqual({
      forward: false,
      backward: false,
      left: false,
      right: false,
    });
  });

  it('maps keyboard codes to movement directions', () => {
    expect(directionForCode('KeyW')).toBe('forward');
    expect(directionForCode('ArrowDown')).toBe('backward');
    expect(directionForCode('KeyA')).toBe('left');
    expect(directionForCode('ArrowRight')).toBe('right');
    expect(directionForCode('Space')).toBeNull();
  });

  it('updates only known movement keys', () => {
    const state = createInitialInputState();
    const nextState = updateInputState(state, 'KeyW', true);

    expect(nextState).toEqual({ ...state, forward: true });
    expect(updateInputState(nextState, 'Space', true)).toBe(nextState);
  });

  it('calculates a movement vector from active directions', () => {
    const state = {
      ...createInitialInputState(),
      forward: true,
      right: true,
    };

    expect(getMovementVector(state)).toEqual({ x: 1, z: -1 });
  });
});
