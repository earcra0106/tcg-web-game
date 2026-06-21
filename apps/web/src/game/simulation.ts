import {
  findOutputConnections,
  type MachineConnection,
} from './connections.ts';
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
import { recordShipment, type ShipmentRecord } from './shipping.ts';

export const CONVEYOR_TRAVEL_TIME_MS = 500;

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

function deliverArrivedItems({
  items,
  runtimes,
  shippingHistory,
  nowMs,
}: {
  items: readonly TransportingFoodItem[];
  runtimes: Record<PlacementId, MachineRuntime>;
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

    if (runtime === undefined || !canAcceptMachineInput(runtime)) {
      waitingItems.push(item);
      return;
    }

    if (runtime.machineId === 'shipping') {
      nextShippingHistory = recordShipment(nextShippingHistory, {
        itemId: item.id,
        foodId: item.foodId,
        shippedAtMs: nowMs,
      });
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
  deltaMs,
  nowMs,
  machineConfigs,
  nextItemIndex,
}: {
  runtimes: Record<PlacementId, MachineRuntime>;
  machines: readonly PlacedMachine[];
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
}: {
  runtimes: Record<PlacementId, MachineRuntime>;
  machines: readonly PlacedMachine[];
  connections: readonly MachineConnection[];
  items: readonly TransportingFoodItem[];
}) {
  const nextItems = [...items];
  const occupiedConnectionIds = new Set(
    nextItems.map((item) => item.connectionId),
  );

  machines.forEach((machine) => {
    const runtime = runtimes[machine.id];

    if (runtime === undefined) {
      return;
    }

    const output = extractMachineOutput({
      runtime,
      outputConnections: findOutputConnections(connections, machine.id),
      occupiedConnectionIds,
    });

    if (output === null) {
      return;
    }

    runtimes[machine.id] = output.runtime;
    occupiedConnectionIds.add(output.connection.id);
    nextItems.push(
      createTransportingFoodItem(
        output.item,
        output.connection.id,
        output.connection.fromMachineId,
        output.connection.toMachineId,
      ),
    );
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
  const syncedRuntimes = syncMachineRuntimes(
    input.machines,
    state.machineRuntimes,
  );
  const advancedItems = state.items.map((item) =>
    advanceTransportingFoodItem(item, input.deltaMs / CONVEYOR_TRAVEL_TIME_MS),
  );
  const delivery = deliverArrivedItems({
    items: advancedItems,
    runtimes: syncedRuntimes,
    shippingHistory: state.shippingHistory,
    nowMs,
  });
  const advancedRuntimes = advanceRuntimes({
    runtimes: syncedRuntimes,
    machines: input.machines,
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
  });

  return {
    nowMs,
    nextItemIndex: advancedRuntimes.nextItemIndex,
    items,
    machineRuntimes: advancedRuntimes.runtimes,
    shippingHistory: delivery.shippingHistory,
  };
}
