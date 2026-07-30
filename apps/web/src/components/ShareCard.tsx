import type { Ref } from 'react';
import type { ShareStageGoal } from '../game/share.ts';
import { getFoodInfo } from '../game/foods.ts';
import { FoodSprite } from './FoodSprite.tsx';

type ShareCardProps = {
  cardRef: Ref<HTMLElement>;
  stageGoals: readonly ShareStageGoal[];
};

export function ShareCard({ cardRef, stageGoals }: ShareCardProps) {
  return (
    <section ref={cardRef} className="share-card" aria-hidden="true">
      <img className="share-card__logo" src="/assets/sprites/logo.png" alt="" />
      <div className="share-card__foods">
        {stageGoals.map((goal) => {
          const food = getFoodInfo(goal.targetFoodId);

          return food === null ? null : (
            <div key={goal.stageNumber} className="share-card__food">
              <FoodSprite spriteId={food.spriteId} label="" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
