import { describe, expect, it } from 'vitest';
import type { PlacedMachine } from './placement.ts';
import type {
  TutorialEvent,
  TutorialScenario,
  TutorialStep,
} from './tutorial.ts';
import {
  createInitialTutorialState,
  createTutorialScenario,
  createTutorialView,
  reduceTutorial,
} from './tutorial.ts';

const scenario: TutorialScenario = {
  stageOne: {
    targetFoodId: 'toast',
    targetFoodName: 'トースト',
    ingredientFoodId: 'bread',
    ingredientFoodName: '食パン',
    processorMachineId: 'heater',
    processorMachineName: '加熱機',
  },
  stageTwo: {
    targetFoodId: 'fried-egg',
    targetFoodName: '目玉焼き',
    ingredientFoodId: 'egg',
    ingredientFoodName: '卵',
    processorMachineId: 'heater',
    processorMachineName: '加熱機',
  },
};

const storage: PlacedMachine = {
  id: 'storage-1',
  machineId: 'storage',
  foodId: 'bread',
  position: { x: 0, z: 0 },
};
const shipping: PlacedMachine = {
  id: 'shipping-1',
  machineId: 'shipping',
  foodId: 'toast',
  position: { x: 2, z: 0 },
};
const processor: PlacedMachine = {
  id: 'processor-1',
  machineId: 'heater',
  position: { x: 1, z: 0 },
};

const events: readonly TutorialEvent[] = [
  {
    type: 'tool-selected',
    tool: { kind: 'place-machine', machineId: 'storage', foodId: 'bread' },
  },
  { type: 'machine-placed', machine: storage },
  {
    type: 'tool-selected',
    tool: { kind: 'place-machine', machineId: 'shipping', foodId: 'toast' },
  },
  { type: 'machine-placed', machine: shipping },
  {
    type: 'tool-selected',
    tool: { kind: 'place-machine', machineId: 'heater' },
  },
  { type: 'machine-placed', machine: processor },
  { type: 'tool-selected', tool: { kind: 'connect' } },
  { type: 'connection-source-selected', machineId: storage.id },
  {
    type: 'connection-created',
    connectionId: 'connection-1',
    fromMachineId: storage.id,
    toMachineId: processor.id,
  },
  { type: 'connection-source-selected', machineId: processor.id },
  {
    type: 'connection-created',
    connectionId: 'connection-2',
    fromMachineId: processor.id,
    toMachineId: shipping.id,
  },
  { type: 'stage-cleared', stageNumber: 1 },
  {
    type: 'machine-placed',
    machine: { ...processor, id: 'stage-two-processor' },
  },
  {
    type: 'machine-selected',
    machine: { ...processor, id: 'stage-two-processor' },
  },
  {
    type: 'recipe-selected',
    machineId: 'stage-two-processor',
    recipeId: 'fried-egg',
  },
];

describe('tutorial', () => {
  it('advances through all sixteen steps with successful tutorial actions', () => {
    const steps = [createInitialTutorialState().step];
    const finalState = events.reduce((state, event) => {
      const next = reduceTutorial(state, event, scenario);
      steps.push(next.step);
      return next;
    }, createInitialTutorialState());

    expect(steps).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    expect(finalState.stageOneStorageMachineId).toBe(storage.id);
    expect(finalState.stageOneProcessorMachineId).toBe(processor.id);
    expect(finalState.stageOneShippingMachineId).toBe(shipping.id);
  });

  it('does not advance for an incorrect action', () => {
    const initial = createInitialTutorialState();
    const next = reduceTutorial(
      initial,
      {
        type: 'tool-selected',
        tool: { kind: 'place-machine', machineId: 'storage', foodId: 'rice' },
      },
      scenario,
    );

    expect(next).toBe(initial);
  });

  it('hides the stage two recipe arrow after the goal icon is opened', () => {
    const state = {
      ...createInitialTutorialState(),
      step: 13 as const,
    };
    const next = reduceTutorial(
      state,
      {
        type: 'goal-recipe-opened',
        stageNumber: 2,
        foodId: 'fried-egg',
      },
      scenario,
    );

    expect(next.step).toBe(13);
    expect(next.isStageTwoRecipeArrowDismissed).toBe(true);
    expect(
      createTutorialView(next, scenario, 'クリック', { kind: 'select' })
        ?.arrowTarget,
    ).toBeNull();
  });

  it('keeps tracking while hidden and can be enabled again', () => {
    const hidden = reduceTutorial(
      createInitialTutorialState(),
      { type: 'toggle' },
      scenario,
    );
    const advanced = reduceTutorial(hidden, events[0]!, scenario);

    expect(advanced).toMatchObject({ step: 2, isEnabled: false });
    expect(
      createTutorialView(advanced, scenario, 'クリック', { kind: 'select' }),
    ).toBeNull();
    expect(
      reduceTutorial(advanced, { type: 'toggle' }, scenario).isEnabled,
    ).toBe(true);
  });

  it('moves to the final message and disables itself when stage two clears', () => {
    const next = reduceTutorial(
      createInitialTutorialState(),
      { type: 'stage-cleared', stageNumber: 2 },
      scenario,
    );

    expect(next).toMatchObject({ step: 16, isEnabled: false });
    const enabled = reduceTutorial(next, { type: 'toggle' }, scenario);
    expect(
      createTutorialView(enabled, scenario, 'タップ', { kind: 'select' })
        ?.lines[0],
    ).toEqual([
      {
        type: 'text',
        value:
          '以上でチュートリアルは終わりです。 厨房の限界に挑戦してみてください！',
      },
    ]);
  });

  it('creates dynamic stage scenarios from stage goals', () => {
    expect(
      createTutorialScenario(
        {
          stageNumber: 1,
          targetFoodId: 'toast',
          targetFoodName: 'トースト',
          difficulty: 1,
          requiredEfficiency: 5,
        },
        {
          stageNumber: 2,
          targetFoodId: 'fried-egg',
          targetFoodName: '目玉焼き',
          difficulty: 1,
          requiredEfficiency: 5,
        },
      ),
    ).toEqual(scenario);
  });

  it('uses platform wording and hides the select arrow in select mode', () => {
    const placement = createTutorialView(
      { ...createInitialTutorialState(), step: 2 },
      scenario,
      'タップ',
      { kind: 'select' },
    );
    const selectMode = createTutorialView(
      { ...createInitialTutorialState(), step: 14 },
      scenario,
      'クリック',
      { kind: 'select' },
    );

    expect(placement?.lines[1]).toEqual([
      { type: 'text', value: 'タップで配置できます。' },
    ]);
    expect(selectMode?.arrowTarget).toBeNull();
  });

  it('preserves every message line, variable, and button icon', () => {
    const state = {
      ...createInitialTutorialState(),
      stageOneStorageMachineId: storage.id,
      stageOneShippingMachineId: shipping.id,
      stageOneProcessorMachineId: processor.id,
      selectedProcessorMachineId: processor.id,
    };
    const messages = Array.from({ length: 16 }, (_, index) => {
      const view = createTutorialView(
        { ...state, step: (index + 1) as TutorialStep },
        scenario,
        'クリック',
        { kind: 'connect' },
      );

      return view?.lines
        .map((line) =>
          line
            .map((token) =>
              token.type === 'text' ? token.value : `[${token.icon}]`,
            )
            .join(''),
        )
        .join('\n');
    });

    expect(messages).toEqual([
      'cookers! へようこそ！\nまずは食材を倉庫から出しましょう。\n(チュートリアルは [beginner] ボタンで非表示にできます)',
      '食パンの倉庫をエリアのどこかに配置してみましょう！\nクリックで配置できます。',
      '食パンをトーストに加工するラインを作る必要があります。\nトーストの出荷口をどこかに配置してください。',
      'トーストの出荷口をエリアのどこかに配置してみましょう！\nクリックで配置できます。',
      '加工ラインには調理器具が欠かせません。\n加熱機も置いてみましょう！',
      '加熱機をエリアのどこかに配置してみましょう！\nクリックで配置できます。',
      '配置した設備をつなげて、加工ラインを完成させましょう！\n[connect] ボタンをクリックしてください。',
      'ベルトコンベアモードに切り替わりました！\n配置した倉庫と加熱機を順番にクリックすると接続できます。',
      'ベルトコンベアモードに切り替わりました！\n配置した倉庫と加熱機を順番にクリックすると接続できます。',
      '続けて、加熱機と出荷口も接続してください！',
      '続けて、加熱機と出荷口も接続してください！',
      '加工が始まりました！出荷されるまでしばらく待ってみましょう...\n([fast-forward] ボタンをクリックすると倍速にできますよ！)',
      'おみごとです！次のステージの目標に挑戦してみましょう。\nレシピが分からなくなったら、ステージ目標をクリックしてレシピを確認できます。',
      'ラインが複雑になってきましたね！\n[select] ボタンで選択モードにして、今置いた加工機を選択してみましょう。',
      '加工する料理を指定できます。\n他の料理を間違えて作りたくないときに役立ちますよ！ 今回は\u3000目玉焼きを指定すればよさそうです。',
      '以上でチュートリアルは終わりです。 厨房の限界に挑戦してみてください！\n(チュートリアルをもう一度見たい場合は、ゲームをもう一度起動してください)',
    ]);
  });
});
