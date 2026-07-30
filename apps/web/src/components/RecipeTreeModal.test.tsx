import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeTreeModal } from './RecipeTreeModal.tsx';

describe('RecipeTreeModal', () => {
  it('shows storage guidance without a recipe tree for a basic food', () => {
    render(<RecipeTreeModal targetFoodId="rice" onClose={vi.fn()} />);

    expect(
      screen.getByRole('dialog', { name: '米のレシピツリー' }),
    ).toHaveTextContent('米は倉庫から搬入できます');
    expect(
      screen.queryByLabelText('レシピツリー表示領域'),
    ).not.toBeInTheDocument();
  });

  it('shows a recipe with its machine and expands then collapses subrecipes', () => {
    render(<RecipeTreeModal targetFoodId="tomato-sauce" onClose={vi.fn()} />);

    expect(screen.getByText('ミキサー')).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'スライストマトのレシピを展開する' }),
    );

    expect(screen.getByText('切断機')).toBeInTheDocument();
    expect(screen.getByText('トマト')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'スライストマトのレシピを折りたたむ',
      }),
    );

    expect(screen.queryByText('切断機')).not.toBeInTheDocument();
    expect(screen.queryByText('トマト')).not.toBeInTheDocument();
  });

  it('keeps the root recipe expanded during Strict Mode double rendering', () => {
    render(
      <StrictMode>
        <RecipeTreeModal targetFoodId="toast" onClose={vi.fn()} />
      </StrictMode>,
    );

    expect(screen.getByText('加熱機')).toBeInTheDocument();
    expect(screen.getByText('食パン')).toBeInTheDocument();
  });

  it('centers and fits the initially displayed tree with 100px padding', () => {
    const clientWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth',
    );
    const clientHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientHeight',
    );
    const offsetWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth',
    );
    const offsetHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetHeight',
    );

    Object.defineProperties(HTMLElement.prototype, {
      clientWidth: {
        configurable: true,
        get() {
          return this.classList.contains('recipe-tree-modal__body') ? 800 : 0;
        },
      },
      clientHeight: {
        configurable: true,
        get() {
          return this.classList.contains('recipe-tree-modal__body') ? 600 : 0;
        },
      },
      offsetWidth: {
        configurable: true,
        get() {
          return this.classList.contains('recipe-tree-modal__content')
            ? 600
            : 0;
        },
      },
      offsetHeight: {
        configurable: true,
        get() {
          return this.classList.contains('recipe-tree-modal__content')
            ? 200
            : 0;
        },
      },
    });

    try {
      render(<RecipeTreeModal targetFoodId="toast" onClose={vi.fn()} />);

      expect(screen.getByTestId('recipe-tree-viewport')).toHaveStyle(
        'transform: translate(100px, 200px) scale(1)',
      );
    } finally {
      const originalDescriptors = {
        clientWidth,
        clientHeight,
        offsetWidth,
        offsetHeight,
      };

      for (const [property, descriptor] of Object.entries(
        originalDescriptors,
      )) {
        if (descriptor === undefined) {
          Reflect.deleteProperty(HTMLElement.prototype, property);
        } else {
          Object.defineProperty(HTMLElement.prototype, property, descriptor);
        }
      }
    }
  });

  it('pans the tree by dragging the display area', () => {
    render(<RecipeTreeModal targetFoodId="toast" onClose={vi.fn()} />);
    const displayArea = document.body.querySelector(
      '.recipe-tree-modal__body',
    )!;
    const viewport = screen.getByTestId('recipe-tree-viewport');

    fireEvent.pointerDown(displayArea, {
      button: 0,
      pointerId: 1,
      clientX: 20,
      clientY: 30,
    });
    fireEvent.pointerMove(displayArea, {
      pointerId: 1,
      clientX: 50,
      clientY: 70,
    });

    expect(viewport).toHaveStyle('transform: translate(30px, 40px) scale(1)');
  });

  it('zooms the tree with the mouse wheel and a pinch gesture', () => {
    render(<RecipeTreeModal targetFoodId="toast" onClose={vi.fn()} />);
    const displayArea = document.body.querySelector(
      '.recipe-tree-modal__body',
    )!;
    const viewport = screen.getByTestId('recipe-tree-viewport');

    fireEvent.wheel(displayArea, {
      deltaY: -100,
      clientX: 100,
      clientY: 100,
    });
    expect(viewport.style.transform).toContain('scale(1.105');

    fireEvent.pointerDown(displayArea, {
      button: 0,
      pointerId: 1,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerDown(displayArea, {
      button: 0,
      pointerId: 2,
      clientX: 0,
      clientY: 100,
    });
    fireEvent.pointerMove(displayArea, {
      pointerId: 2,
      clientX: 0,
      clientY: 200,
    });

    expect(viewport.style.transform).toContain('scale(2.210');
  });

  it('closes from the backdrop, close button, and Escape key', () => {
    const onClose = vi.fn();
    render(<RecipeTreeModal targetFoodId="toast" onClose={onClose} />);

    fireEvent.pointerDown(screen.getByRole('presentation'));
    fireEvent.click(
      screen.getByRole('button', { name: 'レシピツリーモーダルを閉じる' }),
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
