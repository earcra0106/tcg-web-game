import { BookOpen, ChevronLeft, Plus } from 'lucide-react';
import type { PointerEvent } from 'react';
import { useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas.tsx';
import {
  foodInfos,
  getIngredientNames,
  getProcessedIntoNames,
} from './game/foods.ts';
import type { FoodId } from './game/food.ts';

export function App() {
  const [screen, setScreen] = useState<'game' | 'encyclopedia'>('game');
  const [selectedFoodId, setSelectedFoodId] = useState<FoodId>('bread');
  const selectedFood =
    foodInfos.find((food) => food.id === selectedFoodId) ?? foodInfos[0];

  if (screen === 'encyclopedia') {
    return (
      <FoodEncyclopedia
        onBack={() => setScreen('game')}
        onInspect={(foodId) => {
          setSelectedFoodId(foodId);
          setScreen('game');
        }}
      />
    );
  }

  return (
    <main className="app-shell">
      <GameCanvas />
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
        <p className="hud__label">Voxel Kitchen Automation</p>
        <dl className="hud__stats">
          <div>
            <dt>Food</dt>
            <dd>{selectedFood.name}</dd>
          </div>
          <div>
            <dt>Look</dt>
            <dd>Drag / Pinch</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

function FoodEncyclopedia({
  onBack,
  onInspect,
}: {
  onBack: () => void;
  onInspect: (foodId: FoodId) => void;
}) {
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
          <FoodCard key={food.id} foodId={food.id} onInspect={onInspect} />
        ))}
      </section>
    </main>
  );
}

function FoodCard({
  foodId,
  onInspect,
}: {
  foodId: FoodId;
  onInspect: (foodId: FoodId) => void;
}) {
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
      <div className="food-card__body">
        <div className="food-card__summary">
          <h2>{food.name}</h2>
          <p>
            {food.canSpawnFromStorage
              ? '倉庫から搬出できる基本素材'
              : '加工食品'}
          </p>
        </div>
        <button
          className="food-card__inspect-button"
          type="button"
          onClick={() => onInspect(food.id)}
          aria-label={`${food.name}を観察する`}
          title={`${food.name}を観察する`}
        >
          <Plus aria-hidden="true" size={18} />
        </button>
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
