import { describe, expect, it } from 'vitest';
import { machineInfos, type MachineInfoData } from './machine.ts';
import {
  getMachineSpriteFrame,
  machineSpriteFrames,
} from './machineSprites.ts';

const expectedMachines = [
  ['splitter', '分岐器', 0, 0],
  ['merger', '合流機', 0, 1],
  ['cutter', '切断機', 0, 2],
  ['heater', '加熱機', 0, 3],
  ['mixer', 'ミキサー', 1, 0],
  ['combiner', '合体機', 1, 1],
  ['trash-bin', 'ゴミ箱', 1, 2],
] as const;

describe('machine sprites', () => {
  it('describes machine info data', () => {
    const cutter: MachineInfoData = {
      id: 'cutter',
      name: '切断機',
    };

    expect(cutter).toMatchObject({
      id: 'cutter',
      name: '切断機',
    });
  });

  it('registers machines in spritesheet order', () => {
    expect(machineInfos.map((machine) => machine.id)).toEqual(
      expectedMachines.map(([id]) => id),
    );
  });

  it('matches machine names', () => {
    expectedMachines.forEach(([id, name]) => {
      expect(machineInfos.find((machine) => machine.id === id)).toMatchObject({
        id,
        name,
      });
    });
  });

  it('assigns 256px cells to all registered machines', () => {
    expectedMachines.forEach(([id, , row, column], index) => {
      expect(getMachineSpriteFrame(id)).toMatchObject({
        id,
        index,
        row,
        column,
        x: column * 256,
        y: row * 256,
        width: 256,
        height: 256,
      });
    });
  });

  it('does not register the empty final cell', () => {
    expect(machineSpriteFrames).toHaveLength(7);
    expect(machineSpriteFrames).not.toContainEqual(
      expect.objectContaining({ row: 1, column: 3 }),
    );
  });
});
