import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HelpModal } from './HelpModal.tsx';

describe('HelpModal', () => {
  it('shows the gameplay guide', () => {
    render(<HelpModal onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: '遊び方' })).toHaveTextContent(
      'ゲームの目的',
    );
    expect(screen.getByText('コンベアをつなぐ')).toBeInTheDocument();
  });

  it('closes from the backdrop, close button, and Escape key', () => {
    const onClose = vi.fn();
    render(<HelpModal onClose={onClose} />);

    fireEvent.pointerDown(screen.getByRole('presentation'));
    fireEvent.click(
      screen.getByRole('button', { name: 'ヘルプモーダルを閉じる' }),
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
