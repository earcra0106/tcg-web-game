import { describe, expect, it } from 'vitest';
import { getAspectRatio, getViewportSize } from './viewport.ts';

describe('viewport helpers', () => {
  it('keeps viewport dimensions above zero', () => {
    expect(getViewportSize({ clientWidth: 0, clientHeight: 0 }, 1)).toEqual({
      width: 1,
      height: 1,
      pixelRatio: 1,
    });
  });

  it('caps pixel ratio for stable rendering cost', () => {
    expect(
      getViewportSize({ clientWidth: 1200, clientHeight: 800 }, 3),
    ).toEqual({
      width: 1200,
      height: 800,
      pixelRatio: 2,
    });
  });

  it('calculates aspect ratio from viewport size', () => {
    expect(getAspectRatio({ width: 16, height: 9 })).toBeCloseTo(16 / 9);
  });
});
