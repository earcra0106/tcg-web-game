import type { FoodId } from './food.ts';
import type { StageGoal } from './stageGoals.ts';

export type ShipmentRecord = {
  itemId: string;
  foodId: FoodId;
  shippedAtMs: number;
};

export type ShippingEfficiencyInput = {
  history: readonly ShipmentRecord[];
  targetFoodId: FoodId;
  nowMs: number;
  windowMs: number;
};

export function recordShipment(
  history: readonly ShipmentRecord[],
  record: ShipmentRecord,
) {
  return [...history, record];
}

export function countTargetShipments({
  history,
  targetFoodId,
  nowMs,
  windowMs,
}: ShippingEfficiencyInput) {
  const windowStartMs = nowMs - windowMs;

  return history.filter(
    (record) =>
      record.foodId === targetFoodId &&
      record.shippedAtMs > windowStartMs &&
      record.shippedAtMs <= nowMs,
  ).length;
}

export function calculateShippingEfficiency(input: ShippingEfficiencyInput) {
  if (input.windowMs <= 0) {
    throw new RangeError('windowMs must be greater than zero');
  }

  const shipments = countTargetShipments(input);

  return shipments / (input.windowMs / 60_000);
}

export function isStageGoalCleared({
  history,
  goal,
  nowMs,
  windowMs,
}: {
  history: readonly ShipmentRecord[];
  goal: StageGoal;
  nowMs: number;
  windowMs: number;
}) {
  return (
    calculateShippingEfficiency({
      history,
      targetFoodId: goal.targetFoodId,
      nowMs,
      windowMs,
    }) >= goal.requiredEfficiency
  );
}
