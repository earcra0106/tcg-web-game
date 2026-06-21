import type { CSSProperties } from 'react';
import type { MachineId } from '../game/machine.ts';
import {
  MACHINE_SPRITE_DISPLAY_SIZE,
  MACHINE_SPRITE_SIZE,
  MACHINE_SPRITESHEET_HEIGHT,
  MACHINE_SPRITESHEET_URL,
  MACHINE_SPRITESHEET_WIDTH,
  getMachineSpriteFrame,
} from '../game/machineSprites.ts';

type MachineSpriteProps = {
  machineId: MachineId;
  label: string;
};

export function MachineSprite({ machineId, label }: MachineSpriteProps) {
  const sprite = getMachineSpriteFrame(machineId);

  if (!sprite) {
    return null;
  }

  const displayScale = MACHINE_SPRITE_DISPLAY_SIZE / MACHINE_SPRITE_SIZE;

  return (
    <span
      className="machine-sprite"
      aria-label={label}
      role="img"
      style={
        {
          '--machine-sprite-image': `url("${MACHINE_SPRITESHEET_URL}")`,
          '--machine-sprite-x': `-${sprite.x * displayScale}px`,
          '--machine-sprite-y': `-${sprite.y * displayScale}px`,
          '--machine-sprite-size': `${MACHINE_SPRITE_DISPLAY_SIZE}px`,
          '--machine-sprite-sheet-width': `${
            MACHINE_SPRITESHEET_WIDTH * displayScale
          }px`,
          '--machine-sprite-sheet-height': `${
            MACHINE_SPRITESHEET_HEIGHT * displayScale
          }px`,
        } as CSSProperties
      }
    />
  );
}
