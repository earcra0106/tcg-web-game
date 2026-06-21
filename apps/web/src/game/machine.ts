export type MachineId =
  | 'splitter'
  | 'merger'
  | 'cutter'
  | 'heater'
  | 'mixer'
  | 'combiner'
  | 'trash-bin';

export type MachineInfoData = {
  id: MachineId;
  name: string;
};

export const machineInfos = [
  { id: 'splitter', name: '分岐器' },
  { id: 'merger', name: '合流機' },
  { id: 'cutter', name: '切断機' },
  { id: 'heater', name: '加熱機' },
  { id: 'mixer', name: 'ミキサー' },
  { id: 'combiner', name: '合体機' },
  { id: 'trash-bin', name: 'ゴミ箱' },
] satisfies readonly MachineInfoData[];

export function getMachineInfo(id: MachineId) {
  return machineInfos.find((machine) => machine.id === id) ?? null;
}
