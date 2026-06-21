import { describe, expect, it } from 'vitest';
import { createInitialEditorState, selectEditorTool } from './editorState.ts';

describe('editor state', () => {
  it('creates the initial editor state', () => {
    expect(createInitialEditorState()).toEqual({
      selectedTool: { kind: 'select' },
      connectionSourceMachineId: null,
      dragConnectionSourceMachineId: null,
      nextMachineIndex: 1,
      nextConnectionIndex: 1,
    });
  });

  it('clears connection state when selecting another tool', () => {
    expect(
      selectEditorTool(
        {
          selectedTool: { kind: 'connect' },
          connectionSourceMachineId: 'machine-1',
          dragConnectionSourceMachineId: 'machine-2',
          nextMachineIndex: 4,
          nextConnectionIndex: 3,
        },
        { kind: 'delete' },
      ),
    ).toEqual({
      selectedTool: { kind: 'delete' },
      connectionSourceMachineId: null,
      dragConnectionSourceMachineId: null,
      nextMachineIndex: 4,
      nextConnectionIndex: 3,
    });
  });
});
