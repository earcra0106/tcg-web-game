import type { ThreeEvent } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { createConveyorRenderModel } from '../game/conveyorRender.ts';
import type { MachineConnection } from '../game/connections.ts';
import type { PlacedMachine } from '../game/placement.ts';

type ConveyorObjectProps = {
  connection: MachineConnection;
  fromMachine: PlacedMachine;
  toMachine: PlacedMachine;
  onClick: (connectionId: string, event: ThreeEvent<PointerEvent>) => void;
};

function createTriangleGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.13, 0);
  shape.lineTo(-0.1, 0.1);
  shape.lineTo(-0.1, -0.1);
  shape.lineTo(0.13, 0);

  return new THREE.ShapeGeometry(shape);
}

export function ConveyorObject({
  connection,
  fromMachine,
  toMachine,
  onClick,
}: ConveyorObjectProps) {
  const [nowMs, setNowMs] = useState(0);
  const triangleGeometry = useMemo(() => createTriangleGeometry(), []);
  const model = createConveyorRenderModel({
    from: fromMachine.position,
    to: toMachine.position,
    nowMs,
  });

  useFrame(() => {
    setNowMs(performance.now());
  });

  return (
    <group
      onPointerDown={(event) => {
        event.stopPropagation();
        onClick(connection.id, event);
      }}
    >
      <mesh
        position={[model.midpoint.x, model.midpoint.y, model.midpoint.z]}
        rotation={[0, model.angleRad, 0]}
        renderOrder={1}
      >
        <boxGeometry args={model.glowScale} />
        <meshBasicMaterial
          color="#ff9f2e"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      {model.triangleMarkers.map((marker, index) => (
        <mesh
          key={`${connection.id}-${index}`}
          geometry={triangleGeometry}
          position={[marker.position.x, marker.position.y, marker.position.z]}
          rotation={[-Math.PI / 2, marker.angleRad, 0]}
          renderOrder={5}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.5}
            depthTest={false}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
