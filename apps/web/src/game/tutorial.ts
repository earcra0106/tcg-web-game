import type { ConnectionId } from './connections.ts';
import type { EditorTool } from './editorState.ts';
import type { FoodId } from './food.ts';
import { getFoodInfo } from './foods.ts';
import {
  getMachineInfo,
  hasMachineInventory,
  type MachineId,
} from './machine.ts';
import type { PlacedMachine, PlacementId } from './placement.ts';
import { findRecipeByOutput, getMachineForProcess } from './recipes.ts';
import type { StageGoal } from './stageGoals.ts';

export type TutorialStep =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export type TutorialStageScenario = {
  targetFoodId: FoodId;
  targetFoodName: string;
  ingredientFoodId: FoodId;
  ingredientFoodName: string;
  processorMachineId: MachineId;
  processorMachineName: string;
};

export type TutorialScenario = {
  stageOne: TutorialStageScenario;
  stageTwo: TutorialStageScenario;
};

export type TutorialState = {
  step: TutorialStep;
  isEnabled: boolean;
  stageOneStorageMachineId: PlacementId | null;
  stageOneShippingMachineId: PlacementId | null;
  stageOneProcessorMachineId: PlacementId | null;
  selectedProcessorMachineId: PlacementId | null;
  isStageTwoRecipeArrowDismissed: boolean;
};

export type TutorialEvent =
  | { type: 'toggle' }
  | { type: 'tool-selected'; tool: EditorTool }
  | { type: 'machine-placed'; machine: PlacedMachine }
  | { type: 'connection-source-selected'; machineId: PlacementId }
  | {
      type: 'connection-created';
      connectionId: ConnectionId;
      fromMachineId: PlacementId;
      toMachineId: PlacementId;
    }
  | { type: 'machine-selected'; machine: PlacedMachine }
  | { type: 'goal-recipe-opened'; stageNumber: number; foodId: FoodId }
  | {
      type: 'recipe-selected';
      machineId: PlacementId;
      recipeId: FoodId | null;
    }
  | { type: 'stage-cleared'; stageNumber: number };

export type TutorialIconId = 'beginner' | 'connect' | 'select' | 'fast-forward';

export type TutorialMessageToken =
  | { type: 'text'; value: string }
  | { type: 'icon'; icon: TutorialIconId };

export type TutorialArrowTarget =
  | { kind: 'tool'; machineId: MachineId; foodId?: FoodId }
  | { kind: 'mode'; tool: 'select' | 'connect' }
  | { kind: 'machine'; machineId: PlacementId }
  | { kind: 'stage-goals' }
  | { kind: 'goal-recipe'; foodId: FoodId }
  | { kind: 'machine-recipe'; machineId: PlacementId };

export type TutorialView = {
  step: TutorialStep;
  lines: readonly (readonly TutorialMessageToken[])[];
  arrowTarget: TutorialArrowTarget | null;
};

function createStageScenario(goal: StageGoal): TutorialStageScenario {
  const recipe = findRecipeByOutput(goal.targetFoodId);
  const ingredientFoodId = recipe?.inputFoodIds[0];
  const ingredient =
    recipe?.inputFoodIds.length === 1 && ingredientFoodId !== undefined
      ? getFoodInfo(ingredientFoodId)
      : null;
  const processorMachineId =
    recipe === null ? null : getMachineForProcess(recipe.process);
  const processor =
    processorMachineId === null ? null : getMachineInfo(processorMachineId);

  if (
    recipe === null ||
    ingredientFoodId === undefined ||
    ingredient === null ||
    !ingredient.canSpawnFromStorage ||
    processorMachineId === null ||
    processor === null
  ) {
    throw new Error(
      `Tutorial requires a single storage ingredient recipe: ${goal.targetFoodId}`,
    );
  }

  return {
    targetFoodId: goal.targetFoodId,
    targetFoodName: goal.targetFoodName,
    ingredientFoodId,
    ingredientFoodName: ingredient.name,
    processorMachineId,
    processorMachineName: processor.name,
  };
}

export function createTutorialScenario(
  stageOneGoal: StageGoal,
  stageTwoGoal: StageGoal,
): TutorialScenario {
  return {
    stageOne: createStageScenario(stageOneGoal),
    stageTwo: createStageScenario(stageTwoGoal),
  };
}

export function createInitialTutorialState(): TutorialState {
  return {
    step: 1,
    isEnabled: true,
    stageOneStorageMachineId: null,
    stageOneShippingMachineId: null,
    stageOneProcessorMachineId: null,
    selectedProcessorMachineId: null,
    isStageTwoRecipeArrowDismissed: false,
  };
}

function isPlacementTool(
  tool: EditorTool,
  machineId: MachineId,
  foodId?: FoodId,
) {
  return (
    tool.kind === 'place-machine' &&
    tool.machineId === machineId &&
    tool.foodId === foodId
  );
}

export function reduceTutorial(
  state: TutorialState,
  event: TutorialEvent,
  scenario: TutorialScenario,
): TutorialState {
  if (event.type === 'toggle') {
    return { ...state, isEnabled: !state.isEnabled };
  }

  if (event.type === 'stage-cleared' && event.stageNumber === 2) {
    return {
      ...state,
      step: 16,
      isEnabled: false,
      selectedProcessorMachineId: null,
    };
  }

  switch (state.step) {
    case 1:
      return event.type === 'tool-selected' &&
        isPlacementTool(
          event.tool,
          'storage',
          scenario.stageOne.ingredientFoodId,
        )
        ? { ...state, step: 2 }
        : state;
    case 2:
      return event.type === 'machine-placed' &&
        event.machine.machineId === 'storage' &&
        event.machine.foodId === scenario.stageOne.ingredientFoodId
        ? {
            ...state,
            step: 3,
            stageOneStorageMachineId: event.machine.id,
          }
        : state;
    case 3:
      return event.type === 'tool-selected' &&
        isPlacementTool(event.tool, 'shipping', scenario.stageOne.targetFoodId)
        ? { ...state, step: 4 }
        : state;
    case 4:
      return event.type === 'machine-placed' &&
        event.machine.machineId === 'shipping' &&
        event.machine.foodId === scenario.stageOne.targetFoodId
        ? {
            ...state,
            step: 5,
            stageOneShippingMachineId: event.machine.id,
          }
        : state;
    case 5:
      return event.type === 'tool-selected' &&
        isPlacementTool(event.tool, scenario.stageOne.processorMachineId)
        ? { ...state, step: 6 }
        : state;
    case 6:
      return event.type === 'machine-placed' &&
        event.machine.machineId === scenario.stageOne.processorMachineId
        ? {
            ...state,
            step: 7,
            stageOneProcessorMachineId: event.machine.id,
          }
        : state;
    case 7:
      return event.type === 'tool-selected' && event.tool.kind === 'connect'
        ? { ...state, step: 8 }
        : state;
    case 8:
      return event.type === 'connection-source-selected' &&
        event.machineId === state.stageOneStorageMachineId
        ? { ...state, step: 9 }
        : state;
    case 9:
      return event.type === 'connection-created' &&
        event.fromMachineId === state.stageOneStorageMachineId &&
        event.toMachineId === state.stageOneProcessorMachineId
        ? { ...state, step: 10 }
        : state;
    case 10:
      return event.type === 'connection-source-selected' &&
        event.machineId === state.stageOneProcessorMachineId
        ? { ...state, step: 11 }
        : state;
    case 11:
      return event.type === 'connection-created' &&
        event.fromMachineId === state.stageOneProcessorMachineId &&
        event.toMachineId === state.stageOneShippingMachineId
        ? { ...state, step: 12 }
        : state;
    case 12:
      return event.type === 'stage-cleared' && event.stageNumber === 1
        ? { ...state, step: 13 }
        : state;
    case 13:
      if (
        event.type === 'goal-recipe-opened' &&
        event.stageNumber === 2 &&
        event.foodId === scenario.stageTwo.targetFoodId
      ) {
        return { ...state, isStageTwoRecipeArrowDismissed: true };
      }

      return event.type === 'machine-placed' &&
        event.machine.machineId === scenario.stageTwo.processorMachineId
        ? { ...state, step: 14 }
        : state;
    case 14:
    case 15:
      if (
        event.type === 'machine-selected' &&
        hasMachineInventory(event.machine.machineId)
      ) {
        return {
          ...state,
          step: 15,
          selectedProcessorMachineId: event.machine.id,
        };
      }

      return state.step === 15 &&
        event.type === 'recipe-selected' &&
        event.machineId === state.selectedProcessorMachineId &&
        event.recipeId === scenario.stageTwo.targetFoodId
        ? { ...state, step: 16 }
        : state;
    case 16:
      return state;
  }
}

const text = (value: string): TutorialMessageToken => ({ type: 'text', value });
const icon = (value: TutorialIconId): TutorialMessageToken => ({
  type: 'icon',
  icon: value,
});

export function createTutorialView(
  state: TutorialState,
  scenario: TutorialScenario,
  actionLabel: 'タップ' | 'クリック',
  selectedTool: EditorTool,
): TutorialView | null {
  if (!state.isEnabled) {
    return null;
  }

  const stageOne = scenario.stageOne;
  const stageTwo = scenario.stageTwo;
  const line = (...tokens: TutorialMessageToken[]) => tokens;

  switch (state.step) {
    case 1:
      return {
        step: 1,
        lines: [
          line(text('cookers! へようこそ！')),
          line(text('まずは食材を倉庫から出しましょう。')),
          line(
            text('(チュートリアルは '),
            icon('beginner'),
            text(' ボタンで非表示にできます)'),
          ),
        ],
        arrowTarget: {
          kind: 'tool',
          machineId: 'storage',
          foodId: stageOne.ingredientFoodId,
        },
      };
    case 2:
      return {
        step: 2,
        lines: [
          line(
            text(
              `${stageOne.ingredientFoodName}の倉庫をエリアのどこかに配置してみましょう！`,
            ),
          ),
          line(text(`${actionLabel}で配置できます。`)),
        ],
        arrowTarget: null,
      };
    case 3:
      return {
        step: 3,
        lines: [
          line(
            text(
              `${stageOne.ingredientFoodName}を${stageOne.targetFoodName}に加工するラインを作る必要があります。`,
            ),
          ),
          line(
            text(
              `${stageOne.targetFoodName}の出荷口をどこかに配置してください。`,
            ),
          ),
        ],
        arrowTarget: {
          kind: 'tool',
          machineId: 'shipping',
          foodId: stageOne.targetFoodId,
        },
      };
    case 4:
      return {
        step: 4,
        lines: [
          line(
            text(
              `${stageOne.targetFoodName}の出荷口をエリアのどこかに配置してみましょう！`,
            ),
          ),
          line(text(`${actionLabel}で配置できます。`)),
        ],
        arrowTarget: null,
      };
    case 5:
      return {
        step: 5,
        lines: [
          line(text('加工ラインには調理器具が欠かせません。')),
          line(text(`${stageOne.processorMachineName}も置いてみましょう！`)),
        ],
        arrowTarget: {
          kind: 'tool',
          machineId: stageOne.processorMachineId,
        },
      };
    case 6:
      return {
        step: 6,
        lines: [
          line(
            text(
              `${stageOne.processorMachineName}をエリアのどこかに配置してみましょう！`,
            ),
          ),
          line(text(`${actionLabel}で配置できます。`)),
        ],
        arrowTarget: null,
      };
    case 7:
      return {
        step: 7,
        lines: [
          line(text('配置した設備をつなげて、加工ラインを完成させましょう！')),
          line(icon('connect'), text(` ボタンを${actionLabel}してください。`)),
        ],
        arrowTarget: { kind: 'mode', tool: 'connect' },
      };
    case 8:
    case 9:
      return {
        step: state.step,
        lines: [
          line(text('ベルトコンベアモードに切り替わりました！')),
          line(
            text(
              `配置した倉庫と${stageOne.processorMachineName}を順番に${actionLabel}すると接続できます。`,
            ),
          ),
        ],
        arrowTarget:
          state.step === 8 && state.stageOneStorageMachineId !== null
            ? { kind: 'machine', machineId: state.stageOneStorageMachineId }
            : state.stageOneProcessorMachineId !== null
              ? {
                  kind: 'machine',
                  machineId: state.stageOneProcessorMachineId,
                }
              : null,
      };
    case 10:
    case 11:
      return {
        step: state.step,
        lines: [
          line(
            text(
              `続けて、${stageOne.processorMachineName}と出荷口も接続してください！`,
            ),
          ),
        ],
        arrowTarget:
          state.step === 10 && state.stageOneProcessorMachineId !== null
            ? {
                kind: 'machine',
                machineId: state.stageOneProcessorMachineId,
              }
            : state.stageOneShippingMachineId !== null
              ? {
                  kind: 'machine',
                  machineId: state.stageOneShippingMachineId,
                }
              : null,
      };
    case 12:
      return {
        step: 12,
        lines: [
          line(
            text(
              '加工が始まりました！出荷されるまでしばらく待ってみましょう...',
            ),
          ),
          line(
            text('('),
            icon('fast-forward'),
            text(` ボタンを${actionLabel}すると倍速にできますよ！)`),
          ),
        ],
        arrowTarget: { kind: 'stage-goals' },
      };
    case 13:
      return {
        step: 13,
        lines: [
          line(text('おみごとです！次のステージの目標に挑戦してみましょう。')),
          line(
            text(
              `レシピが分からなくなったら、ここを${actionLabel}してレシピを確認できます。`,
            ),
          ),
        ],
        arrowTarget: state.isStageTwoRecipeArrowDismissed
          ? null
          : { kind: 'goal-recipe', foodId: stageTwo.targetFoodId },
      };
    case 14:
      return {
        step: 14,
        lines: [
          line(text('ラインが複雑になってきましたね！')),
          line(
            icon('select'),
            text(
              ` ボタンで選択モードにして、今置いた加工機を選択してみましょう。`,
            ),
          ),
        ],
        arrowTarget:
          selectedTool.kind === 'select'
            ? null
            : { kind: 'mode', tool: 'select' },
      };
    case 15:
      return {
        step: 15,
        lines: [
          line(text(`ここを${actionLabel}して、加工する料理を指定できます。`)),
          line(
            text(
              `他の料理を間違えて作りたくないときに役立ちますよ！ 今回は\u3000${stageTwo.targetFoodName}を指定すればよさそうです。`,
            ),
          ),
        ],
        arrowTarget:
          state.selectedProcessorMachineId === null
            ? null
            : {
                kind: 'machine-recipe',
                machineId: state.selectedProcessorMachineId,
              },
      };
    case 16:
      return {
        step: 16,
        lines: [
          line(
            text(
              '以上でチュートリアルは終わりです。 厨房の限界に挑戦してみてください！',
            ),
          ),
          line(
            text(
              '(チュートリアルをもう一度見たい場合は、ゲームをもう一度起動してください)',
            ),
          ),
        ],
        arrowTarget: null,
      };
  }
}
