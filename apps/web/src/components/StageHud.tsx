import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useState } from 'react';
import type { StageHudView } from '../game/renderView.ts';

type StageHudProps = {
  hud: StageHudView;
  isMuted: boolean;
  onToggleMuted: () => void;
  onOpenEncyclopedia: () => void;
};

function formatEfficiency(value: number) {
  return value.toFixed(2);
}

export function StageHud({
  hud,
  isMuted,
  onToggleMuted,
  onOpenEncyclopedia,
}: StageHudProps) {
  const [areGoalsExpanded, setAreGoalsExpanded] = useState(false);
  const currentGoal = hud.goals.find((goal) =>
    goal.stageNumbers.includes(hud.stageNumber),
  );
  const orderedGoals = currentGoal
    ? [currentGoal, ...hud.goals.filter((goal) => goal !== currentGoal)]
    : hud.goals;
  const visibleGoals = areGoalsExpanded
    ? orderedGoals
    : orderedGoals.slice(0, 1);

  return (
    <section className="hud" aria-label="Game status">
      <div className="hud__header">
        <div className="hud__stage-card">
          <p className="hud__label">Stage {hud.stageNumber}</p>
          <p className="hud__status">
            {hud.isCleared ? 'Clear' : '累積目標を維持'}
          </p>
        </div>
        <div className="hud__actions">
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
      <button
        className="hud__goals"
        type="button"
        aria-expanded={areGoalsExpanded}
        aria-label={
          areGoalsExpanded ? '目標一覧を折りたたむ' : '目標一覧を展開する'
        }
        onClick={() => setAreGoalsExpanded((current) => !current)}
      >
        <span className="hud__goals-icon" aria-hidden="true">
          {areGoalsExpanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
        {visibleGoals.map((goal) => (
          <span
            key={goal.foodId}
            className={
              goal.isCleared ? 'hud__goal hud__goal--cleared' : 'hud__goal'
            }
          >
            <span className="hud__goal-name">
              {goal.foodName}
              <small>Stage {goal.stageNumbers.join(', ')}</small>
            </span>
            <span className="hud__goal-efficiency">
              {formatEfficiency(goal.currentEfficiency)} /{' '}
              {formatEfficiency(goal.requiredEfficiency)}
              <small>/10秒</small>
            </span>
          </span>
        ))}
      </button>
    </section>
  );
}
