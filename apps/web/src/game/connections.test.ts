import { describe, expect, it } from 'vitest';
import {
  createConnection,
  findInputConnections,
  findOutputConnections,
  removeConnection,
  removeConnectionsForMachine,
  type MachineConnection,
} from './connections.ts';
import { machineInfos } from './machine.ts';
import type { PlacedMachine } from './placement.ts';

const machines: readonly PlacedMachine[] = [
  { id: 'machine-1', machineId: 'cutter', position: { x: 0, z: 0 } },
  { id: 'machine-2', machineId: 'heater', position: { x: 1, z: 0 } },
  { id: 'machine-3', machineId: 'mixer', position: { x: 2, z: 0 } },
  { id: 'machine-4', machineId: 'splitter', position: { x: 3, z: 0 } },
  { id: 'machine-5', machineId: 'storage', position: { x: 4, z: 0 } },
  { id: 'machine-6', machineId: 'shipping', position: { x: 5, z: 0 } },
  { id: 'machine-7', machineId: 'trash-bin', position: { x: 6, z: 0 } },
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

  it.each(machineInfos)(
    'rejects a conveyor from $id to itself',
    ({ id: machineId }) => {
      const connections: readonly MachineConnection[] = [];
      const selfMachine: PlacedMachine = {
        id: `self-${machineId}`,
        machineId,
        position: { x: 0, z: 0 },
      };

      expect(
        createConnection(connections, [selfMachine], {
          id: 'self-connection',
          fromMachineId: selfMachine.id,
          toMachineId: selfMachine.id,
        }),
      ).toBe(connections);
    },
  );

  it('prevents duplicate connection ids', () => {
    const connections = [connection];
    const nextConnections = createConnection(connections, machines, {
      id: 'connection-1',
      fromMachineId: 'machine-2',
      toMachineId: 'machine-3',
    });

    expect(nextConnections).toBe(connections);
  });

  it('allows only splitters to have multiple output connections', () => {
    const connections = [connection];

    expect(
      createConnection(connections, machines, {
        id: 'connection-2',
        fromMachineId: 'machine-1',
        toMachineId: 'machine-3',
      }),
    ).toBe(connections);

    expect(
      createConnection(
        [
          {
            id: 'connection-3',
            fromMachineId: 'machine-4',
            toMachineId: 'machine-1',
          },
        ],
        machines,
        {
          id: 'connection-4',
          fromMachineId: 'machine-4',
          toMachineId: 'machine-2',
        },
      ),
    ).toHaveLength(2);
  });

  it('rejects connections into storage', () => {
    const connections: readonly MachineConnection[] = [];

    expect(
      createConnection(connections, machines, {
        id: 'connection-2',
        fromMachineId: 'machine-1',
        toMachineId: 'machine-5',
      }),
    ).toBe(connections);
  });

  it('rejects connections from shipping and trash machines', () => {
    const connections: readonly MachineConnection[] = [];

    expect(
      createConnection(connections, machines, {
        id: 'connection-2',
        fromMachineId: 'machine-6',
        toMachineId: 'machine-1',
      }),
    ).toBe(connections);

    expect(
      createConnection(connections, machines, {
        id: 'connection-3',
        fromMachineId: 'machine-7',
        toMachineId: 'machine-1',
      }),
    ).toBe(connections);
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
