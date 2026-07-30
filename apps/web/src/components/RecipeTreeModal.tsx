import { ArrowDown, ArrowRight, X } from 'lucide-react';
import {
  type PointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { FoodId } from '../game/food.ts';
import { getFoodInfo } from '../game/foods.ts';
import { getMachineInfo } from '../game/machine.ts';
import {
  findRecipeByOutput,
  getMachineForProcess,
  getRecipeIngredientDescendantFoodIds,
  getRecipes,
  type FoodRecipe,
} from '../game/recipes.ts';
import { FoodSprite } from './FoodSprite.tsx';
import { MachineSprite } from './MachineSprite.tsx';

type RecipeTreeModalProps = {
  targetFoodId: FoodId;
  onClose: () => void;
};

type RecipeTreeViewport = {
  scale: number;
  translateX: number;
  translateY: number;
};

type ViewportPoint = {
  x: number;
  y: number;
};

type PinchState = {
  distance: number;
  midpoint: ViewportPoint;
  viewport: RecipeTreeViewport;
};

const MIN_RECIPE_TREE_SCALE = 0.5;
const MAX_RECIPE_TREE_SCALE = 2.5;
const RECIPE_TREE_VIEWPORT_PADDING = 100;

type RecipeTreeNodeProps = {
  foodId: FoodId;
  path: string;
  recipes: readonly FoodRecipe[];
  expandedFoodIds: ReadonlySet<FoodId>;
  expandedRecipePaths: ReadonlySet<string>;
  ancestorFoodIds: ReadonlySet<FoodId>;
  isRoot?: boolean;
  onToggle: (foodId: FoodId) => void;
};

function getExpandedRecipePaths(
  targetFoodId: FoodId,
  expandedFoodIds: ReadonlySet<FoodId>,
  recipes: readonly FoodRecipe[],
) {
  const expandedRecipePaths = new Set<string>();
  const claimedFoodIds = new Set<FoodId>([targetFoodId]);

  const visit = (
    foodId: FoodId,
    path: string,
    ancestorFoodIds: ReadonlySet<FoodId>,
  ) => {
    const recipe = findRecipeByOutput(foodId, recipes);

    if (
      recipe === null ||
      ancestorFoodIds.has(foodId) ||
      !expandedFoodIds.has(foodId) ||
      claimedFoodIds.has(foodId)
    ) {
      return;
    }

    claimedFoodIds.add(foodId);
    expandedRecipePaths.add(path);
    const nextAncestorFoodIds = new Set(ancestorFoodIds).add(foodId);

    recipe.inputFoodIds.forEach((ingredientId, index) => {
      visit(ingredientId, `${path}.${index}`, nextAncestorFoodIds);
    });
  };

  const rootRecipe = findRecipeByOutput(targetFoodId, recipes);

  if (rootRecipe !== null) {
    const rootAncestorFoodIds = new Set<FoodId>([targetFoodId]);

    rootRecipe.inputFoodIds.forEach((ingredientId, index) => {
      visit(ingredientId, `root.${index}`, rootAncestorFoodIds);
    });
  }

  return expandedRecipePaths;
}

function clampRecipeTreeScale(scale: number) {
  return Math.min(
    MAX_RECIPE_TREE_SCALE,
    Math.max(MIN_RECIPE_TREE_SCALE, scale),
  );
}

function getInitialRecipeTreeViewport(
  viewportBody: HTMLElement,
  recipeTree: HTMLElement,
): RecipeTreeViewport | null {
  const treeWidth = recipeTree.offsetWidth;
  const treeHeight = recipeTree.offsetHeight;
  const availableWidth =
    viewportBody.clientWidth - RECIPE_TREE_VIEWPORT_PADDING * 2;
  const availableHeight =
    viewportBody.clientHeight - RECIPE_TREE_VIEWPORT_PADDING * 2;

  if (
    treeWidth === 0 ||
    treeHeight === 0 ||
    availableWidth <= 0 ||
    availableHeight <= 0
  ) {
    return null;
  }

  const scale = clampRecipeTreeScale(
    Math.min(availableWidth / treeWidth, availableHeight / treeHeight),
  );

  return {
    scale,
    translateX: (viewportBody.clientWidth - treeWidth * scale) / 2,
    translateY: (viewportBody.clientHeight - treeHeight * scale) / 2,
  };
}

function getDistance(left: ViewportPoint, right: ViewportPoint) {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function getMidpoint(left: ViewportPoint, right: ViewportPoint): ViewportPoint {
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
  };
}

function FoodNode({
  foodId,
  isExpandable,
  isExpanded,
  onToggle,
}: {
  foodId: FoodId;
  isExpandable: boolean;
  isExpanded: boolean;
  onToggle: (foodId: FoodId) => void;
}) {
  const food = getFoodInfo(foodId);

  if (food === null) {
    return null;
  }

  return (
    <button
      className={
        isExpandable
          ? 'recipe-tree__food recipe-tree__food--expandable'
          : 'recipe-tree__food'
      }
      type="button"
      aria-label={
        isExpandable
          ? `${food.name}のレシピを${isExpanded ? '折りたたむ' : '展開する'}`
          : food.name
      }
      aria-expanded={isExpandable ? isExpanded : undefined}
      disabled={!isExpandable}
      onClick={() => onToggle(foodId)}
    >
      <FoodSprite spriteId={food.spriteId} label={food.name} />
      <span>{food.name}</span>
    </button>
  );
}

function RecipeTreeNode({
  foodId,
  path,
  recipes,
  expandedFoodIds,
  expandedRecipePaths,
  ancestorFoodIds,
  isRoot = false,
  onToggle,
}: RecipeTreeNodeProps) {
  const recipe = findRecipeByOutput(foodId, recipes);
  const isCycle = ancestorFoodIds.has(foodId);
  const isExpanded =
    recipe !== null && (isRoot || expandedRecipePaths.has(path));
  const isExpandable =
    !isRoot &&
    recipe !== null &&
    !isCycle &&
    (!expandedFoodIds.has(foodId) || expandedRecipePaths.has(path));

  if (!isExpanded || recipe === null) {
    return (
      <FoodNode
        foodId={foodId}
        isExpandable={isExpandable}
        isExpanded={expandedFoodIds.has(foodId)}
        onToggle={onToggle}
      />
    );
  }

  const machineId = getMachineForProcess(recipe.process);
  const machine = machineId === null ? null : getMachineInfo(machineId);
  const nextAncestorFoodIds = new Set(ancestorFoodIds).add(foodId);

  const recipeTree = (
    <div className="recipe-tree__recipe">
      <div
        className={
          recipe.inputFoodIds.length > 1
            ? 'recipe-tree__ingredients recipe-tree__ingredients--multiple'
            : 'recipe-tree__ingredients'
        }
        aria-label={`${recipe.name}の材料`}
      >
        {recipe.inputFoodIds.map((ingredientId, index) => (
          <RecipeTreeNode
            key={`${ingredientId}-${index}`}
            foodId={ingredientId}
            path={`${path}.${index}`}
            recipes={recipes}
            expandedFoodIds={expandedFoodIds}
            expandedRecipePaths={expandedRecipePaths}
            ancestorFoodIds={nextAncestorFoodIds}
            onToggle={onToggle}
          />
        ))}
      </div>
      {machineId !== null && machine !== null ? (
        <>
          <span className="recipe-tree__arrow" aria-hidden="true">
            <ArrowRight className="recipe-tree__arrow--landscape" size={28} />
            <ArrowDown className="recipe-tree__arrow--portrait" size={28} />
          </span>
          <div className="recipe-tree__machine">
            <MachineSprite machineId={machineId} label={machine.name} />
            <span>{machine.name}</span>
          </div>
        </>
      ) : null}
      <span className="recipe-tree__arrow" aria-hidden="true">
        <ArrowRight className="recipe-tree__arrow--landscape" size={28} />
        <ArrowDown className="recipe-tree__arrow--portrait" size={28} />
      </span>
      <FoodNode
        foodId={foodId}
        isExpandable={!isRoot}
        isExpanded={expandedFoodIds.has(foodId)}
        onToggle={onToggle}
      />
    </div>
  );

  return isRoot ? (
    recipeTree
  ) : (
    <div className="recipe-tree__branch recipe-tree__branch--expanded">
      {recipeTree}
    </div>
  );
}

export function RecipeTreeModal({
  targetFoodId,
  onClose,
}: RecipeTreeModalProps) {
  const [expandedFoodIds, setExpandedFoodIds] = useState<ReadonlySet<FoodId>>(
    new Set(),
  );
  const [viewport, setViewport] = useState<RecipeTreeViewport>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const viewportRef = useRef(viewport);
  const viewportBodyRef = useRef<HTMLDivElement | null>(null);
  const recipeTreeRef = useRef<HTMLDivElement | null>(null);
  const pointerPositionsRef = useRef(new Map<number, ViewportPoint>());
  const panStartRef = useRef<{
    pointerId: number;
    point: ViewportPoint;
    viewport: RecipeTreeViewport;
  } | null>(null);
  const pinchStartRef = useRef<PinchState | null>(null);
  const recipes = useMemo(() => getRecipes(), []);
  const expandedRecipePaths = useMemo(
    () => getExpandedRecipePaths(targetFoodId, expandedFoodIds, recipes),
    [expandedFoodIds, recipes, targetFoodId],
  );
  const targetFood = getFoodInfo(targetFoodId);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  useLayoutEffect(() => {
    const viewportBody = viewportBodyRef.current;
    const recipeTree = recipeTreeRef.current;

    if (viewportBody === null || recipeTree === null) {
      return;
    }

    const initialViewport = getInitialRecipeTreeViewport(
      viewportBody,
      recipeTree,
    );

    if (initialViewport !== null) {
      viewportRef.current = initialViewport;
      setViewport(initialViewport);
    }
  }, [targetFoodId]);

  const updateViewport = (nextViewport: RecipeTreeViewport) => {
    viewportRef.current = nextViewport;
    setViewport(nextViewport);
  };

  const getViewportPoint = (event: {
    clientX: number;
    clientY: number;
  }): ViewportPoint => {
    const bounds = viewportBodyRef.current?.getBoundingClientRect();

    return {
      x: event.clientX - (bounds?.left ?? 0),
      y: event.clientY - (bounds?.top ?? 0),
    };
  };

  const setZoomAtPoint = (scale: number, point: ViewportPoint) => {
    const currentViewport = viewportRef.current;
    const nextScale = clampRecipeTreeScale(scale);
    const scaleRatio = nextScale / currentViewport.scale;

    updateViewport({
      scale: nextScale,
      translateX: point.x - (point.x - currentViewport.translateX) * scaleRatio,
      translateY: point.y - (point.y - currentViewport.translateY) * scaleRatio,
    });
  };

  useEffect(() => {
    const viewportBody = viewportBodyRef.current;

    if (viewportBody === null) {
      return;
    }

    const zoomWithWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = getViewportPoint(event);
      setZoomAtPoint(
        viewportRef.current.scale * Math.exp(-event.deltaY * 0.001),
        point,
      );
    };

    viewportBody.addEventListener('wheel', zoomWithWheel, { passive: false });
    return () => viewportBody.removeEventListener('wheel', zoomWithWheel);
  });

  if (targetFood === null) {
    return null;
  }

  const toggleRecipe = (foodId: FoodId) => {
    setExpandedFoodIds((current) => {
      if (!current.has(foodId)) {
        return new Set(current).add(foodId);
      }

      const foodIdsToCollapse = new Set([
        foodId,
        ...getRecipeIngredientDescendantFoodIds(foodId, recipes),
      ]);

      return new Set(
        [...current].filter(
          (expandedFoodId) => !foodIdsToCollapse.has(expandedFoodId),
        ),
      );
    });
  };

  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.button !== 0 ||
      (event.target instanceof Element &&
        event.target.closest('button') !== null)
    ) {
      return;
    }

    const point = getViewportPoint(event);
    pointerPositionsRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const pointerPositions = [...pointerPositionsRef.current.entries()];

    if (pointerPositions.length === 1) {
      panStartRef.current = {
        pointerId: event.pointerId,
        point,
        viewport: viewportRef.current,
      };
      return;
    }

    if (pointerPositions.length === 2) {
      const [, firstPoint] = pointerPositions[0]!;
      const [, secondPoint] = pointerPositions[1]!;
      pinchStartRef.current = {
        distance: getDistance(firstPoint, secondPoint),
        midpoint: getMidpoint(firstPoint, secondPoint),
        viewport: viewportRef.current,
      };
      panStartRef.current = null;
    }
  };

  const movePan = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerPositionsRef.current.has(event.pointerId)) {
      return;
    }

    const point = getViewportPoint(event);
    pointerPositionsRef.current.set(event.pointerId, point);
    const pinchStart = pinchStartRef.current;

    if (pinchStart !== null && pointerPositionsRef.current.size === 2) {
      const [, firstPoint] = pointerPositionsRef.current.entries().next()
        .value as [number, ViewportPoint];
      const [, secondPoint] = [...pointerPositionsRef.current.entries()][1]!;
      const midpoint = getMidpoint(firstPoint, secondPoint);
      const nextScale = clampRecipeTreeScale(
        pinchStart.viewport.scale *
          (getDistance(firstPoint, secondPoint) / pinchStart.distance),
      );
      const contentX =
        (pinchStart.midpoint.x - pinchStart.viewport.translateX) /
        pinchStart.viewport.scale;
      const contentY =
        (pinchStart.midpoint.y - pinchStart.viewport.translateY) /
        pinchStart.viewport.scale;

      updateViewport({
        scale: nextScale,
        translateX: midpoint.x - contentX * nextScale,
        translateY: midpoint.y - contentY * nextScale,
      });
      return;
    }

    const panStart = panStartRef.current;

    if (panStart === null || panStart.pointerId !== event.pointerId) {
      return;
    }

    updateViewport({
      ...panStart.viewport,
      translateX: panStart.viewport.translateX + point.x - panStart.point.x,
      translateY: panStart.viewport.translateY + point.y - panStart.point.y,
    });
  };

  const stopPan = (event: PointerEvent<HTMLDivElement>) => {
    pointerPositionsRef.current.delete(event.pointerId);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pinchStartRef.current = null;
    const remainingPointer = pointerPositionsRef.current.entries().next()
      .value as [number, ViewportPoint] | undefined;

    panStartRef.current =
      remainingPointer === undefined
        ? null
        : {
            pointerId: remainingPointer[0],
            point: remainingPointer[1],
            viewport: viewportRef.current,
          };
  };

  return createPortal(
    <div
      className="modal-backdrop recipe-tree-modal-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="recipe-tree-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-tree-modal-title"
      >
        <header className="recipe-tree-modal__header">
          <h2 id="recipe-tree-modal-title">{targetFood.name}のレシピツリー</h2>
          <button
            className="icon-button icon-button--square icon-button--quiet"
            type="button"
            aria-label="レシピツリーモーダルを閉じる"
            onClick={onClose}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {targetFood.canSpawnFromStorage ? (
          <p className="recipe-tree-modal__storage-message">
            {targetFood.name}は倉庫から搬入できます
          </p>
        ) : (
          <div
            ref={viewportBodyRef}
            className="recipe-tree-modal__body"
            aria-label="レシピツリー表示領域"
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
          >
            <div
              className="recipe-tree-modal__viewport"
              data-testid="recipe-tree-viewport"
              style={{
                transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
              }}
            >
              <div ref={recipeTreeRef} className="recipe-tree-modal__content">
                <RecipeTreeNode
                  foodId={targetFoodId}
                  path="root"
                  recipes={recipes}
                  expandedFoodIds={expandedFoodIds}
                  expandedRecipePaths={expandedRecipePaths}
                  ancestorFoodIds={new Set()}
                  isRoot
                  onToggle={toggleRecipe}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}
