import type { MachineConnection } from './connections.ts';
import type { FoodId } from './food.ts';
import { getFoodInfo } from './foods.ts';
import type { MachineId } from './machine.ts';
import type { FoodRecipe } from './recipes.ts';
import { findRecipesForMachine } from './recipes.ts';
import type { FoodItem } from './items.ts';
import { createFoodItem } from './items.ts';
import type { PlacedMachine, PlacementId } from './placement.ts';

export const STORAGE_SPAWN_INTERVAL_MS = 1_000;
export const MACHINE_PROCESS_TIME_MS = 1_000;
export const MACHINE_INPUT_CAPACITY = 6;
export const MACHINE_OUTPUT_CAPACITY = 1;

export type MachineRuntimeConfig = {
  spawnFoodId?: FoodId;
  recipeId?: FoodId | null;
};

export type MachineProcessRuntime = {
  recipeId: FoodId;
  outputFoodId: FoodId;
  remainingMs: number;
};

export type MachineRuntime = {
  placementId: PlacementId;
  machineId: MachineId;
  inputBuffer: readonly FoodItem[];
  outputBuffer: readonly FoodItem[];
  process: MachineProcessRuntime | null;
  storageElapsedMs: number;
  roundRobinIndex: number;
};

export type AdvanceMachineRuntimeInput = {
  runtime: MachineRuntime;
  deltaMs: number;
  nowMs: number;
  config?: MachineRuntimeConfig;
  recipes?: readonly FoodRecipe[];
  createItemId: () => string;
};

export type ExtractMachineOutputInput = {
  runtime: MachineRuntime;
  outputConnections: readonly MachineConnection[];
  occupiedConnectionIds: ReadonlySet<string>;
};

export function createMachineRuntime(machine: PlacedMachine): MachineRuntime {
  return {
    placementId: machine.id,
    machineId: machine.machineId,
    inputBuffer: [],
    outputBuffer: [],
    process: null,
    storageElapsedMs: 0,
    roundRobinIndex: 0,
  };
}

export function syncMachineRuntimes(
  machines: readonly PlacedMachine[],
  runtimes: Readonly<Record<PlacementId, MachineRuntime>>,
) {
  return machines.reduce<Record<PlacementId, MachineRuntime>>(
    (nextRuntimes, machine) => {
      const runtime = runtimes[machine.id];
      nextRuntimes[machine.id] =
        runtime !== undefined && runtime.machineId === machine.machineId
          ? runtime
          : createMachineRuntime(machine);

      return nextRuntimes;
    },
    {},
  );
}

export function canAcceptMachineInput(runtime: MachineRuntime) {
  if (runtime.machineId === 'storage') {
    return false;
  }

  if (runtime.machineId === 'shipping' || runtime.machineId === 'trash-bin') {
    return true;
  }

  return runtime.inputBuffer.length < MACHINE_INPUT_CAPACITY;
}

export function receiveMachineInput(
  runtime: MachineRuntime,
  item: FoodItem,
): MachineRuntime {
  if (runtime.machineId === 'shipping' || runtime.machineId === 'trash-bin') {
    return runtime;
  }

  return {
    ...runtime,
    inputBuffer: [...runtime.inputBuffer, item].slice(-MACHINE_INPUT_CAPACITY),
  };
}

function isSpawnableFood(foodId: FoodId) {
  return getFoodInfo(foodId)?.canSpawnFromStorage === true;
}

function includesFoodIds(
  items: readonly FoodItem[],
  foodIds: readonly FoodId[],
) {
  const availableFoodIds = items.map((item) => item.foodId);

  return foodIds.every((foodId) => {
    const index = availableFoodIds.indexOf(foodId);

    if (index === -1) {
      return false;
    }

    availableFoodIds.splice(index, 1);
    return true;
  });
}

function findConsumableRecipe({
  machineId,
  inputBuffer,
  config,
  recipes,
}: {
  machineId: MachineId;
  inputBuffer: readonly FoodItem[];
  config?: MachineRuntimeConfig;
  recipes?: readonly FoodRecipe[];
}) {
  const machineRecipes = findRecipesForMachine(machineId, recipes);

  if (config?.recipeId !== undefined && config.recipeId !== null) {
    const recipe = machineRecipes.find(
      (candidate) => candidate.id === config.recipeId,
    );

    return recipe !== undefined &&
      includesFoodIds(inputBuffer, recipe.inputFoodIds)
      ? recipe
      : null;
  }

  return (
    machineRecipes.find((recipe) =>
      includesFoodIds(inputBuffer, recipe.inputFoodIds),
    ) ?? null
  );
}

function consumeRecipeInputs(
  inputBuffer: readonly FoodItem[],
  recipe: FoodRecipe,
) {
  const neededFoodIds = [...recipe.inputFoodIds];
  const consumedItems: FoodItem[] = [];
  const remainingItems: FoodItem[] = [];

  inputBuffer.forEach((item) => {
    const neededIndex = neededFoodIds.indexOf(item.foodId);

    if (neededIndex === -1) {
      remainingItems.push(item);
      return;
    }

    consumedItems.push(item);
    neededFoodIds.splice(neededIndex, 1);
  });

  return {
    consumedItems,
    remainingItems,
  };
}

function startProcessIfReady(
  runtime: MachineRuntime,
  config: MachineRuntimeConfig | undefined,
  recipes: readonly FoodRecipe[] | undefined,
) {
  if (runtime.process !== null) {
    return runtime;
  }

  const recipe = findConsumableRecipe({
    machineId: runtime.machineId,
    inputBuffer: runtime.inputBuffer,
    config,
    recipes,
  });

  if (recipe === null) {
    return runtime;
  }

  const { remainingItems } = consumeRecipeInputs(runtime.inputBuffer, recipe);

  return {
    ...runtime,
    inputBuffer: remainingItems,
    process: {
      recipeId: recipe.id,
      outputFoodId: recipe.outputFoodId,
      remainingMs: MACHINE_PROCESS_TIME_MS,
    },
  };
}

function advanceStorage({
  runtime,
  deltaMs,
  nowMs,
  config,
  createItemId,
}: AdvanceMachineRuntimeInput) {
  if (
    config?.spawnFoodId === undefined ||
    !isSpawnableFood(config.spawnFoodId)
  ) {
    return {
      ...runtime,
      storageElapsedMs: 0,
    };
  }

  const storageElapsedMs = runtime.storageElapsedMs + deltaMs;

  if (storageElapsedMs < STORAGE_SPAWN_INTERVAL_MS) {
    return {
      ...runtime,
      storageElapsedMs,
    };
  }

  const outputItem = createFoodItem({
    id: createItemId(),
    foodId: config.spawnFoodId,
    createdAtMs: nowMs,
  });

  return {
    ...runtime,
    storageElapsedMs: storageElapsedMs - STORAGE_SPAWN_INTERVAL_MS,
    outputBuffer:
      runtime.outputBuffer.length >= MACHINE_OUTPUT_CAPACITY
        ? runtime.outputBuffer
        : [...runtime.outputBuffer, outputItem],
  };
}

function advancePassThrough(runtime: MachineRuntime) {
  if (
    runtime.outputBuffer.length > 0 ||
    (runtime.machineId !== 'splitter' && runtime.machineId !== 'merger') ||
    runtime.inputBuffer.length === 0
  ) {
    return runtime;
  }

  const [outputItem, ...inputBuffer] = runtime.inputBuffer;

  return {
    ...runtime,
    inputBuffer,
    outputBuffer: outputItem ? [...runtime.outputBuffer, outputItem] : [],
  };
}

function advanceProcessor({
  runtime,
  deltaMs,
  nowMs,
  config,
  recipes,
  createItemId,
}: AdvanceMachineRuntimeInput) {
  let nextRuntime = runtime;

  if (nextRuntime.process !== null) {
    const remainingMs = nextRuntime.process.remainingMs - deltaMs;

    if (remainingMs <= 0) {
      const outputItem = createFoodItem({
        id: createItemId(),
        foodId: nextRuntime.process.outputFoodId,
        createdAtMs: nowMs,
      });

      nextRuntime = {
        ...nextRuntime,
        outputBuffer:
          nextRuntime.outputBuffer.length >= MACHINE_OUTPUT_CAPACITY
            ? nextRuntime.outputBuffer
            : [...nextRuntime.outputBuffer, outputItem],
        process: null,
      };
    } else {
      nextRuntime = {
        ...nextRuntime,
        process: {
          ...nextRuntime.process,
          remainingMs,
        },
      };
    }
  }

  return startProcessIfReady(nextRuntime, config, recipes);
}

export function advanceMachineRuntime(input: AdvanceMachineRuntimeInput) {
  if (input.runtime.machineId === 'storage') {
    return advanceStorage(input);
  }

  if (
    input.runtime.machineId === 'splitter' ||
    input.runtime.machineId === 'merger'
  ) {
    return advancePassThrough(input.runtime);
  }

  return advanceProcessor(input);
}

function selectOutputConnection({
  runtime,
  outputConnections,
  occupiedConnectionIds,
}: ExtractMachineOutputInput) {
  const availableConnections = outputConnections.filter(
    (connection) => !occupiedConnectionIds.has(connection.id),
  );

  if (availableConnections.length === 0) {
    return null;
  }

  if (runtime.machineId !== 'splitter') {
    return availableConnections[0] ?? null;
  }

  const startIndex = runtime.roundRobinIndex % outputConnections.length;

  for (let offset = 0; offset < outputConnections.length; offset += 1) {
    const connection =
      outputConnections[(startIndex + offset) % outputConnections.length];

    if (connection !== undefined && !occupiedConnectionIds.has(connection.id)) {
      return connection;
    }
  }

  return null;
}

export function extractMachineOutput(input: ExtractMachineOutputInput) {
  const [item, ...outputBuffer] = input.runtime.outputBuffer;

  if (item === undefined) {
    return null;
  }

  const connection = selectOutputConnection(input);

  if (connection === null) {
    return null;
  }

  const connectionIndex = input.outputConnections.findIndex(
    (candidate) => candidate.id === connection.id,
  );

  return {
    item,
    connection,
    runtime: {
      ...input.runtime,
      outputBuffer,
      roundRobinIndex:
        input.runtime.machineId === 'splitter'
          ? connectionIndex + 1
          : input.runtime.roundRobinIndex,
    },
  };
}
