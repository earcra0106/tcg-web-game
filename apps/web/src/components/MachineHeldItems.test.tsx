import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

function renderMachineHeldItems(
  overrides: Partial<ComponentProps<typeof MachineHeldItems>> = {},
  onParentWheel?: ComponentProps<'div'>['onWheel'],
) {
  const props = {
    items: [],
    machineId: 'heater',
    selectedRecipeId: null,
    craftableFoodIds: ['cooked-rice', 'toast', 'fried-egg'],
    onSelectRecipe: vi.fn(),
    ...overrides,
  } satisfies ComponentProps<typeof MachineHeldItems>;

  return {
    ...render(
      <div onWheel={onParentWheel}>
        <MachineHeldItems {...props} />
      </div>,
    ),
    props,
  };
}

describe('MachineHeldItems', () => {
  beforeEach(() => {
    globalThis.ResizeObserver = class ResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  });

  it('always renders six input slots', () => {
    const { container } = renderMachineHeldItems();
    const inventory = container.querySelector('.machine-inventory--input');

    expect(inventory).toBeInTheDocument();
    expect(inventory?.children).toHaveLength(6);
    expect(inventory?.querySelectorAll('[data-empty="true"]')).toHaveLength(6);
  });

  it('always renders one processing slot', () => {
    const { container, rerender, props } = renderMachineHeldItems();
    const getProcessingInventory = () =>
      container.querySelector('.machine-inventory--processing');

    expect(getProcessingInventory()?.children).toHaveLength(1);
    expect(getProcessingInventory()?.firstElementChild).toHaveAttribute(
      'data-empty',
      'true',
    );

    rerender(<MachineHeldItems {...props} items={[processingItem()]} />);

    expect(
      getProcessingInventory()?.querySelector('[aria-label="ごはん"]'),
    ).not.toBeNull();
    expect(
      getProcessingInventory()?.querySelector('.machine-held-item__progress'),
    ).not.toBeNull();
  });

  it('places input items at the right side of the inventory', () => {
    const { container } = renderMachineHeldItems({
      items: [inputItem('new', 'egg'), inputItem('old', 'rice')],
    });
    const slots = container.querySelector(
      '.machine-inventory--input',
    )?.children;

    expect(slots).toHaveLength(6);
    expect(slots?.[3]).toHaveAttribute('data-empty', 'true');
    expect(slots?.[4]?.querySelector('[aria-label="卵"]')).not.toBeNull();
    expect(slots?.[5]?.querySelector('[aria-label="米"]')).not.toBeNull();
  });

  it('opens a selector containing craftable recipes for the machine', () => {
    const { container } = renderMachineHeldItems({
      craftableFoodIds: [
        'cooked-rice',
        'toast',
        'fried-egg',
        'chopped-lettuce',
      ],
    });

    fireEvent.click(
      screen.getByRole('button', { name: '製造する食べ物を選択' }),
    );

    expect(
      screen.getByRole('region', { name: '製造する食べ物を選択' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ごはん' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'トースト' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '刻みレタス' }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll('.recipe-selector__option')).toHaveLength(
      4,
    );
  });

  it('selects a recipe and closes the selector', () => {
    const onSelectRecipe = vi.fn();
    renderMachineHeldItems({ onSelectRecipe });

    fireEvent.click(
      screen.getByRole('button', { name: '製造する食べ物を選択' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'トースト' }));

    expect(onSelectRecipe).toHaveBeenCalledWith('toast');
    expect(
      screen.queryByRole('region', { name: '製造する食べ物を選択' }),
    ).not.toBeInTheDocument();
  });

  it('shows the selected recipe as a translucent preview while idle', () => {
    const { container } = renderMachineHeldItems({
      selectedRecipeId: 'toast',
    });

    expect(
      container.querySelector(
        '.machine-held-item__recipe-preview [aria-label="トースト"]',
      ),
    ).not.toBeNull();
  });

  it('clears a selected recipe from the empty option', () => {
    const onSelectRecipe = vi.fn();
    renderMachineHeldItems({ selectedRecipeId: 'toast', onSelectRecipe });

    fireEvent.click(
      screen.getByRole('button', { name: '製造する食べ物を選択' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'レシピ指定を解除' }));

    expect(onSelectRecipe).toHaveBeenCalledWith(null);
  });

  it('moves overflowing recipe options horizontally with the mouse wheel', () => {
    const { container } = renderMachineHeldItems();

    fireEvent.click(
      screen.getByRole('button', { name: '製造する食べ物を選択' }),
    );

    const options = container.querySelector(
      '.recipe-selector__options',
    ) as HTMLDivElement;
    Object.defineProperties(options, {
      clientWidth: { configurable: true, value: 160 },
      scrollWidth: { configurable: true, value: 240 },
      scrollLeft: { configurable: true, value: 0, writable: true },
    });

    fireEvent.wheel(options, { deltaY: 24 });

    expect(options.scrollLeft).toBe(24);
  });

  it('does not pass wheel input from the selector to the camera area', () => {
    const onParentWheel = vi.fn();
    renderMachineHeldItems({}, onParentWheel);

    fireEvent.click(
      screen.getByRole('button', { name: '製造する食べ物を選択' }),
    );
    fireEvent.wheel(
      screen.getByRole('region', { name: '製造する食べ物を選択' }),
      { deltaY: 24 },
    );

    expect(onParentWheel).not.toHaveBeenCalled();
  });
});
