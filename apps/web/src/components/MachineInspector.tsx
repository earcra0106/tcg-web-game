import { FoodSprite } from './FoodSprite.tsx';
import { getFoodInfo } from '../game/foods.ts';
import type { FoodId } from '../game/food.ts';
import { getMachineInfo } from '../game/machine.ts';
import type { MachineRuntimeConfig } from '../game/machineRuntime.ts';
import type { PlacedMachine } from '../game/placement.ts';
import { findRecipesForMachine } from '../game/recipes.ts';

type MachineInspectorProps = {
  machine: PlacedMachine | null;
  config: MachineRuntimeConfig | undefined;
  onRecipeChange: (recipeId: FoodId | null) => void;
};

export function MachineInspector({
  machine,
  config,
  onRecipeChange,
}: MachineInspectorProps) {
  if (machine === null) {
    return (
      <aside className="machine-inspector" aria-label="選択中マシン">
        <p className="machine-inspector__empty">
          盤面のマシンを選択してください。
        </p>
      </aside>
    );
  }

  const machineInfo = getMachineInfo(machine.machineId);
  const food =
    machine.foodId !== undefined ? getFoodInfo(machine.foodId) : null;
  const recipes = findRecipesForMachine(machine.machineId);

  return (
    <aside className="machine-inspector" aria-label="選択中マシン">
      <p className="machine-inspector__label">選択中</p>
      <h2>{machineInfo?.name ?? machine.machineId}</h2>
      <p className="machine-inspector__position">
        x:{machine.position.x} / z:{machine.position.z}
      </p>
      {food ? (
        <div className="machine-inspector__food">
          <FoodSprite spriteId={food.spriteId} label={food.name} />
          <span>{food.name}</span>
        </div>
      ) : null}
      {recipes.length > 0 ? (
        <label className="machine-inspector__field">
          <span>レシピ</span>
          <select
            value={config?.recipeId ?? ''}
            onChange={(event) => {
              onRecipeChange(event.target.value || null);
            }}
          >
            <option value="">自動</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </aside>
  );
}
