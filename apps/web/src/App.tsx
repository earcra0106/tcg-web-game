import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FoodSprite } from './components/FoodSprite.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { RecipeTreeModal } from './components/RecipeTreeModal.tsx';
import { SeedModal } from './components/SeedModal.tsx';
import { StageHud } from './components/StageHud.tsx';
import { ModeToolBar, ToolBar } from './components/ToolBar.tsx';
import { createGameAudioController, type GameSoundId } from './game/audio.ts';
import { createInitialEditorModel } from './game/editorActions.ts';
import { selectEditorTool, type EditorTool } from './game/editorState.ts';
import { foodInfos } from './game/foods.ts';
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
import { createDailySeed } from './game/seed.ts';

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
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2>(1);
  const [seed, setSeed] = useState(() => createDailySeed());
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [recipeTreeFoodId, setRecipeTreeFoodId] = useState<FoodId | null>(null);
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
    () => getStageGoal({ seed, stageNumber }),
    [seed, stageNumber],
  );
  const cumulativeStageGoals = useMemo(
    () =>
      Array.from({ length: stageNumber }, (_, index) =>
        getStageGoal({ seed, stageNumber: index + 1 }),
      ),
    [seed, stageNumber],
  );
  const renderView = useMemo(
    () =>
      createRenderView({
        gameState: model.gameState,
        simulationState,
        machineConfigs: model.machineConfigs,
        seed,
      }),
    [model.gameState, model.machineConfigs, seed, simulationState],
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
            deltaMs: deltaMs * simulationSpeed,
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
    simulationSpeed,
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
    return (
      <FoodEncyclopedia
        recipeTreeFoodId={recipeTreeFoodId}
        onBack={() => setScreen('game')}
        onCloseRecipeTree={() => setRecipeTreeFoodId(null)}
        onOpenRecipeTree={setRecipeTreeFoodId}
      />
    );
  }

  const retryWithSeed = (nextSeed: string) => {
    setSeed(nextSeed);
    setModel(createInitialEditorModel());
    setSimulationState(createInitialSimulationState());
    setPlacementDrag(null);
    lastSimulationFrameMsRef.current = null;
    lastClearedStageRef.current = null;
    setIsSeedModalOpen(false);
  };

  return (
    <main className="app-shell">
      <GameCanvas
        model={model}
        renderView={renderView}
        craftableFoodIds={craftableFoodIds}
        dragPlacementTool={placementDrag?.tool ?? null}
        isDraggingPlacement={placementDrag?.isDragging === true}
        simulationSpeed={simulationSpeed}
        onModelChange={(updater) => {
          setModel((current) => updater(current));
        }}
        onPlacementDrop={() => {
          setPlacementDrag(null);
        }}
        onPlaySound={playSound}
      />
      <StageHud
        hud={renderView.hud}
        isMuted={isMuted}
        simulationSpeed={simulationSpeed}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        onOpenSeed={() => setIsSeedModalOpen(true)}
        onToggleMuted={() => {
          const nextMuted = !isMuted;
          audioRef.current?.setMuted(nextMuted);
          setIsMuted(nextMuted);
        }}
        onToggleSimulationSpeed={() => {
          setSimulationSpeed((current) => (current === 1 ? 2 : 1));
        }}
        onOpenEncyclopedia={() => setScreen('encyclopedia')}
        onOpenRecipeTree={setRecipeTreeFoodId}
      />
      {isHelpModalOpen ? (
        <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      ) : null}
      {isSeedModalOpen ? (
        <SeedModal
          currentSeed={seed}
          onClose={() => setIsSeedModalOpen(false)}
          onRetry={retryWithSeed}
        />
      ) : null}
      {recipeTreeFoodId !== null ? (
        <RecipeTreeModal
          key={recipeTreeFoodId}
          targetFoodId={recipeTreeFoodId}
          onClose={() => setRecipeTreeFoodId(null)}
        />
      ) : null}
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

function FoodEncyclopedia({
  recipeTreeFoodId,
  onBack,
  onCloseRecipeTree,
  onOpenRecipeTree,
}: {
  recipeTreeFoodId: FoodId | null;
  onBack: () => void;
  onCloseRecipeTree: () => void;
  onOpenRecipeTree: (foodId: FoodId) => void;
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
          <FoodCard
            key={food.id}
            foodId={food.id}
            onOpenRecipeTree={onOpenRecipeTree}
          />
        ))}
      </section>
      {recipeTreeFoodId !== null ? (
        <RecipeTreeModal
          key={recipeTreeFoodId}
          targetFoodId={recipeTreeFoodId}
          onClose={onCloseRecipeTree}
        />
      ) : null}
    </main>
  );
}

function FoodCard({
  foodId,
  onOpenRecipeTree,
}: {
  foodId: FoodId;
  onOpenRecipeTree: (foodId: FoodId) => void;
}) {
  const food = foodInfos.find((item) => item.id === foodId);

  if (!food) {
    return null;
  }

  return (
    <button
      className="food-card"
      type="button"
      aria-label={`${food.name}のレシピツリーを開く`}
      onClick={() => onOpenRecipeTree(food.id)}
    >
      <div className="food-card__sprite" aria-hidden="true">
        <FoodSprite spriteId={food.spriteId} label={food.name} />
      </div>
    </button>
  );
}
