import { Link2, MousePointer2, Trash2 } from 'lucide-react';
import type { PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';
import { FoodSprite } from './FoodSprite.tsx';
import { MachineSprite } from './MachineSprite.tsx';
import { getFoodInfo } from '../game/foods.ts';
import type { FoodId } from '../game/food.ts';
import { machineInfos, type MachineId } from '../game/machine.ts';
import type { EditorTool } from '../game/editorState.ts';
import { useHorizontalScroll } from './useHorizontalScroll.ts';

type ToolBarProps = {
  selectedTool: EditorTool;
  storageFoodIds: readonly FoodId[];
  shippingFoodIds: readonly FoodId[];
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
  const shouldSuppressClickRef = useRef(false);

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
          shouldSuppressClickRef.current = true;
          onStartPlacementDrag(tool, event);
        }
      }}
      onClick={() => {
        if (shouldSuppressClickRef.current) {
          shouldSuppressClickRef.current = false;
          return;
        }

        onSelectTool(tool);
      }}
    >
      {children}
      <span className="tool-button__label">{label}</span>
    </button>
  );
}

function ModeToolButton({
  tool,
  selectedTool,
  label,
  children,
  onSelectTool,
}: {
  tool: Extract<EditorTool, { kind: 'select' | 'connect' | 'delete' }>;
  selectedTool: EditorTool;
  label: string;
  children: ReactNode;
  onSelectTool: (tool: EditorTool) => void;
}) {
  return (
    <button
      className="mode-tool-button"
      type="button"
      aria-label={label}
      aria-pressed={getToolKey(tool) === getToolKey(selectedTool)}
      onClick={() => onSelectTool(tool)}
      title={label}
    >
      {children}
    </button>
  );
}

export function ModeToolBar({
  selectedTool,
  onSelectTool,
}: {
  selectedTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
}) {
  return (
    <section className="mode-tool-bar" aria-label="編集モード">
      <ModeToolButton
        tool={{ kind: 'select' }}
        selectedTool={selectedTool}
        label="選択"
        onSelectTool={onSelectTool}
      >
        <MousePointer2 aria-hidden="true" size={18} />
      </ModeToolButton>
      <ModeToolButton
        tool={{ kind: 'connect' }}
        selectedTool={selectedTool}
        label="コンベア"
        onSelectTool={onSelectTool}
      >
        <Link2 aria-hidden="true" size={18} />
      </ModeToolButton>
      <ModeToolButton
        tool={{ kind: 'delete' }}
        selectedTool={selectedTool}
        label="削除"
        onSelectTool={onSelectTool}
      >
        <Trash2 aria-hidden="true" size={18} />
      </ModeToolButton>
    </section>
  );
}

export function ToolBar({
  selectedTool,
  storageFoodIds,
  shippingFoodIds,
  onSelectTool,
  onStartPlacementDrag,
}: ToolBarProps) {
  const toolCount =
    storageFoodIds.length + shippingFoodIds.length + placeableMachineIds.length;
  const { elementRef: toolbarRef, hasHorizontalScrollbar } =
    useHorizontalScroll<HTMLElement>(toolCount);

  return (
    <section
      ref={toolbarRef}
      className={
        hasHorizontalScrollbar ? 'tool-bar tool-bar--scrollable' : 'tool-bar'
      }
      aria-label="編集ツール"
    >
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
            <span className="tool-button__icon tool-button__storage">
              <FoodSprite spriteId={food.spriteId} label={food.name} />
            </span>
          </ToolButton>
        );
      })}
      {shippingFoodIds.map((foodId) => {
        const food = getFoodInfo(foodId);

        if (!food) {
          return null;
        }

        return (
          <ToolButton
            key={`shipping-${food.id}`}
            tool={{
              kind: 'place-machine',
              machineId: 'shipping',
              foodId,
            }}
            selectedTool={selectedTool}
            label="出荷口"
            onSelectTool={onSelectTool}
            onStartPlacementDrag={onStartPlacementDrag}
          >
            <span className="tool-button__icon tool-button__shipping">
              <FoodSprite spriteId={food.spriteId} label={food.name} />
            </span>
          </ToolButton>
        );
      })}
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
            <span className="tool-button__icon tool-button__machine">
              <MachineSprite machineId={machine.id} label={machine.name} />
            </span>
          </ToolButton>
        );
      })}
    </section>
  );
}
