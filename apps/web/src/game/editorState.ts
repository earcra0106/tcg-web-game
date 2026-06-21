import type { FoodId } from './food.ts';
import type { MachineId } from './machine.ts';
import type { PlacementId } from './placement.ts';

export type EditorTool =
  | { kind: 'select' }
  | { kind: 'connect' }
  | { kind: 'delete' }
  | { kind: 'place-machine'; machineId: MachineId; foodId?: FoodId };

export type EditorState = {
  selectedTool: EditorTool;
  connectionSourceMachineId: PlacementId | null;
  dragConnectionSourceMachineId: PlacementId | null;
  nextMachineIndex: number;
  nextConnectionIndex: number;
};

export function createInitialEditorState(): EditorState {
  return {
    selectedTool: { kind: 'select' },
    connectionSourceMachineId: null,
    dragConnectionSourceMachineId: null,
    nextMachineIndex: 1,
    nextConnectionIndex: 1,
  };
}

export function selectEditorTool(
  state: EditorState,
  selectedTool: EditorTool,
): EditorState {
  return {
    ...state,
    selectedTool,
    connectionSourceMachineId: null,
    dragConnectionSourceMachineId: null,
  };
}
