import type { FoodId } from './food.ts';
import type { ConnectionId } from './connections.ts';
import type { PlacementId } from './placement.ts';

export type FoodItemId = string;

export type FoodItem = {
  id: FoodItemId;
  foodId: FoodId;
  createdAtMs: number;
};

export type TransportingFoodItem = FoodItem & {
  connectionId: ConnectionId;
  fromMachineId: PlacementId;
  toMachineId: PlacementId;
  progress: number;
};

export type CreateFoodItemInput = {
  id: FoodItemId;
  foodId: FoodId;
  createdAtMs: number;
};

export function createFoodItem({
  id,
  foodId,
  createdAtMs,
}: CreateFoodItemInput): FoodItem {
  return {
    id,
    foodId,
    createdAtMs,
  };
}

export function createTransportingFoodItem(
  item: FoodItem,
  connectionId: ConnectionId,
  fromMachineId: PlacementId,
  toMachineId: PlacementId,
): TransportingFoodItem {
  return {
    ...item,
    connectionId,
    fromMachineId,
    toMachineId,
    progress: 0,
  };
}

export function advanceTransportingFoodItem(
  item: TransportingFoodItem,
  deltaProgress: number,
): TransportingFoodItem {
  return {
    ...item,
    progress: Math.max(0, Math.min(1, item.progress + deltaProgress)),
  };
}
