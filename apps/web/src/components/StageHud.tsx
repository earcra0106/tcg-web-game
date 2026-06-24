import { Volume2, VolumeX } from 'lucide-react';
import type { StageHudView } from '../game/renderView.ts';

type StageHudProps = {
  hud: StageHudView;
  isMuted: boolean;
  onToggleMuted: () => void;
};

function formatEfficiency(value: number) {
  return value.toFixed(1);
}

export function StageHud({ hud, isMuted, onToggleMuted }: StageHudProps) {
  return (
    <section className="hud" aria-label="Game status">
      <div className="hud__header">
        <div>
          <p className="hud__label">Stage {hud.stageNumber}</p>
          <p className="hud__status">
            {hud.isCleared ? 'Clear' : '累積目標を維持'}
          </p>
        </div>
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
      </div>
      <dl className="hud__goals">
        {hud.goals.map((goal) => (
          <div
            key={goal.foodId}
            className={
              goal.isCleared ? 'hud__goal hud__goal--cleared' : 'hud__goal'
            }
          >
            <dt>
              {goal.foodName}
              <span>Stage {goal.stageNumbers.join(', ')}</span>
            </dt>
            <dd>
              {formatEfficiency(goal.currentEfficiency)} /{' '}
              {formatEfficiency(goal.requiredEfficiency)}
              <small>/min</small>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
