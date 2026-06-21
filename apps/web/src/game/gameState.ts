import {
  createConnection,
  removeConnection,
  removeConnectionsForMachine,
  type MachineConnection,
  type ConnectionId,
} from './connections.ts';
import {
  placeMachine,
  removeMachine,
  type PlacedMachine,
  type PlacementId,
} from './placement.ts';

export type GameSelection = {
  selectedMachineId: PlacementId | null;
};

export type GameState = {
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  stageIndex: number;
  selection: GameSelection;
};

export function createInitialGameState(): GameState {
  return {
    machines: [],
    connections: [],
    stageIndex: 0,
    selection: {
      selectedMachineId: null,
    },
  };
}

export function placeMachineInState(
  state: GameState,
  machine: PlacedMachine,
): GameState {
  const machines = placeMachine(state.machines, machine);

  if (machines === state.machines) {
    return state;
  }

  return {
    ...state,
    machines,
  };
}

export function removeMachineFromState(
  state: GameState,
  machineId: PlacementId,
): GameState {
  const machines = removeMachine(state.machines, machineId);

  if (machines.length === state.machines.length) {
    return state;
  }

  return {
    ...state,
    machines,
    connections: removeConnectionsForMachine(state.connections, machineId),
    selection: {
      selectedMachineId:
        state.selection.selectedMachineId === machineId
          ? null
          : state.selection.selectedMachineId,
    },
  };
}

export function connectMachinesInState(
  state: GameState,
  connection: MachineConnection,
): GameState {
  const connections = createConnection(
    state.connections,
    state.machines,
    connection,
  );

  if (connections === state.connections) {
    return state;
  }

  return {
    ...state,
    connections,
  };
}

export function removeConnectionFromState(
  state: GameState,
  connectionId: ConnectionId,
): GameState {
  const connections = removeConnection(state.connections, connectionId);

  if (connections.length === state.connections.length) {
    return state;
  }

  return {
    ...state,
    connections,
  };
}
