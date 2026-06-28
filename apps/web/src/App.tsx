import { BookOpen, ChevronLeft } from 'lucide-react';
import type { PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FoodSprite } from './components/FoodSprite.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { StageHud } from './components/StageHud.tsx';
import { ModeToolBar, ToolBar } from './components/ToolBar.tsx';
import { createGameAudioController, type GameSoundId } from './game/audio.ts';
import { createInitialEditorModel } from './game/editorActions.ts';
import { selectEditorTool, type EditorTool } from './game/editorState.ts';
import {
  foodInfos,
  getIngredientNames,
  getProcessedIntoNames,
} from './game/foods.ts';
import type { FoodId } from './game/food.ts';
import { createRenderView } from './game/renderView.ts';
import {
  createInitialSimulationState,
  stepSimulation,
} from './game/simulation.ts';
import {
  getCraftableFoodIds,
  getShippingFoodIdsForGoals,
  getStorageFoodIdsForGoals,
} from './game/stageTools.ts';
import { getStageGoal } from './game/stageGoals.ts';

const TOOL_DRAG_THRESHOLD_PX = 6;

type PlaceMachineTool = Extract<EditorTool, { kind: 'place-machine' }>;
type PlacementDragState = {
  tool: PlaceMachineTool;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  isDragging: boolean;
};

export function App() {
  const [screen, setScreen] = useState<'game' | 'encyclopedia'>('game');
  const [model, setModel] = useState(() => createInitialEditorModel());
  const [simulationState, setSimulationState] = useState(() =>
    createInitialSimulationState(),
  );
  const [isMuted, setIsMuted] = useState(false);
  const [placementDrag, setPlacementDrag] = useState<PlacementDragState | null>(
    null,
  );
  const audioRef = useRef<ReturnType<typeof createGameAudioController> | null>(
    null,
  );
  const lastSimulationFrameMsRef = useRef<number | null>(null);
  const lastClearedStageRef = useRef<number | null>(null);
  const stageNumber = model.gameState.stageIndex + 1;
  const stageGoal = useMemo(
    () => getStageGoal({ seed: 'daily', stageNumber }),
    [stageNumber],
  );
  const cumulativeStageGoals = useMemo(
    () =>
      Array.from({ length: stageNumber }, (_, index) =>
        getStageGoal({ seed: 'daily', stageNumber: index + 1 }),
      ),
    [stageNumber],
  );
  const renderView = useMemo(
    () =>
      createRenderView({
        gameState: model.gameState,
        simulationState,
        machineConfigs: model.machineConfigs,
        seed: 'daily',
      }),
    [model.gameState, model.machineConfigs, simulationState],
  );
  const storageFoodIds = useMemo(
    () => getStorageFoodIdsForGoals(cumulativeStageGoals),
    [cumulativeStageGoals],
  );
  const shippingFoodIds = useMemo(
    () => getShippingFoodIdsForGoals(cumulativeStageGoals),
    [cumulativeStageGoals],
  );
  const craftableFoodIds = useMemo(
    () => getCraftableFoodIds(storageFoodIds),
    [storageFoodIds],
  );

  if (audioRef.current === null) {
    audioRef.current = createGameAudioController();
  }

  const playSound = useCallback((soundId: GameSoundId) => {
    audioRef.current?.play(soundId);
  }, []);

  useEffect(() => {
    if (placementDrag === null) {
      return;
    }

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== placementDrag.pointerId) {
        return;
      }

      const dx = event.clientX - placementDrag.startClientX;
      const dy = event.clientY - placementDrag.startClientY;

      if (
        !placementDrag.isDragging &&
        dx * dx + dy * dy > TOOL_DRAG_THRESHOLD_PX * TOOL_DRAG_THRESHOLD_PX
      ) {
        setPlacementDrag((current) =>
          current !== null && current.pointerId === event.pointerId
            ? { ...current, isDragging: true }
            : current,
        );
      }
    };

    const handlePointerUp = (event: globalThis.PointerEvent) => {
      if (event.pointerId === placementDrag.pointerId) {
        setPlacementDrag(null);
      }
    };

    const handlePointerCancel = (event: globalThis.PointerEvent) => {
      if (event.pointerId === placementDrag.pointerId) {
        setPlacementDrag(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [placementDrag]);

  useEffect(() => {
    let animationFrameId = 0;

    const tick = (frameMs: number) => {
      const previousFrameMs = lastSimulationFrameMsRef.current ?? frameMs;
      const deltaMs = Math.min(100, Math.max(0, frameMs - previousFrameMs));
      lastSimulationFrameMsRef.current = frameMs;

      if (deltaMs > 0) {
        setSimulationState((current) =>
          stepSimulation(current, {
            machines: model.gameState.machines,
            connections: model.gameState.connections,
            deltaMs,
            machineConfigs: model.machineConfigs,
            stageGoal,
          }),
        );
      }

      animationFrameId = window.requestAnimationFrame(tick);
    };

    animationFrameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    model.gameState.machines,
    model.gameState.connections,
    model.machineConfigs,
    stageGoal,
  ]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!renderView.hud.isCleared) {
      lastClearedStageRef.current = null;
      return;
    }

    if (lastClearedStageRef.current === renderView.hud.stageNumber) {
      return;
    }

    lastClearedStageRef.current = renderView.hud.stageNumber;
    playSound('success');
    setModel((current) => ({
      ...current,
      gameState: {
        ...current.gameState,
        stageIndex: current.gameState.stageIndex + 1,
      },
    }));
  }, [playSound, renderView.hud.isCleared, renderView.hud.stageNumber]);

  if (screen === 'encyclopedia') {
    return <FoodEncyclopedia onBack={() => setScreen('game')} />;
  }

  return (
    <main className="app-shell">
      <GameCanvas
        model={model}
        renderView={renderView}
        craftableFoodIds={craftableFoodIds}
        dragPlacementTool={placementDrag?.tool ?? null}
        isDraggingPlacement={placementDrag?.isDragging === true}
        onModelChange={(updater) => {
          setModel((current) => updater(current));
        }}
        onPlacementDrop={() => {
          setPlacementDrag(null);
        }}
        onPlaySound={playSound}
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
      <StageHud
        hud={renderView.hud}
        isMuted={isMuted}
        onToggleMuted={() => {
          const nextMuted = !isMuted;
          audioRef.current?.setMuted(nextMuted);
          setIsMuted(nextMuted);
        }}
      />
      <ToolBar
        selectedTool={model.editorState.selectedTool}
        storageFoodIds={storageFoodIds}
        shippingFoodIds={shippingFoodIds}
        onSelectTool={(tool) => {
          playSound('select');
          setModel((current) => ({
            ...current,
            editorState: selectEditorTool(current.editorState, tool),
          }));
        }}
        onStartPlacementDrag={(tool, event) => {
          playSound('select');
          setModel((current) => ({
            ...current,
            editorState: selectEditorTool(current.editorState, tool),
          }));
          setPlacementDrag({
            tool,
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            isDragging: false,
          });
        }}
      />
      <ModeToolBar
        selectedTool={model.editorState.selectedTool}
        onSelectTool={(tool) => {
          playSound('select');
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
