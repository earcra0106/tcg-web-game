import { describe, expect, it } from 'vitest';
import { createConveyorRenderModel } from './conveyorRender.ts';

describe('conveyor render model', () => {
  it('creates a horizontal conveyor model', () => {
    expect(
      createConveyorRenderModel({
        from: { x: 0, z: 0 },
        to: { x: 2, z: 0 },
        nowMs: 0,
      }),
    ).toMatchObject({
      start: { x: 0, y: 0.04, z: 0 },
      end: { x: 2, y: 0.04, z: 0 },
      midpoint: { x: 1, y: 0.04, z: 0 },
      length: 2,
      angleRad: 0,
      glowScale: [2, 0.08, 0.28],
    });
  });

  it('orients markers toward the destination', () => {
    const model = createConveyorRenderModel({
      from: { x: 0, z: 0 },
      to: { x: 0, z: 2 },
      nowMs: 300,
      markerCount: 2,
    });

    expect(model.angleRad).toBeCloseTo(-Math.PI / 2);
    expect(model.triangleMarkers).toHaveLength(2);
    expect(model.triangleMarkers[0].progress).toBe(0.25);
    expect(model.triangleMarkers[0].position.x).toBe(0);
    expect(model.triangleMarkers[0].position.y).toBeCloseTo(0.058);
    expect(model.triangleMarkers[0].position.z).toBe(0.5);
    expect(model.triangleMarkers[1].progress).toBe(0.75);
  });

  it('normalizes marker progress', () => {
    const model = createConveyorRenderModel({
      from: { x: 0, z: 0 },
      to: { x: 1, z: 1 },
      nowMs: 1_500,
    });

    expect(model.triangleMarkers.every((marker) => marker.progress >= 0)).toBe(
      true,
    );
    expect(model.triangleMarkers.every((marker) => marker.progress < 1)).toBe(
      true,
    );
  });
});
