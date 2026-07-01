import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StageHud } from './StageHud.tsx';

const hud = {
  stageNumber: 3,
  isCleared: false,
  goals: [
    {
      foodId: 'cooked-rice' as const,
      foodName: 'ごはん',
      stageNumbers: [1],
      requiredEfficiency: 1,
      currentEfficiency: 1,
      isCleared: true,
    },
    {
      foodId: 'toast' as const,
      foodName: 'トースト',
      stageNumbers: [2],
      requiredEfficiency: 2,
      currentEfficiency: 1,
      isCleared: false,
    },
    {
      foodId: 'salad' as const,
      foodName: 'サラダ',
      stageNumbers: [3],
      requiredEfficiency: 3,
      currentEfficiency: 0,
      isCleared: false,
    },
  ],
};

describe('StageHud', () => {
  it('shows only the current stage goal initially', () => {
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        onToggleMuted={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
      />,
    );

    const goals = screen.getByRole('button', { name: '目標一覧を展開する' });
    expect(within(goals).getByText('サラダ')).toBeInTheDocument();
    expect(within(goals).queryByText('ごはん')).not.toBeInTheDocument();
  });

  it('orders the current goal first and remaining goals by first appearance', () => {
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        onToggleMuted={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '目標一覧を展開する' }));

    const goals = screen.getByRole('button', { name: '目標一覧を折りたたむ' });
    expect(within(goals).getAllByText(/サラダ|ごはん|トースト/)).toHaveLength(
      3,
    );
    expect(goals).toHaveTextContent(/サラダ.*ごはん.*トースト/);
  });
});
