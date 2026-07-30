import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Dice5,
  FastForward,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import type { FoodId } from '../game/food.ts';
import { getFoodInfo } from '../game/foods.ts';
import type { StageHudView } from '../game/renderView.ts';
import { FoodSprite } from './FoodSprite.tsx';

type StageHudProps = {
  hud: StageHudView;
  isMuted: boolean;
  simulationSpeed: 1 | 2;
  onToggleMuted: () => void;
  onToggleSimulationSpeed: () => void;
  onOpenHelp: () => void;
  onOpenSeed: () => void;
  onOpenEncyclopedia: () => void;
  onOpenRecipeTree: (foodId: FoodId) => void;
};

function formatEfficiency(value: number) {
  return value.toFixed(2);
}

export function StageHud({
  hud,
  isMuted,
  simulationSpeed,
  onToggleMuted,
  onToggleSimulationSpeed,
  onOpenHelp,
  onOpenSeed,
  onOpenEncyclopedia,
  onOpenRecipeTree,
}: StageHudProps) {
  const [areGoalsExpanded, setAreGoalsExpanded] = useState(true);
  const currentGoal = hud.goals.find((goal) =>
    goal.stageNumbers.includes(hud.stageNumber),
  );
  const orderedGoals = currentGoal
    ? [currentGoal, ...hud.goals.filter((goal) => goal !== currentGoal)]
    : hud.goals;

  return (
    <section className="hud" aria-label="Game status">
      <div className="hud__header">
        <div className="hud__actions">
          <button
            className="icon-button icon-button--square"
            type="button"
            aria-label="遊び方を開く"
            onClick={onOpenHelp}
          >
            <HelpCircle aria-hidden="true" size={18} />
          </button>
          <button
            className="icon-button icon-button--square"
            type="button"
            aria-label="シード値を開く"
            onClick={onOpenSeed}
          >
            <Dice5 aria-hidden="true" size={18} />
          </button>
          <button
            className="icon-button icon-button--square"
            type="button"
            aria-label={isMuted ? '効果音をオンにする' : '効果音をオフにする'}
            onClick={onToggleMuted}
          >
            {isMuted ? (
              <VolumeX aria-hidden="true" size={18} />
            ) : (
              <Volume2 aria-hidden="true" size={18} />
            )}
          </button>
          <button
            className={
              simulationSpeed === 2
                ? 'icon-button icon-button--square icon-button--fast-forward-active'
                : 'icon-button icon-button--square'
            }
            type="button"
            aria-label={
              simulationSpeed === 2 ? '1倍速に切り替える' : '2倍速に切り替える'
            }
            aria-pressed={simulationSpeed === 2}
            onClick={onToggleSimulationSpeed}
          >
            <FastForward aria-hidden="true" size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={onOpenEncyclopedia}
            aria-label="食べもの図鑑を開く"
          >
            <BookOpen aria-hidden="true" size={20} />
            <span>食べもの図鑑</span>
          </button>
        </div>
      </div>
      <div className="hud__goals" aria-label="目標一覧">
        <button
          className="hud__goals-header"
          type="button"
          aria-expanded={areGoalsExpanded}
          aria-label={
            areGoalsExpanded ? '目標一覧を折りたたむ' : '目標一覧を展開する'
          }
          onClick={() => setAreGoalsExpanded((current) => !current)}
        >
          <p className="hud__goals-title">
            10秒あたりの生産目標 <span>(現在:stage {hud.stageNumber})</span>
          </p>
          <span className="hud__goals-toggle" aria-hidden="true">
            {areGoalsExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </span>
        </button>
        <div className="hud__goals-list">
          {orderedGoals.slice(0, 1).map((goal) => (
            <GoalCard
              key={goal.foodId}
              goal={goal}
              onOpenRecipeTree={onOpenRecipeTree}
            />
          ))}
          <div
            className={
              areGoalsExpanded
                ? 'hud__goals-additional hud__goals-additional--expanded'
                : 'hud__goals-additional'
            }
            aria-hidden={!areGoalsExpanded}
          >
            <div className="hud__goals-additional-content">
              {orderedGoals.slice(1).map((goal) => (
                <GoalCard
                  key={goal.foodId}
                  goal={goal}
                  onOpenRecipeTree={onOpenRecipeTree}
                  tabIndex={areGoalsExpanded ? 0 : -1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type GoalCardProps = {
  goal: StageHudView['goals'][number];
  onOpenRecipeTree: (foodId: FoodId) => void;
  tabIndex?: 0 | -1;
};

function GoalCard({ goal, onOpenRecipeTree, tabIndex }: GoalCardProps) {
  const food = getFoodInfo(goal.foodId);

  return (
    <div
      className={goal.isCleared ? 'hud__goal hud__goal--cleared' : 'hud__goal'}
    >
      <button
        className="icon-button icon-button--square hud__goal-recipe-button"
        type="button"
        aria-label={`${goal.foodName}のレシピツリーを開く`}
        tabIndex={tabIndex}
        onClick={() => onOpenRecipeTree(goal.foodId)}
      >
        {food ? (
          <FoodSprite spriteId={food.spriteId} label={goal.foodName} />
        ) : null}
      </button>
      <span className="hud__goal-name">
        {goal.foodName}
        <small>Stage {goal.stageNumbers.join(', ')}</small>
      </span>
      <span className="hud__goal-efficiency">
        {formatEfficiency(goal.currentEfficiency)} /{' '}
        {formatEfficiency(goal.requiredEfficiency)}
      </span>
    </div>
  );
}
