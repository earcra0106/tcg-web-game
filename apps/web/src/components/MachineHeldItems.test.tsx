import { render } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { RenderMachineHeldItemView } from '../game/renderView.ts';
import { MachineHeldItems } from './MachineHeldItems.tsx';

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: PropsWithChildren) => <>{children}</>,
}));

function inputItem(id: string, foodId: string): RenderMachineHeldItemView {
  return {
    id,
    foodId,
    spriteId: foodId,
    status: 'input',
    progress: null,
  };
}

function processingItem(): RenderMachineHeldItemView {
  return {
    id: 'processing',
    foodId: 'cooked-rice',
    spriteId: 'cooked-rice',
    status: 'processing',
    progress: 0.5,
  };
}

describe('MachineHeldItems', () => {
  it('always renders six input slots', () => {
    const { container } = render(<MachineHeldItems items={[]} />);
    const inventory = container.querySelector('.machine-inventory--input');

    expect(inventory).toBeInTheDocument();
    expect(inventory?.children).toHaveLength(6);
    expect(inventory?.querySelectorAll('[data-empty="true"]')).toHaveLength(6);
  });

  it('always renders one processing slot', () => {
    const { container, rerender } = render(<MachineHeldItems items={[]} />);
    const getProcessingInventory = () =>
      container.querySelector('.machine-inventory--processing');

    expect(getProcessingInventory()?.children).toHaveLength(1);
    expect(getProcessingInventory()?.firstElementChild).toHaveAttribute(
      'data-empty',
      'true',
    );

    rerender(<MachineHeldItems items={[processingItem()]} />);

    expect(
      getProcessingInventory()?.querySelector('[aria-label="ごはん"]'),
    ).not.toBeNull();
    expect(
      getProcessingInventory()?.querySelector('.machine-held-item__progress'),
    ).not.toBeNull();
  });

  it('places input items at the right side of the inventory', () => {
    const { container } = render(
      <MachineHeldItems
        items={[inputItem('new', 'egg'), inputItem('old', 'rice')]}
      />,
    );
    const slots = container.querySelector(
      '.machine-inventory--input',
    )?.children;

    expect(slots).toHaveLength(6);
    expect(slots?.[3]).toHaveAttribute('data-empty', 'true');
    expect(slots?.[4]?.querySelector('[aria-label="卵"]')).not.toBeNull();
    expect(slots?.[5]?.querySelector('[aria-label="米"]')).not.toBeNull();
  });
});
