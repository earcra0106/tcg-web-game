import {
  findOutputConnections,
  type MachineConnection,
} from './connections.ts';
import { CONVEYOR_SPEED_CELLS_PER_SECOND } from './conveyorRender.ts';
import type { StageGoal } from './stageGoals.ts';
import type { TransportingFoodItem } from './items.ts';
import {
  advanceTransportingFoodItem,
  createTransportingFoodItem,
} from './items.ts';
import {
  advanceMachineRuntime,
  canAcceptMachineInput,
  extractMachineOutput,
  receiveMachineInput,
  syncMachineRuntimes,
  type MachineRuntime,
  type MachineRuntimeConfig,
} from './machineRuntime.ts';
import type { PlacedMachine, PlacementId } from './placement.ts';
import { findMachineById } from './placement.ts';
import { recordShipment, type ShipmentRecord } from './shipping.ts';

export const CONVEYOR_TRAVEL_TIME_MS = 600;

export type SimulationState = {
  nowMs: number;
  nextItemIndex: number;
  items: readonly TransportingFoodItem[];
  machineRuntimes: Readonly<Record<PlacementId, MachineRuntime>>;
  shippingHistory: readonly ShipmentRecord[];
};

export type SimulationInput = {
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  deltaMs: number;
  machineConfigs?: Readonly<Record<PlacementId, MachineRuntimeConfig>>;
  stageGoal?: StageGoal;
};

export function createInitialSimulationState(nowMs = 0): SimulationState {
  return {
    nowMs,
    nextItemIndex: 1,
    items: [],
    machineRuntimes: {},
    shippingHistory: [],
  };
}

function createItemId(nextItemIndex: number) {
  return `item-${nextItemIndex}`;
}

function calculateConnectionLength({
  item,
  machines,
}: {
  item: TransportingFoodItem;
  machines: readonly PlacedMachine[];
}) {
  const fromMachine = findMachineById(machines, item.fromMachineId);
  const toMachine = findMachineById(machines, item.toMachineId);

  if (fromMachine === null || toMachine === null) {
    return 1;
  }

  return Math.max(
    0.001,
    Math.hypot(
      toMachine.position.x - fromMachine.position.x,
      toMachine.position.z - fromMachine.position.z,
    ),
  );
}

function deliverArrivedItems({
  items,
  runtimes,
  machines,
  connections,
  shippingHistory,
  nowMs,
}: {
  items: readonly TransportingFoodItem[];
  runtimes: Record<PlacementId, MachineRuntime>;
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  shippingHistory: readonly ShipmentRecord[];
  nowMs: number;
}) {
  const waitingItems: TransportingFoodItem[] = [];
  let nextShippingHistory = shippingHistory;

  items.forEach((item) => {
    if (item.progress < 1) {
      waitingItems.push(item);
      return;
    }

    const runtime = runtimes[item.toMachineId];

    if (runtime === undefined) {
      return;
    }

    const targetMachine = findMachineById(machines, item.toMachineId);
    const hasOutputConnection = connections.some(
      (connection) => connection.fromMachineId === item.toMachineId,
    );

    if (
      (runtime.machineId === 'splitter' || runtime.machineId === 'merger') &&
      !hasOutputConnection
    ) {
      return;
    }

    if (!canAcceptMachineInput(runtime) && hasOutputConnection) {
      waitingItems.push(item);
      return;
    }

    if (runtime.machineId === 'shipping') {
      if (targetMachine?.foodId === item.foodId) {
        nextShippingHistory = recordShipment(nextShippingHistory, {
          itemId: item.id,
          foodId: item.foodId,
          shippedAtMs: nowMs,
        });
      }
      return;
    }

    if (runtime.machineId === 'trash-bin') {
      return;
    }

    runtimes[item.toMachineId] = receiveMachineInput(runtime, item);
  });

  return {
    waitingItems,
    shippingHistory: nextShippingHistory,
  };
}

function advanceRuntimes({
  runtimes,
  machines,
  connections,
  deltaMs,
  nowMs,
  machineConfigs,
  nextItemIndex,
}: {
  runtimes: Record<PlacementId, MachineRuntime>;
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  deltaMs: number;
  nowMs: number;
  machineConfigs: Readonly<Record<PlacementId, MachineRuntimeConfig>>;
  nextItemIndex: number;
}) {
  let itemIndex = nextItemIndex;
  const nextRuntimes: Record<PlacementId, MachineRuntime> = {};

  machines.forEach((machine) => {
    const runtime = runtimes[machine.id];

    if (runtime === undefined) {
      return;
    }

    nextRuntimes[machine.id] = advanceMachineRuntime({
      runtime,
      deltaMs,
      nowMs,
      hasOutputConnection: connections.some(
        (connection) => connection.fromMachineId === machine.id,
      ),
      config: machineConfigs[machine.id],
      createItemId: () => {
        const id = createItemId(itemIndex);
        itemIndex += 1;
        return id;
      },
    });
  });

  return {
    runtimes: nextRuntimes,
    nextItemIndex: itemIndex,
  };
}

function extractOutputs({
  runtimes,
  machines,
  connections,
  items,
  nowMs,
}: {
  runtimes: Record<PlacementId, MachineRuntime>;
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  items: readonly TransportingFoodItem[];
  nowMs: number;
}) {
  const nextItems = [...items];

  machines.forEach((machine) => {
    const runtime = runtimes[machine.id];

    if (runtime === undefined) {
      return;
    }

    const outputConnections = findOutputConnections(connections, machine.id);

    if (
      outputConnections.length === 0 &&
      (machine.machineId === 'splitter' || machine.machineId === 'merger')
    ) {
      runtimes[machine.id] = {
        ...runtime,
        inputBuffer: [],
        outputBuffer: [],
      };
      return;
    }

    let nextRuntime = runtime;

    while (true) {
      const output = extractMachineOutput({
        runtime: nextRuntime,
        outputConnections,
      });

      if (output === null) {
        runtimes[machine.id] = nextRuntime;
        return;
      }

      nextRuntime = output.runtime;
      runtimes[machine.id] = nextRuntime;
      nextItems.push(
        createTransportingFoodItem(
          output.item,
          output.connection.id,
          output.connection.fromMachineId,
          output.connection.toMachineId,
        ),
      );

      if (machine.machineId !== 'splitter' && machine.machineId !== 'merger') {
        return;
      }

      nextRuntime = advanceMachineRuntime({
        runtime: nextRuntime,
        deltaMs: 0,
        nowMs,
        createItemId: () => '',
      });
    }
  });

  return nextItems;
}

export function stepSimulation(
  state: SimulationState,
  input: SimulationInput,
): SimulationState {
  if (input.deltaMs < 0) {
    throw new RangeError('deltaMs must be greater than or equal to zero');
  }

  const nowMs = state.nowMs + input.deltaMs;
  const connectionIds = new Set(
    input.connections.map((connection) => connection.id),
  );
  const existingItems = state.items.filter((item) =>
    connectionIds.has(item.connectionId),
  );
  const syncedRuntimes = syncMachineRuntimes(
    input.machines,
    state.machineRuntimes,
  );
  const traveledCells =
    (input.deltaMs / 1_000) * CONVEYOR_SPEED_CELLS_PER_SECOND;
  const advancedItems = existingItems.map((item) =>
    advanceTransportingFoodItem(
      item,
      traveledCells /
        calculateConnectionLength({ item, machines: input.machines }),
    ),
  );
  const delivery = deliverArrivedItems({
    items: advancedItems,
    runtimes: syncedRuntimes,
    machines: input.machines,
    connections: input.connections,
    shippingHistory: state.shippingHistory,
    nowMs,
  });
  const advancedRuntimes = advanceRuntimes({
    runtimes: syncedRuntimes,
    machines: input.machines,
    connections: input.connections,
    deltaMs: input.deltaMs,
    nowMs,
    machineConfigs: input.machineConfigs ?? {},
    nextItemIndex: state.nextItemIndex,
  });
  const items = extractOutputs({
    runtimes: advancedRuntimes.runtimes,
    machines: input.machines,
    connections: input.connections,
    items: delivery.waitingItems,
    nowMs,
  });

  return {
    nowMs,
    nextItemIndex: advancedRuntimes.nextItemIndex,
    items,
    machineRuntimes: advancedRuntimes.runtimes,
    shippingHistory: delivery.shippingHistory,
  };
}
