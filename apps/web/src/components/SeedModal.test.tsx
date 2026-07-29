import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SeedModal } from './SeedModal.tsx';

const currentSeed = '123e4567-e89b-42d3-a456-426614174000';

describe('SeedModal', () => {
  it('does not focus the seed input when opened', () => {
    render(
      <SeedModal
        currentSeed={currentSeed}
        onClose={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText('シード値を入力(空ならランダムシード)'),
    ).not.toHaveFocus();
  });

  it('shows the current seed and retries with a valid specified seed', () => {
    const onRetry = vi.fn();
    render(
      <SeedModal
        currentSeed={currentSeed}
        onClose={vi.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'シード値' })).toHaveTextContent(
      currentSeed,
    );
    fireEvent.change(
      screen.getByPlaceholderText('シード値を入力(空ならランダムシード)'),
      {
        target: { value: '123E4567-E89B-42D3-A456-426614174000' },
      },
    );
    fireEvent.click(
      screen.getByRole('button', { name: '指定したシード値でリトライする' }),
    );

    expect(onRetry).toHaveBeenCalledWith(currentSeed);
  });

  it('disables retry and explains invalid UUID input', () => {
    render(
      <SeedModal
        currentSeed={currentSeed}
        onClose={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText('シード値を入力(空ならランダムシード)'),
      {
        target: { value: 'invalid' },
      },
    );

    expect(
      screen.getByText('UUID形式で入力してください。'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '指定したシード値でリトライする' }),
    ).toBeDisabled();
  });

  it('copies the current seed', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <SeedModal
        currentSeed={currentSeed}
        onClose={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: '現在のシード値をコピーする' }),
    );

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(currentSeed));
  });
});
