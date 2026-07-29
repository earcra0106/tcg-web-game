import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RecipeTreeModal } from './RecipeTreeModal.tsx';

describe('RecipeTreeModal', () => {
  it('shows a basic food without a processing machine or arrow', () => {
    render(<RecipeTreeModal targetFoodId="rice" onClose={vi.fn()} />);

    expect(
      screen.getByRole('dialog', { name: '米のレシピツリー' }),
    ).toHaveTextContent('米');
    expect(screen.queryByText('加熱機')).not.toBeInTheDocument();
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

  it('closes from the backdrop, close button, and Escape key', () => {
    const onClose = vi.fn();
    const { container } = render(
      <RecipeTreeModal targetFoodId="toast" onClose={onClose} />,
    );

    fireEvent.pointerDown(container.firstElementChild!);
    fireEvent.click(
      screen.getByRole('button', { name: 'レシピツリーモーダルを閉じる' }),
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
