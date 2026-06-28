import { Html } from '@react-three/drei';
import { getFoodInfo } from '../game/foods.ts';
import { MACHINE_INPUT_CAPACITY } from '../game/machineRuntime.ts';
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

function HeldItemCard({ item }: { item: RenderMachineHeldItemView }) {
  const food = getFoodInfo(item.foodId);

  if (food === null) {
    return null;
  }

  return (
    <div className="machine-held-item" data-status={item.status}>
      <FoodSprite spriteId={item.spriteId} label={food.name} />
      {item.progress !== null ? (
        <ProcessingBorder progress={item.progress} />
      ) : null}
    </div>
  );
}

export function MachineHeldItems({ items }: MachineHeldItemsProps) {
  const inputItems = items
    .filter((item) => item.status === 'input')
    .slice(0, MACHINE_INPUT_CAPACITY);
  const processingItem = items.find((item) => item.status === 'processing');
  const emptySlotCount = MACHINE_INPUT_CAPACITY - inputItems.length;

  return (
    <Html
      center
      position={[0, 0.86, 0]}
      zIndexRange={[10, 0]}
      wrapperClass="machine-held-items-wrapper"
    >
      <div className="machine-held-items">
        <div className="machine-inventory machine-inventory--input">
          {Array.from({ length: emptySlotCount }, (_, index) => (
            <div
              key={`empty-input-${index}`}
              className="machine-held-item"
              data-empty="true"
              aria-hidden="true"
            />
          ))}
          {inputItems.map((item) => (
            <HeldItemCard key={item.id} item={item} />
          ))}
        </div>
        <div className="machine-inventory machine-inventory--processing">
          {processingItem !== undefined ? (
            <HeldItemCard item={processingItem} />
          ) : (
            <div
              className="machine-held-item"
              data-status="processing"
              data-empty="true"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </Html>
  );
}
