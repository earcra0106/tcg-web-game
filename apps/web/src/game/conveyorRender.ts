import {
  toWorldPosition,
  type GridPosition,
  type WorldPosition,
} from './grid.ts';

export type ConveyorTriangleMarker = {
  position: WorldPosition;
  angleRad: number;
  progress: number;
};

export type ConveyorRenderModel = {
  start: WorldPosition;
  end: WorldPosition;
  midpoint: WorldPosition;
  length: number;
  angleRad: number;
  glowScale: [number, number, number];
  triangleMarkers: readonly ConveyorTriangleMarker[];
};

export type ConveyorRenderInput = {
  from: GridPosition;
  to: GridPosition;
  cellSize?: number;
  height?: number;
  nowMs?: number;
  markerCount?: number;
};

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function normalizeProgress(progress: number) {
  return ((progress % 1) + 1) % 1;
}

export function createConveyorRenderModel({
  from,
  to,
  cellSize = 1,
  height = 0.04,
  nowMs = 0,
  markerCount = 3,
}: ConveyorRenderInput): ConveyorRenderModel {
  const start = toWorldPosition(from, cellSize, height);
  const end = toWorldPosition(to, cellSize, height);
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const length = Math.hypot(dx, dz);
  const rawAngleRad = Math.atan2(-dz, dx);
  const angleRad = Object.is(rawAngleRad, -0) ? 0 : rawAngleRad;
  const baseProgress = normalizeProgress(nowMs / 1_200);
  const markerSpacing = markerCount > 0 ? 1 / markerCount : 1;

  return {
    start,
    end,
    midpoint: {
      x: (start.x + end.x) / 2,
      y: height,
      z: (start.z + end.z) / 2,
    },
    length,
    angleRad,
    glowScale: [Math.max(length, 0.001), 0.08, 0.28],
    triangleMarkers: Array.from({ length: markerCount }, (_, index) => {
      const progress = normalizeProgress(baseProgress + index * markerSpacing);

      return {
        progress,
        angleRad,
        position: {
          x: lerp(start.x, end.x, progress),
          y: height + 0.075,
          z: lerp(start.z, end.z, progress),
        },
      };
    }),
  };
}
