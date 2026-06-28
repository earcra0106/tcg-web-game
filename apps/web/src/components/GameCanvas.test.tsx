import { render } from '@testing-library/react';
import type { ComponentProps, PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GameCanvas } from './GameCanvas.tsx';

const { orbitControlsSpy } = vi.hoisted(() => ({
  orbitControlsSpy: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: (props: Record<string, unknown>) => {
    orbitControlsSpy(props);
    return null;
  },
}));

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: PropsWithChildren) => <>{children}</>,
  useLoader: { preload: vi.fn() },
}));

vi.mock('./GameScene.tsx', () => ({
  GameScene: () => null,
}));

describe('GameCanvas', () => {
  it('allows dollying out twice as far and pans parallel to the XZ plane', () => {
    const props = {
      model: {} as ComponentProps<typeof GameCanvas>['model'],
      renderView: {} as ComponentProps<typeof GameCanvas>['renderView'],
      craftableFoodIds: [],
      dragPlacementTool: null,
      isDraggingPlacement: false,
      onModelChange: vi.fn(),
      onPlacementDrop: vi.fn(),
      onPlaySound: vi.fn(),
    } satisfies ComponentProps<typeof GameCanvas>;

    render(<GameCanvas {...props} />);

    expect(orbitControlsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        maxDistance: 20,
        screenSpacePanning: false,
      }),
    );
  });
});
