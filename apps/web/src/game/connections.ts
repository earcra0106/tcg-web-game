import {
  findMachineById,
  type PlacedMachine,
  type PlacementId,
} from './placement.ts';

export type ConnectionId = string;

export type MachineConnection = {
  id: ConnectionId;
  fromMachineId: PlacementId;
  toMachineId: PlacementId;
};

export function findInputConnections(
  connections: readonly MachineConnection[],
  machineId: PlacementId,
) {
  return connections.filter(
    (connection) => connection.toMachineId === machineId,
  );
}

export function findOutputConnections(
  connections: readonly MachineConnection[],
  machineId: PlacementId,
) {
  return connections.filter(
    (connection) => connection.fromMachineId === machineId,
  );
}

export function createConnection(
  connections: readonly MachineConnection[],
  machines: readonly PlacedMachine[],
  connection: MachineConnection,
) {
  const fromMachine = findMachineById(machines, connection.fromMachineId);
  const toMachine = findMachineById(machines, connection.toMachineId);

  if (fromMachine === null || toMachine === null) {
    return connections;
  }

  if (
    fromMachine.machineId !== 'splitter' &&
    findOutputConnections(connections, fromMachine.id).length >= 1
  ) {
    return connections;
  }

  if (
    fromMachine.machineId === 'shipping' ||
    fromMachine.machineId === 'trash-bin'
  ) {
    return connections;
  }

  if (toMachine.machineId === 'storage') {
    return connections;
  }

  if (connections.some((current) => current.id === connection.id)) {
    return connections;
  }

  if (
    connections.some(
      (current) =>
        current.fromMachineId === connection.fromMachineId &&
        current.toMachineId === connection.toMachineId,
    )
  ) {
    return connections;
  }

  return [...connections, connection];
}

export function removeConnection(
  connections: readonly MachineConnection[],
  connectionId: ConnectionId,
) {
  return connections.filter((connection) => connection.id !== connectionId);
}

export function removeConnectionsForMachine(
  connections: readonly MachineConnection[],
  machineId: PlacementId,
) {
  return connections.filter(
    (connection) =>
      connection.fromMachineId !== machineId &&
      connection.toMachineId !== machineId,
  );
}
