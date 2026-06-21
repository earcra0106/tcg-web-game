import { describe, expect, it } from 'vitest';
import {
  createInitialEditorModel,
  finishConnectionDrag,
  handleConnectionClick,
  handleGridClick,
  handleMachineClick,
  setMachineRecipe,
  startConnectionDrag,
} from './editorActions.ts';
import { selectEditorTool } from './editorState.ts';

function withTool(
  model: ReturnType<typeof createInitialEditorModel>,
  selectedTool: Parameters<typeof selectEditorTool>[1],
) {
  return {
    ...model,
    editorState: selectEditorTool(model.editorState, selectedTool),
  };
}

describe('editor actions', () => {
  it('places the selected machine on an empty grid cell', () => {
    const model = withTool(createInitialEditorModel(), {
      kind: 'place-machine',
      machineId: 'storage',
      foodId: 'rice',
    });
    const nextModel = handleGridClick(model, { x: 0, z: 0 });

    expect(nextModel.gameState.machines).toEqual([
      {
        id: 'machine-1',
        machineId: 'storage',
        position: { x: 0, z: 0 },
        foodId: 'rice',
      },
    ]);
    expect(nextModel.machineConfigs['machine-1']).toEqual({
      spawnFoodId: 'rice',
    });
    expect(nextModel.editorState.nextMachineIndex).toBe(2);
  });

  it('keeps state when placement is rejected', () => {
    const model = handleGridClick(
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'cutter',
      }),
      { x: 0, z: 0 },
    );
    const nextModel = handleGridClick(model, { x: 0, z: 0 });

    expect(nextModel).toBe(model);
  });

  it('creates a connection after selecting source and target machines', () => {
    const placedModel = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
    ].reduce(
      (model, position) => handleGridClick(model, position),
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'heater',
      }),
    );
    const connectModel = withTool(placedModel, { kind: 'connect' });
    const sourceSelected = handleMachineClick(connectModel, 'machine-1');
    const nextModel = handleMachineClick(sourceSelected, 'machine-2');

    expect(nextModel.gameState.connections).toEqual([
      {
        id: 'connection-1',
        fromMachineId: 'machine-1',
        toMachineId: 'machine-2',
      },
    ]);
    expect(nextModel.editorState.connectionSourceMachineId).toBeNull();
  });

  it('does not create duplicate connections', () => {
    const placedModel = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
    ].reduce(
      (model, position) => handleGridClick(model, position),
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'heater',
      }),
    );
    const connectModel = withTool(placedModel, { kind: 'connect' });
    const connectedModel = handleMachineClick(
      handleMachineClick(connectModel, 'machine-1'),
      'machine-2',
    );
    const duplicateModel = handleMachineClick(
      handleMachineClick(connectedModel, 'machine-1'),
      'machine-2',
    );

    expect(duplicateModel.gameState.connections).toHaveLength(1);
    expect(duplicateModel.editorState.nextConnectionIndex).toBe(2);
  });

  it('removes a machine and related connections with the delete tool', () => {
    const placedModel = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
    ].reduce(
      (model, position) => handleGridClick(model, position),
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'storage',
        foodId: 'rice',
      }),
    );
    const connectedModel = handleMachineClick(
      handleMachineClick(
        withTool(placedModel, { kind: 'connect' }),
        'machine-1',
      ),
      'machine-2',
    );
    const nextModel = handleMachineClick(
      withTool(connectedModel, { kind: 'delete' }),
      'machine-1',
    );

    expect(nextModel.gameState.machines.map((machine) => machine.id)).toEqual([
      'machine-2',
    ]);
    expect(nextModel.gameState.connections).toEqual([]);
    expect(nextModel.machineConfigs['machine-1']).toBeUndefined();
  });

  it('removes a connection with the delete tool', () => {
    const placedModel = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
    ].reduce(
      (model, position) => handleGridClick(model, position),
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'heater',
      }),
    );
    const connectedModel = handleMachineClick(
      handleMachineClick(
        withTool(placedModel, { kind: 'connect' }),
        'machine-1',
      ),
      'machine-2',
    );
    const nextModel = handleConnectionClick(
      withTool(connectedModel, { kind: 'delete' }),
      'connection-1',
    );

    expect(nextModel.gameState.connections).toEqual([]);
  });

  it('creates a connection from a drag start and end target', () => {
    const placedModel = [
      { x: 0, z: 0 },
      { x: 1, z: 0 },
    ].reduce(
      (model, position) => handleGridClick(model, position),
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'heater',
      }),
    );
    const nextModel = finishConnectionDrag(
      startConnectionDrag(
        withTool(placedModel, { kind: 'connect' }),
        'machine-1',
      ),
      'machine-2',
    );

    expect(nextModel.gameState.connections).toHaveLength(1);
    expect(nextModel.editorState.dragConnectionSourceMachineId).toBeNull();
  });

  it('stores a selected recipe for a placed processor', () => {
    const model = handleGridClick(
      withTool(createInitialEditorModel(), {
        kind: 'place-machine',
        machineId: 'heater',
      }),
      { x: 0, z: 0 },
    );

    expect(
      setMachineRecipe(model, 'machine-1', 'toast').machineConfigs,
    ).toEqual({
      'machine-1': {
        recipeId: 'toast',
      },
    });
  });
});
