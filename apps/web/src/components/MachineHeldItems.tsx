import { Html } from '@react-three/drei';
import { getFoodInfo } from '../game/foods.ts';
import type { RenderMachineHeldItemView } from '../game/renderView.ts';
import { FoodSprite } from './FoodSprite.tsx';

type MachineHeldItemsProps = {
  items: readonly RenderMachineHeldItemView[];
};

function ProcessingBorder({ progress }: { progress: number }) {
  return (
    <svg
      className="machine-held-item__progress"
      viewBox="0 0 44 44"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="7"
        pathLength="1"
        transform="rotate(-90 22 22)"
        strokeDasharray={`${progress} 1`}
      />
    </svg>
  );
}

export function MachineHeldItems({ items }: MachineHeldItemsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Html
      center
      position={[0, 0.86, 0]}
      zIndexRange={[10, 0]}
      wrapperClass="machine-held-items-wrapper"
    >
      <div className="machine-held-items">
        {items.map((item) => {
          const food = getFoodInfo(item.foodId);

          if (food === null) {
            return null;
          }

          return (
            <div
              key={item.id}
              className="machine-held-item"
              data-status={item.status}
            >
              <FoodSprite spriteId={item.spriteId} label={food.name} />
              {item.progress !== null ? (
                <ProcessingBorder progress={item.progress} />
              ) : null}
            </div>
          );
        })}
      </div>
    </Html>
  );
}
