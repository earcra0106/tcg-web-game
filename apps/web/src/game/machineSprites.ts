import type { MachineId } from './machine.ts';

export const MACHINE_SPRITESHEET_URL = '/assets/sprites/machines.png';
export const MACHINE_SPRITESHEET_WIDTH = 1024;
export const MACHINE_SPRITESHEET_HEIGHT = 512;
export const MACHINE_SPRITE_SIZE = 256;
export const MACHINE_SPRITE_DISPLAY_SIZE = 72;
export const MACHINE_SPRITESHEET_COLUMNS =
  MACHINE_SPRITESHEET_WIDTH / MACHINE_SPRITE_SIZE;

export type MachineSpriteFrame = {
  id: MachineId;
  key: `${string}.png`;
  index: number;
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

const machineSpriteIds = [
  'splitter',
  'merger',
  'cutter',
  'heater',
  'mixer',
  'combiner',
  'trash-bin',
] as const satisfies readonly MachineId[];

export const machineSpriteFrames = machineSpriteIds.map((machineId, index) => {
  const column = index % MACHINE_SPRITESHEET_COLUMNS;
  const row = Math.floor(index / MACHINE_SPRITESHEET_COLUMNS);

  return {
    id: machineId,
    key: `${machineId}.png`,
    index,
    column,
    row,
    x: column * MACHINE_SPRITE_SIZE,
    y: row * MACHINE_SPRITE_SIZE,
    width: MACHINE_SPRITE_SIZE,
    height: MACHINE_SPRITE_SIZE,
  };
}) satisfies readonly MachineSpriteFrame[];

export function getMachineSpriteFrame(machineId: MachineId) {
  return machineSpriteFrames.find((sprite) => sprite.id === machineId) ?? null;
}
