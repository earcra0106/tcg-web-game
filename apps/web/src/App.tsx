import { BookOpen, ChevronLeft } from 'lucide-react';
import type { PointerEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { FoodSprite } from './components/FoodSprite.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { MachineInspector } from './components/MachineInspector.tsx';
import { ToolBar } from './components/ToolBar.tsx';
import {
  createInitialEditorModel,
  setMachineRecipe,
} from './game/editorActions.ts';
import { selectEditorTool } from './game/editorState.ts';
import {
  foodInfos,
  getIngredientNames,
  getProcessedIntoNames,
  getFoodInfo,
} from './game/foods.ts';
import type { FoodId } from './game/food.ts';
import { findMachineById } from './game/placement.ts';
import { getStageGoal } from './game/stageGoals.ts';

export function App() {
  const [screen, setScreen] = useState<'game' | 'encyclopedia'>('game');
  const [model, setModel] = useState(() => createInitialEditorModel());
  const stageGoal = useMemo(
    () => getStageGoal({ seed: 'daily', stageNumber: 1 }),
    [],
  );
  const stageFood = getFoodInfo(stageGoal.targetFoodId);
  const storageFoodIds = useMemo(() => {
    const targetFood = getFoodInfo(stageGoal.targetFoodId);

    return (
      targetFood?.ingredientIds.filter(
        (foodId) => getFoodInfo(foodId)?.canSpawnFromStorage === true,
      ) ?? []
    );
  }, [stageGoal.targetFoodId]);
  const selectedMachine =
    model.gameState.selection.selectedMachineId !== null
      ? findMachineById(
          model.gameState.machines,
          model.gameState.selection.selectedMachineId,
        )
      : null;

  if (screen === 'encyclopedia') {
    return <FoodEncyclopedia onBack={() => setScreen('game')} />;
  }

  return (
    <main className="app-shell">
      <GameCanvas
        model={model}
        onModelChange={(updater) => {
          setModel((current) => updater(current));
        }}
      />
      <button
        className="icon-button encyclopedia-button"
        type="button"
        onClick={() => setScreen('encyclopedia')}
        aria-label="食べもの図鑑を開く"
      >
        <BookOpen aria-hidden="true" size={20} />
        <span>食べもの図鑑</span>
      </button>
      <section className="hud" aria-label="Game status">
        <p className="hud__label">Stage {stageGoal.stageNumber}</p>
        <dl className="hud__stats">
          <div>
            <dt>Target</dt>
            <dd>{stageFood?.name ?? stageGoal.targetFoodName}</dd>
          </div>
          <div>
            <dt>Efficiency</dt>
            <dd>{stageGoal.requiredEfficiency}/min</dd>
          </div>
        </dl>
      </section>
      <MachineInspector
        machine={selectedMachine}
        config={
          selectedMachine !== null
            ? model.machineConfigs[selectedMachine.id]
            : undefined
        }
        onRecipeChange={(recipeId) => {
          if (selectedMachine === null) {
            return;
          }

          setModel((current) =>
            setMachineRecipe(current, selectedMachine.id, recipeId),
          );
        }}
      />
      <ToolBar
        selectedTool={model.editorState.selectedTool}
        storageFoodIds={storageFoodIds}
        shippingFoodId={stageGoal.targetFoodId}
        onSelectTool={(tool) => {
          setModel((current) => ({
            ...current,
            editorState: selectEditorTool(current.editorState, tool),
          }));
        }}
      />
    </main>
  );
}

function FoodEncyclopedia({ onBack }: { onBack: () => void }) {
  return (
    <main className="app-shell app-shell--panel">
      <header className="encyclopedia-header">
        <button
          className="icon-button icon-button--quiet"
          type="button"
          onClick={onBack}
          aria-label="確認画面に戻る"
        >
          <ChevronLeft aria-hidden="true" size={20} />
          <span>戻る</span>
        </button>
        <h1>食べもの図鑑</h1>
      </header>
      <section className="food-grid" aria-label="食べもの一覧">
        {foodInfos.map((food) => (
          <FoodCard key={food.id} foodId={food.id} />
        ))}
      </section>
    </main>
  );
}

function FoodCard({ foodId }: { foodId: FoodId }) {
  const food = foodInfos.find((item) => item.id === foodId);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailPosition, setDetailPosition] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<number | null>(null);

  if (!food) {
    return null;
  }

  const ingredientNames = getIngredientNames(food);
  const processedIntoNames = getProcessedIntoNames(food.id);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const updateDetailPosition = (event: PointerEvent<HTMLElement>) => {
    setDetailPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <article
      className="food-card"
      onPointerEnter={(event) => {
        updateDetailPosition(event);
        setIsDetailVisible(true);
      }}
      onPointerMove={updateDetailPosition}
      onPointerLeave={() => {
        clearLongPress();
        setIsDetailVisible(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse') {
          return;
        }

        clearLongPress();
        updateDetailPosition(event);
        longPressTimerRef.current = window.setTimeout(() => {
          setIsDetailVisible(true);
        }, 450);
      }}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
    >
      <div className="food-card__sprite" aria-hidden="true">
        <FoodSprite spriteId={food.spriteId} label={food.name} />
      </div>
      <div className="food-card__body">
        <div className="food-card__summary">
          <h2>{food.name}</h2>
          <p>
            {food.canSpawnFromStorage
              ? '倉庫から搬出できる基本素材'
              : '加工食品'}
          </p>
        </div>
      </div>
      {isDetailVisible ? (
        <div
          className="food-card__detail"
          role="status"
          style={{ left: detailPosition.x, top: detailPosition.y }}
        >
          <dl>
            <div>
              <dt>加工元</dt>
              <dd>
                {ingredientNames.length > 0
                  ? ingredientNames.join('、')
                  : 'なし'}
              </dd>
            </div>
            <div>
              <dt>加工先</dt>
              <dd>
                {processedIntoNames.length > 0
                  ? processedIntoNames.join('、')
                  : 'なし'}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </article>
  );
}
