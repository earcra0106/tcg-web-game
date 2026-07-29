import { ArrowDown, ArrowRight, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

  return (
    <div className="recipe-tree__recipe">
      <div
        className="recipe-tree__ingredients"
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
        <div className="recipe-tree__machine">
          <MachineSprite machineId={machineId} label={machine.name} />
          <span>{machine.name}</span>
        </div>
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
}

export function RecipeTreeModal({
  targetFoodId,
  onClose,
}: RecipeTreeModalProps) {
  const [expandedFoodIds, setExpandedFoodIds] = useState<ReadonlySet<FoodId>>(
    new Set(),
  );
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

  return (
    <div
      className="modal-backdrop"
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
        <div className="recipe-tree-modal__body">
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
      </section>
    </div>
  );
}
