import type { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import {
  finishConnectionDrag,
  handleConnectionClick,
  handleGridClick,
  handleMachineClick,
  startConnectionDrag,
  type EditorModel,
} from '../game/editorActions.ts';
import { findMachineById, type PlacementId } from '../game/placement.ts';
import { ConveyorObject } from './ConveyorObject.tsx';
import { MachineObject } from './MachineObject.tsx';

type GameSceneProps = {
  model: EditorModel;
  onModelChange: (updater: (model: EditorModel) => EditorModel) => void;
};

function toGridPosition(event: ThreeEvent<PointerEvent>) {
  return {
    x: Math.round(event.point.x),
    z: Math.round(event.point.z),
  };
}

export function GameScene({ model, onModelChange }: GameSceneProps) {
  const pressedMachineIdRef = useRef<PlacementId | null>(null);
  const selectedMachineId = model.gameState.selection.selectedMachineId;
  const connectionSourceMachineId =
    model.editorState.connectionSourceMachineId ??
    model.editorState.dragConnectionSourceMachineId;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerUp={(event) => {
          event.stopPropagation();
          pressedMachineIdRef.current = null;
          onModelChange((current) =>
            handleGridClick(current, toGridPosition(event)),
          );
        }}
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#fff8ef" />
      </mesh>
      <gridHelper args={[14, 14, '#e6c8a8', '#f0dcc4']} position={[0, 0, 0]} />
      {model.gameState.connections.map((connection) => {
        const fromMachine = findMachineById(
          model.gameState.machines,
          connection.fromMachineId,
        );
        const toMachine = findMachineById(
          model.gameState.machines,
          connection.toMachineId,
        );

        if (fromMachine === null || toMachine === null) {
          return null;
        }

        return (
          <ConveyorObject
            key={connection.id}
            connection={connection}
            fromMachine={fromMachine}
            toMachine={toMachine}
            onClick={(connectionId) => {
              onModelChange((current) =>
                handleConnectionClick(current, connectionId),
              );
            }}
          />
        );
      })}
      {model.gameState.machines.map((machine) => (
        <MachineObject
          key={machine.id}
          machine={machine}
          isSelected={selectedMachineId === machine.id}
          isConnectionSource={connectionSourceMachineId === machine.id}
          onPointerDown={(machineId) => {
            pressedMachineIdRef.current = machineId;
          }}
          onPointerUp={(machineId) => {
            const pressedMachineId = pressedMachineIdRef.current;
            pressedMachineIdRef.current = null;

            onModelChange((current) => {
              if (
                current.editorState.selectedTool.kind === 'connect' &&
                pressedMachineId !== null &&
                pressedMachineId !== machineId
              ) {
                return finishConnectionDrag(
                  startConnectionDrag(current, pressedMachineId),
                  machineId,
                );
              }

              return handleMachineClick(current, machineId);
            });
          }}
        />
      ))}
    </group>
  );
}
