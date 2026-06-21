import { Link2, MousePointer2, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { FoodSprite } from './FoodSprite.tsx';
import { MachineSprite } from './MachineSprite.tsx';
import { getFoodInfo } from '../game/foods.ts';
import type { FoodId } from '../game/food.ts';
import { machineInfos, type MachineId } from '../game/machine.ts';
import type { EditorTool } from '../game/editorState.ts';

type ToolBarProps = {
  selectedTool: EditorTool;
  storageFoodIds: readonly FoodId[];
  shippingFoodId: FoodId;
  onSelectTool: (tool: EditorTool) => void;
};

const placeableMachineIds = machineInfos
  .map((machine) => machine.id)
  .filter(
    (machineId) => machineId !== 'storage' && machineId !== 'shipping',
  ) satisfies readonly MachineId[];

function getToolKey(tool: EditorTool) {
  if (tool.kind === 'place-machine') {
    return `${tool.kind}:${tool.machineId}:${tool.foodId ?? ''}`;
  }

  return tool.kind;
}

function ToolButton({
  tool,
  selectedTool,
  label,
  children,
  onSelectTool,
}: {
  tool: EditorTool;
  selectedTool: EditorTool;
  label: string;
  children: ReactNode;
  onSelectTool: (tool: EditorTool) => void;
}) {
  return (
    <button
      className="tool-button"
      type="button"
      aria-pressed={getToolKey(tool) === getToolKey(selectedTool)}
      onClick={() => onSelectTool(tool)}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function ToolBar({
  selectedTool,
  storageFoodIds,
  shippingFoodId,
  onSelectTool,
}: ToolBarProps) {
  const shippingFood = getFoodInfo(shippingFoodId);

  return (
    <section className="tool-bar" aria-label="編集ツール">
      <ToolButton
        tool={{ kind: 'select' }}
        selectedTool={selectedTool}
        label="選択"
        onSelectTool={onSelectTool}
      >
        <MousePointer2 aria-hidden="true" size={20} />
      </ToolButton>
      {storageFoodIds.map((foodId) => {
        const food = getFoodInfo(foodId);

        if (!food) {
          return null;
        }

        return (
          <ToolButton
            key={`storage-${food.id}`}
            tool={{ kind: 'place-machine', machineId: 'storage', foodId }}
            selectedTool={selectedTool}
            label="倉庫"
            onSelectTool={onSelectTool}
          >
            <span className="tool-button__storage">
              <FoodSprite spriteId={food.spriteId} label={food.name} />
            </span>
          </ToolButton>
        );
      })}
      {shippingFood ? (
        <ToolButton
          tool={{
            kind: 'place-machine',
            machineId: 'shipping',
            foodId: shippingFoodId,
          }}
          selectedTool={selectedTool}
          label="出荷口"
          onSelectTool={onSelectTool}
        >
          <span className="tool-button__shipping">
            <FoodSprite
              spriteId={shippingFood.spriteId}
              label={shippingFood.name}
            />
          </span>
        </ToolButton>
      ) : null}
      {placeableMachineIds.map((machineId) => {
        const machine = machineInfos.find((item) => item.id === machineId);

        if (!machine) {
          return null;
        }

        return (
          <ToolButton
            key={machine.id}
            tool={{ kind: 'place-machine', machineId }}
            selectedTool={selectedTool}
            label={machine.name}
            onSelectTool={onSelectTool}
          >
            <MachineSprite machineId={machine.id} label={machine.name} />
          </ToolButton>
        );
      })}
      <ToolButton
        tool={{ kind: 'connect' }}
        selectedTool={selectedTool}
        label="コンベア"
        onSelectTool={onSelectTool}
      >
        <Link2 aria-hidden="true" size={20} />
      </ToolButton>
      <ToolButton
        tool={{ kind: 'delete' }}
        selectedTool={selectedTool}
        label="削除"
        onSelectTool={onSelectTool}
      >
        <Trash2 aria-hidden="true" size={20} />
      </ToolButton>
    </section>
  );
}
