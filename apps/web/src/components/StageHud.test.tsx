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
  it('shows all goals with the current stage goal first initially', () => {
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    const goals = screen.getByLabelText('目標一覧');
    expect(within(goals).getByText('10秒あたりの生産目標')).toBeInTheDocument();
    expect(within(goals).getByText('サラダ')).toBeInTheDocument();
    expect(within(goals).getByText('ごはん')).toBeInTheDocument();
    expect(within(goals).queryByText('/10秒')).not.toBeInTheDocument();
  });

  it('orders the current goal first and remaining goals by first appearance', () => {
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    const goals = screen.getByLabelText('目標一覧');
    expect(within(goals).getAllByText(/サラダ|ごはん|トースト/)).toHaveLength(
      3,
    );
    expect(goals).toHaveTextContent(/サラダ.*ごはん.*トースト/);
  });

  it('collapses and expands additional goals', () => {
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('10秒あたりの生産目標'));

    expect(
      screen.getByRole('button', { name: '目標一覧を展開する' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.hud__goals-additional')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('opens the help button before the seed value button', () => {
    const onOpenHelp = vi.fn();
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={onOpenHelp}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '遊び方を開く' }));

    expect(onOpenHelp).toHaveBeenCalledOnce();
  });

  it('opens the seed value controls', () => {
    const onOpenSeed = vi.fn();
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenSeed={onOpenSeed}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'シード値を開く' }));

    expect(onOpenSeed).toHaveBeenCalledOnce();
  });

  it('toggles simulation speed and marks the button active at 2x speed', () => {
    const onToggleSimulationSpeed = vi.fn();
    const { rerender } = render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={onToggleSimulationSpeed}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '2倍速に切り替える' }));
    expect(onToggleSimulationSpeed).toHaveBeenCalledOnce();

    rerender(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={2}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={onToggleSimulationSpeed}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: '1倍速に切り替える' }),
    ).toHaveClass('icon-button--fast-forward-active');
  });

  it('opens the recipe tree from a food icon button', () => {
    const onOpenRecipeTree = vi.fn();
    render(
      <StageHud
        hud={hud}
        isMuted={false}
        simulationSpeed={1}
        onToggleMuted={vi.fn()}
        onToggleSimulationSpeed={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenSeed={vi.fn()}
        onOpenEncyclopedia={vi.fn()}
        onOpenRecipeTree={onOpenRecipeTree}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'サラダのレシピツリーを開く' }),
    );

    expect(screen.getByRole('img', { name: 'サラダ' })).toBeInTheDocument();
    expect(onOpenRecipeTree).toHaveBeenCalledWith('salad');
  });
});
