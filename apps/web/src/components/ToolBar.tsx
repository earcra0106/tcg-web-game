import { Link2, MousePointer2, Trash2 } from 'lucide-react';
import type { PointerEvent, ReactNode } from 'react';
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
  onStartPlacementDrag: (
    tool: Extract<EditorTool, { kind: 'place-machine' }>,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
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
  onStartPlacementDrag,
}: {
  tool: EditorTool;
  selectedTool: EditorTool;
  label: string;
  children: ReactNode;
  onSelectTool: (tool: EditorTool) => void;
  onStartPlacementDrag: (
    tool: Extract<EditorTool, { kind: 'place-machine' }>,
    event: PointerEvent<HTMLButtonElement>,
  ) => void;
}) {
  return (
    <button
      className="tool-button"
      type="button"
      aria-pressed={getToolKey(tool) === getToolKey(selectedTool)}
      onPointerDown={(event) => {
        if (
          tool.kind === 'place-machine' &&
          event.pointerType === 'mouse' &&
          event.button === 0
        ) {
          onSelectTool(tool);
          onStartPlacementDrag(tool, event);
        }
      }}
      onClick={() => onSelectTool(tool)}
    >
      {children}
      <span className="tool-button__label">{label}</span>
    </button>
  );
}

export function ToolBar({
  selectedTool,
  storageFoodIds,
  shippingFoodId,
  onSelectTool,
  onStartPlacementDrag,
}: ToolBarProps) {
  const shippingFood = getFoodInfo(shippingFoodId);

  return (
    <section className="tool-bar" aria-label="編集ツール">
      <ToolButton
        tool={{ kind: 'select' }}
        selectedTool={selectedTool}
        label="選択"
        onSelectTool={onSelectTool}
        onStartPlacementDrag={onStartPlacementDrag}
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
            onStartPlacementDrag={onStartPlacementDrag}
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
          onStartPlacementDrag={onStartPlacementDrag}
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
            onStartPlacementDrag={onStartPlacementDrag}
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
        onStartPlacementDrag={onStartPlacementDrag}
      >
        <Link2 aria-hidden="true" size={20} />
      </ToolButton>
      <ToolButton
        tool={{ kind: 'delete' }}
        selectedTool={selectedTool}
        label="削除"
        onSelectTool={onSelectTool}
        onStartPlacementDrag={onStartPlacementDrag}
      >
        <Trash2 aria-hidden="true" size={20} />
      </ToolButton>
    </section>
  );
}
