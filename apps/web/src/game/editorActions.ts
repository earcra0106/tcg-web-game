import type { ConnectionId } from './connections.ts';
import type { FoodId } from './food.ts';
import {
  connectMachinesInState,
  createInitialGameState,
  placeMachineInState,
  removeConnectionFromState,
  removeMachineFromState,
  type GameState,
} from './gameState.ts';
import type { GridPosition } from './grid.ts';
import type { MachineRuntimeConfig } from './machineRuntime.ts';
import { findMachineById, type PlacementId } from './placement.ts';
import { type EditorState, createInitialEditorState } from './editorState.ts';

export type EditorMachineConfigs = Readonly<
  Record<PlacementId, MachineRuntimeConfig>
>;

export type EditorModel = {
  gameState: GameState;
  editorState: EditorState;
  machineConfigs: EditorMachineConfigs;
};

export function createInitialEditorModel(
  gameState = createInitialGameState(),
): EditorModel {
  return {
    gameState,
    editorState: createInitialEditorState(),
    machineConfigs: {},
  };
}

function createMachineId(index: number) {
  return `machine-${index}`;
}

function createConnectionId(index: number) {
  return `connection-${index}`;
}

function getMachineConfig(machineId: string, foodId: FoodId | undefined) {
  if (machineId === 'storage' && foodId !== undefined) {
    return { spawnFoodId: foodId } satisfies MachineRuntimeConfig;
  }

  return {};
}

function setSelectedMachine(
  gameState: GameState,
  selectedMachineId: PlacementId | null,
): GameState {
  return {
    ...gameState,
    selection: {
      selectedMachineId,
    },
  };
}

function removeMachineConfig(
  machineConfigs: EditorMachineConfigs,
  machineId: PlacementId,
) {
  const nextConfigs = { ...machineConfigs };
  delete nextConfigs[machineId];

  return nextConfigs;
}

export function handleGridClick(
  model: EditorModel,
  position: GridPosition,
): EditorModel {
  const { selectedTool, nextMachineIndex } = model.editorState;

  if (selectedTool.kind !== 'place-machine') {
    return selectedTool.kind === 'select'
      ? {
          ...model,
          gameState: setSelectedMachine(model.gameState, null),
          editorState: {
            ...model.editorState,
            connectionSourceMachineId: null,
          },
        }
      : model;
  }

  const machineId = createMachineId(nextMachineIndex);
  const gameState = placeMachineInState(model.gameState, {
    id: machineId,
    machineId: selectedTool.machineId,
    position,
    foodId: selectedTool.foodId,
  });

  if (gameState === model.gameState) {
    return model;
  }

  return {
    gameState: setSelectedMachine(gameState, machineId),
    editorState: {
      ...model.editorState,
      nextMachineIndex: nextMachineIndex + 1,
    },
    machineConfigs: {
      ...model.machineConfigs,
      [machineId]: getMachineConfig(
        selectedTool.machineId,
        selectedTool.foodId,
      ),
    },
  };
}

export function handleMachineClick(
  model: EditorModel,
  machineId: PlacementId,
): EditorModel {
  const machine = findMachineById(model.gameState.machines, machineId);

  if (machine === null) {
    return model;
  }

  const { selectedTool } = model.editorState;

  if (selectedTool.kind === 'delete') {
    return {
      ...model,
      gameState: removeMachineFromState(model.gameState, machineId),
      editorState: {
        ...model.editorState,
        connectionSourceMachineId: null,
        dragConnectionSourceMachineId: null,
      },
      machineConfigs: removeMachineConfig(model.machineConfigs, machineId),
    };
  }

  if (selectedTool.kind !== 'connect') {
    return {
      ...model,
      gameState: setSelectedMachine(model.gameState, machineId),
      editorState: {
        ...model.editorState,
        connectionSourceMachineId: null,
      },
    };
  }

  if (model.editorState.connectionSourceMachineId === null) {
    return {
      ...model,
      gameState: setSelectedMachine(model.gameState, machineId),
      editorState: {
        ...model.editorState,
        connectionSourceMachineId: machineId,
      },
    };
  }

  const connectionId = createConnectionId(
    model.editorState.nextConnectionIndex,
  );
  const gameState = connectMachinesInState(model.gameState, {
    id: connectionId,
    fromMachineId: model.editorState.connectionSourceMachineId,
    toMachineId: machineId,
  });

  return {
    ...model,
    gameState: setSelectedMachine(gameState, machineId),
    editorState: {
      ...model.editorState,
      connectionSourceMachineId: null,
      nextConnectionIndex:
        gameState === model.gameState
          ? model.editorState.nextConnectionIndex
          : model.editorState.nextConnectionIndex + 1,
    },
  };
}

export function handleConnectionClick(
  model: EditorModel,
  connectionId: ConnectionId,
): EditorModel {
  if (model.editorState.selectedTool.kind !== 'delete') {
    return model;
  }

  return {
    ...model,
    gameState: removeConnectionFromState(model.gameState, connectionId),
  };
}

export function startConnectionDrag(
  model: EditorModel,
  machineId: PlacementId,
): EditorModel {
  if (
    model.editorState.selectedTool.kind !== 'connect' ||
    findMachineById(model.gameState.machines, machineId) === null
  ) {
    return model;
  }

  return {
    ...model,
    editorState: {
      ...model.editorState,
      dragConnectionSourceMachineId: machineId,
    },
  };
}

export function finishConnectionDrag(
  model: EditorModel,
  targetMachineId: PlacementId | null,
): EditorModel {
  const sourceMachineId = model.editorState.dragConnectionSourceMachineId;

  if (sourceMachineId === null || targetMachineId === null) {
    return {
      ...model,
      editorState: {
        ...model.editorState,
        dragConnectionSourceMachineId: null,
      },
    };
  }

  const connectionId = createConnectionId(
    model.editorState.nextConnectionIndex,
  );
  const gameState = connectMachinesInState(model.gameState, {
    id: connectionId,
    fromMachineId: sourceMachineId,
    toMachineId: targetMachineId,
  });

  return {
    ...model,
    gameState,
    editorState: {
      ...model.editorState,
      dragConnectionSourceMachineId: null,
      nextConnectionIndex:
        gameState === model.gameState
          ? model.editorState.nextConnectionIndex
          : model.editorState.nextConnectionIndex + 1,
    },
  };
}

export function setMachineRecipe(
  model: EditorModel,
  machineId: PlacementId,
  recipeId: FoodId | null,
): EditorModel {
  if (findMachineById(model.gameState.machines, machineId) === null) {
    return model;
  }

  return {
    ...model,
    machineConfigs: {
      ...model.machineConfigs,
      [machineId]: {
        ...model.machineConfigs[machineId],
        recipeId,
      },
    },
  };
}
