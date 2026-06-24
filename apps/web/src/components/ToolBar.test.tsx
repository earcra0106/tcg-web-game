import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolBar } from './ToolBar.tsx';

describe('ToolBar', () => {
  beforeEach(() => {
    globalThis.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  it('starts mouse placement without also selecting on the following click', () => {
    const onSelectTool = vi.fn();
    const onStartPlacementDrag = vi.fn();

    render(
      <ToolBar
        selectedTool={{ kind: 'select' }}
        storageFoodIds={[]}
        shippingFoodIds={[]}
        onSelectTool={onSelectTool}
        onStartPlacementDrag={onStartPlacementDrag}
      />,
    );

    const cutterButton = screen.getByRole('button', { name: /切断機/ });

    fireEvent.pointerDown(cutterButton, {
      pointerType: 'mouse',
      button: 0,
      pointerId: 1,
      clientX: 24,
      clientY: 32,
    });
    fireEvent.click(cutterButton);

    expect(onStartPlacementDrag).toHaveBeenCalledOnce();
    expect(onStartPlacementDrag).toHaveBeenCalledWith(
      { kind: 'place-machine', machineId: 'cutter' },
      expect.objectContaining({
        pointerId: 1,
        clientX: 24,
        clientY: 32,
      }),
    );
    expect(onSelectTool).not.toHaveBeenCalled();
  });

  it('selects a placement tool from a non-mouse click', () => {
    const onSelectTool = vi.fn();

    render(
      <ToolBar
        selectedTool={{ kind: 'select' }}
        storageFoodIds={[]}
        shippingFoodIds={[]}
        onSelectTool={onSelectTool}
        onStartPlacementDrag={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /切断機/ }));

    expect(onSelectTool).toHaveBeenCalledOnce();
    expect(onSelectTool).toHaveBeenCalledWith({
      kind: 'place-machine',
      machineId: 'cutter',
    });
  });
});
