export type DirectionKey = 'forward' | 'backward' | 'left' | 'right';

export type InputState = Record<DirectionKey, boolean>;

const keyMap: Readonly<Record<string, DirectionKey>> = {
  ArrowUp: 'forward',
  KeyW: 'forward',
  ArrowDown: 'backward',
  KeyS: 'backward',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

export function createInitialInputState(): InputState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };
}

export function directionForCode(code: string): DirectionKey | null {
  return keyMap[code] ?? null;
}

export function updateInputState(
  state: InputState,
  code: string,
  isPressed: boolean,
): InputState {
  const direction = directionForCode(code);

  if (!direction) {
    return state;
  }

  return {
    ...state,
    [direction]: isPressed,
  };
}

export function getMovementVector(state: InputState) {
  const x = Number(state.right) - Number(state.left);
  const z = Number(state.backward) - Number(state.forward);

  return { x, z };
}
