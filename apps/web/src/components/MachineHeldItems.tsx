import { Html } from '@react-three/drei';
import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import type { FoodId } from '../game/food.ts';
import { getFoodInfo } from '../game/foods.ts';
import type { MachineId } from '../game/machine.ts';
import { MACHINE_INPUT_CAPACITY } from '../game/machineRuntime.ts';
import { findRecipesForMachine } from '../game/recipes.ts';
import type { RenderMachineHeldItemView } from '../game/renderView.ts';
import { FoodSprite } from './FoodSprite.tsx';
import { useHorizontalScroll } from './useHorizontalScroll.ts';

type MachineHeldItemsProps = {
  items: readonly RenderMachineHeldItemView[];
  machineId: MachineId;
  selectedRecipeId: FoodId | null;
  craftableFoodIds: readonly FoodId[];
  onSelectRecipe: (recipeId: FoodId | null) => void;
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

export function MachineHeldItems({
  items,
  machineId,
  selectedRecipeId,
  craftableFoodIds,
  onSelectRecipe,
}: MachineHeldItemsProps) {
  const [isRecipeSelectorOpen, setIsRecipeSelectorOpen] = useState(false);
  const inputItems = items
    .filter((item) => item.status === 'input')
    .slice(0, MACHINE_INPUT_CAPACITY);
  const processingItem = items.find((item) => item.status === 'processing');
  const emptySlotCount = MACHINE_INPUT_CAPACITY - inputItems.length;
  const craftableFoodIdSet = new Set(craftableFoodIds);
  const recipes = findRecipesForMachine(machineId).filter((recipe) =>
    craftableFoodIdSet.has(recipe.outputFoodId),
  );
  const selectedFood =
    selectedRecipeId === null ? null : getFoodInfo(selectedRecipeId);
  const optionCount = recipes.length + 1;
  const emptyOptionCount = Math.max(0, 3 - optionCount);
  const {
    elementRef: optionsRef,
    handleWheel,
    hasHorizontalScrollbar,
  } = useHorizontalScroll<HTMLDivElement>(
    `${isRecipeSelectorOpen}:${optionCount}`,
  );

  const selectRecipe = (recipeId: FoodId | null) => {
    onSelectRecipe(recipeId);
    setIsRecipeSelectorOpen(false);
  };

  return (
    <Html
      center
      position={[0, 0.86, 0]}
      zIndexRange={[10, 0]}
      wrapperClass="machine-held-items-wrapper"
    >
      <div className="machine-held-items">
        {isRecipeSelectorOpen ? (
          <section
            className="recipe-selector"
            aria-label="製造する食べ物を選択"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <h2>製造する食べ物を選択</h2>
            <div
              ref={optionsRef}
              className={
                hasHorizontalScrollbar
                  ? 'recipe-selector__options recipe-selector__options--scrollable'
                  : 'recipe-selector__options'
              }
              onWheel={handleWheel}
            >
              <button
                className="recipe-selector__option"
                type="button"
                data-empty="true"
                aria-label="レシピ指定を解除"
                aria-pressed={selectedRecipeId === null}
                title="レシピ指定を解除"
                onClick={() => selectRecipe(null)}
              >
                <X aria-hidden="true" size={18} />
              </button>
              {recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  className="recipe-selector__option"
                  type="button"
                  aria-label={recipe.name}
                  aria-pressed={selectedRecipeId === recipe.id}
                  title={recipe.name}
                  onClick={() => selectRecipe(recipe.id)}
                >
                  <FoodSprite
                    spriteId={recipe.outputFood.spriteId}
                    label={recipe.name}
                  />
                </button>
              ))}
              {Array.from({ length: emptyOptionCount }, (_, index) => (
                <div
                  key={`empty-recipe-${index}`}
                  className="recipe-selector__option"
                  data-empty="true"
                  aria-hidden="true"
                />
              ))}
            </div>
          </section>
        ) : null}
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
          <button
            className="machine-held-item machine-held-item--processing-button"
            type="button"
            data-status="processing"
            data-empty={processingItem === undefined && selectedFood === null}
            aria-label="製造する食べ物を選択"
            aria-expanded={isRecipeSelectorOpen}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            onClick={() => setIsRecipeSelectorOpen((current) => !current)}
          >
            {processingItem !== undefined ? (
              <>
                <FoodSprite
                  spriteId={processingItem.spriteId}
                  label={getFoodInfo(processingItem.foodId)?.name ?? ''}
                />
                {processingItem.progress !== null ? (
                  <ProcessingBorder progress={processingItem.progress} />
                ) : null}
              </>
            ) : selectedFood !== null ? (
              <span className="machine-held-item__recipe-preview">
                <FoodSprite
                  spriteId={selectedFood.spriteId}
                  label={selectedFood.name}
                />
              </span>
            ) : null}
            <span className="machine-held-item__recipe-icon" aria-hidden="true">
              <RefreshCw size={11} strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>
    </Html>
  );
}
