import type { ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { GameSoundId } from '../game/audio.ts';
import {
  handleConnectionClick,
  handleGridClick,
  handleMachineClick,
  type EditorModel,
} from '../game/editorActions.ts';
import type { ConnectionId } from '../game/connections.ts';
import type { EditorTool } from '../game/editorState.ts';
import type { GridPosition } from '../game/grid.ts';
import { findMachineById, type PlacementId } from '../game/placement.ts';
import type { RenderView } from '../game/renderView.ts';
import { ConveyorObject } from './ConveyorObject.tsx';
import { FoodItemObject } from './FoodItemObject.tsx';
import { MachineObject } from './MachineObject.tsx';

const CLICK_MOVE_THRESHOLD_PX = 6;
const PLACEMENT_PREVIEW_ID = '__placement-preview__';

type PlaceMachineTool = Extract<EditorTool, { kind: 'place-machine' }>;
type PressTarget =
  | { kind: 'grid' }
  | { kind: 'machine'; machineId: PlacementId }
  | { kind: 'connection'; connectionId: ConnectionId };

type PressState = {
  pointerId: number;
  target: PressTarget;
  startClientX: number;
  startClientY: number;
  isClickCandidate: boolean;
};

type GameSceneProps = {
  model: EditorModel;
  renderView: RenderView;
  dragPlacementTool: PlaceMachineTool | null;
  isDraggingPlacement: boolean;
  onModelChange: (updater: (model: EditorModel) => EditorModel) => void;
  onPlacementDrop: () => void;
  onPlaySound: (soundId: GameSoundId) => void;
};

function toGridPosition(event: ThreeEvent<PointerEvent>) {
  return {
    x: Math.round(event.point.x),
    z: Math.round(event.point.z),
  };
}

function isPrimaryActionPointer(event: ThreeEvent<PointerEvent>) {
  if (event.pointerType === 'mouse') {
    return event.button === 0;
  }

  return event.isPrimary;
}

function isSameTarget(first: PressTarget, second: PressTarget) {
  if (first.kind !== second.kind) {
    return false;
  }

  switch (first.kind) {
    case 'grid':
      return true;
    case 'machine':
      return second.kind === 'machine' && first.machineId === second.machineId;
    case 'connection':
      return (
        second.kind === 'connection' &&
        first.connectionId === second.connectionId
      );
  }
}

export function GameScene({
  model,
  renderView,
  dragPlacementTool,
  isDraggingPlacement,
  onModelChange,
  onPlacementDrop,
  onPlaySound,
}: GameSceneProps) {
  const activePointerIdsRef = useRef(new Set<number>());
  const pressStateRef = useRef<PressState | null>(null);
  const [previewPosition, setPreviewPosition] = useState<GridPosition | null>(
    null,
  );
  const selectedMachineId = model.gameState.selection.selectedMachineId;
  const connectionSourceMachineId =
    model.editorState.connectionSourceMachineId ??
    model.editorState.dragConnectionSourceMachineId;
  const previewMachine =
    dragPlacementTool !== null &&
    isDraggingPlacement &&
    previewPosition !== null
      ? {
          id: PLACEMENT_PREVIEW_ID,
          machineId: dragPlacementTool.machineId,
          position: previewPosition,
          foodId: dragPlacementTool.foodId,
        }
      : null;

  const updateModelWithSound = (
    updater: (current: EditorModel) => EditorModel,
    getSound: (current: EditorModel, next: EditorModel) => GameSoundId | null,
  ) => {
    const next = updater(model);
    const sound = getSound(model, next);

    if (sound !== null) {
      onPlaySound(sound);
    }

    onModelChange(() => next);
  };

  const beginPress = (event: ThreeEvent<PointerEvent>, target: PressTarget) => {
    activePointerIdsRef.current.add(event.pointerId);

    if (!isPrimaryActionPointer(event)) {
      pressStateRef.current = null;
      return;
    }

    if (activePointerIdsRef.current.size > 1) {
      pressStateRef.current = null;
      return;
    }

    pressStateRef.current = {
      pointerId: event.pointerId,
      target,
      startClientX: event.clientX,
      startClientY: event.clientY,
      isClickCandidate: true,
    };
  };

  const updatePress = (event: ThreeEvent<PointerEvent>) => {
    const pressState = pressStateRef.current;

    if (pressState === null || pressState.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - pressState.startClientX;
    const dy = event.clientY - pressState.startClientY;

    if (dx * dx + dy * dy > CLICK_MOVE_THRESHOLD_PX * CLICK_MOVE_THRESHOLD_PX) {
      pressState.isClickCandidate = false;
    }
  };

  const finishPress = (
    event: ThreeEvent<PointerEvent>,
    target: PressTarget,
  ) => {
    activePointerIdsRef.current.delete(event.pointerId);

    const pressState = pressStateRef.current;
    pressStateRef.current = null;

    return (
      pressState !== null &&
      pressState.pointerId === event.pointerId &&
      pressState.isClickCandidate &&
      isSameTarget(pressState.target, target)
    );
  };

  const cancelPress = (event: ThreeEvent<PointerEvent>) => {
    activePointerIdsRef.current.delete(event.pointerId);
    pressStateRef.current = null;
  };

  return (
    <group
      onPointerMove={(event) => {
        updatePress(event);
      }}
      onPointerCancel={cancelPress}
    >
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          beginPress(event, { kind: 'grid' });
        }}
        onPointerMove={(event) => {
          if (isDraggingPlacement) {
            setPreviewPosition(toGridPosition(event));
          }
          updatePress(event);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();

          if (dragPlacementTool !== null && isDraggingPlacement) {
            updateModelWithSound(
              (current) =>
                handleGridClick(
                  {
                    ...current,
                    editorState: {
                      ...current.editorState,
                      selectedTool: dragPlacementTool,
                      connectionSourceMachineId: null,
                      dragConnectionSourceMachineId: null,
                    },
                  },
                  toGridPosition(event),
                ),
              (current, next) =>
                next.gameState.machines.length >
                current.gameState.machines.length
                  ? 'confirm'
                  : 'reject',
            );
            onPlacementDrop();
            return;
          }

          if (!finishPress(event, { kind: 'grid' })) {
            return;
          }

          updateModelWithSound(
            (current) => handleGridClick(current, toGridPosition(event)),
            (current, next) =>
              current.gameState.selection.selectedMachineId !==
              next.gameState.selection.selectedMachineId
                ? 'select'
                : null,
          );
        }}
        onPointerLeave={() => {
          if (isDraggingPlacement) {
            setPreviewPosition(null);
          }
        }}
      >
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#fff8ef" />
      </mesh>
      <gridHelper args={[14, 14, '#e6c8a8', '#f0dcc4']} position={[0, 0, 0]} />
      {renderView.connections.map((connection) => {
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
            onPointerDown={(connectionId, event) => {
              beginPress(event, { kind: 'connection', connectionId });
            }}
            onPointerUp={(connectionId, event) => {
              if (
                !finishPress(event, {
                  kind: 'connection',
                  connectionId,
                })
              ) {
                return;
              }

              updateModelWithSound(
                (current) => handleConnectionClick(current, connectionId),
                (current, next) =>
                  next.gameState.connections.length <
                  current.gameState.connections.length
                    ? 'cancel'
                    : null,
              );
            }}
          />
        );
      })}
      {renderView.items.map((item) => (
        <FoodItemObject
          key={item.id}
          spriteId={item.spriteId}
          position={item.position}
        />
      ))}
      {renderView.machines.map((machineView) => (
        <MachineObject
          key={machineView.machine.id}
          machine={machineView.machine}
          isSelected={selectedMachineId === machineView.machine.id}
          isConnectionSource={
            connectionSourceMachineId === machineView.machine.id
          }
          isProcessing={machineView.isProcessing}
          hasOutput={machineView.hasOutput}
          heldItems={machineView.heldItems}
          showHeldItems={
            model.editorState.selectedTool.kind === 'select' &&
            selectedMachineId === machineView.machine.id
          }
          onPointerDown={(machineId, event) => {
            beginPress(event, { kind: 'machine', machineId });
          }}
          onPointerUp={(machineId, event) => {
            if (
              !finishPress(event, {
                kind: 'machine',
                machineId,
              })
            ) {
              return;
            }

            updateModelWithSound(
              (current) => handleMachineClick(current, machineId),
              (current, next) => {
                if (
                  next.gameState.machines.length <
                  current.gameState.machines.length
                ) {
                  return 'cancel';
                }

                if (
                  next.gameState.connections.length >
                  current.gameState.connections.length
                ) {
                  return 'confirm';
                }

                if (
                  current.editorState.selectedTool.kind === 'connect' &&
                  current.editorState.connectionSourceMachineId !== null
                ) {
                  return 'reject';
                }

                return current.gameState.selection.selectedMachineId !==
                  next.gameState.selection.selectedMachineId
                  ? 'select'
                  : null;
              },
            );
          }}
        />
      ))}
      {previewMachine !== null ? (
        <MachineObject
          machine={previewMachine}
          isSelected={false}
          isConnectionSource={false}
          opacity={0.45}
          isInteractive={false}
          onPointerDown={() => undefined}
          onPointerUp={() => undefined}
        />
      ) : null}
      {renderView.hud.isCleared ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
          <ringGeometry args={[1.15, 1.24, 96]} />
          <meshBasicMaterial color="#50b86b" transparent opacity={0.42} />
        </mesh>
      ) : null}
    </group>
  );
}
