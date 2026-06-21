import { describe, expect, it } from 'vitest';
import {
  createConnection,
  findInputConnections,
  findOutputConnections,
  removeConnection,
  removeConnectionsForMachine,
  type MachineConnection,
} from './connections.ts';
import type { PlacedMachine } from './placement.ts';

const machines: readonly PlacedMachine[] = [
  { id: 'machine-1', machineId: 'cutter', position: { x: 0, z: 0 } },
  { id: 'machine-2', machineId: 'heater', position: { x: 1, z: 0 } },
  { id: 'machine-3', machineId: 'mixer', position: { x: 2, z: 0 } },
];

const connection: MachineConnection = {
  id: 'connection-1',
  fromMachineId: 'machine-1',
  toMachineId: 'machine-2',
};

describe('machine connections', () => {
  it('creates a directed connection between existing machines', () => {
    expect(createConnection([], machines, connection)).toEqual([connection]);
  });

  it('prevents duplicate directed connections', () => {
    const connections = [connection];
    const nextConnections = createConnection(connections, machines, {
      id: 'connection-2',
      fromMachineId: 'machine-1',
      toMachineId: 'machine-2',
    });

    expect(nextConnections).toBe(connections);
  });

  it('prevents duplicate connection ids', () => {
    const connections = [connection];
    const nextConnections = createConnection(connections, machines, {
      id: 'connection-1',
      fromMachineId: 'machine-2',
      toMachineId: 'machine-3',
    });

    expect(nextConnections).toBe(connections);
  });

  it('rejects connections with missing machines', () => {
    const connections: readonly MachineConnection[] = [];

    expect(
      createConnection(connections, machines, {
        id: 'connection-2',
        fromMachineId: 'missing',
        toMachineId: 'machine-2',
      }),
    ).toBe(connections);

    expect(
      createConnection(connections, machines, {
        id: 'connection-3',
        fromMachineId: 'machine-1',
        toMachineId: 'missing',
      }),
    ).toBe(connections);
  });

  it('finds inputs and outputs for a machine', () => {
    const connections = [
      connection,
      {
        id: 'connection-2',
        fromMachineId: 'machine-2',
        toMachineId: 'machine-3',
      },
    ];

    expect(findInputConnections(connections, 'machine-2')).toEqual([
      connection,
    ]);
    expect(findOutputConnections(connections, 'machine-2')).toEqual([
      connections[1],
    ]);
  });

  it('removes connections by id or related machine', () => {
    const connections = [
      connection,
      {
        id: 'connection-2',
        fromMachineId: 'machine-2',
        toMachineId: 'machine-3',
      },
    ];

    expect(removeConnection(connections, 'connection-1')).toEqual([
      connections[1],
    ]);
    expect(removeConnectionsForMachine(connections, 'machine-2')).toEqual([]);
  });
});
