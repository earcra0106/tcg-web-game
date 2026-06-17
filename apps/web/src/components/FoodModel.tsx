import { RoundedBox } from '@react-three/drei';
import type { FoodModelData, FoodModelPart } from '../game/food.ts';

type FoodModelProps = {
  model: FoodModelData;
  scale?: number;
};

export function FoodModel({ model, scale = 1 }: FoodModelProps) {
  return (
    <group scale={scale * model.unitScale}>
      <group position={[-model.pivot[0], -model.pivot[1], -model.pivot[2]]}>
        {model.parts.map((part) => (
          <FoodModelPartMesh key={part.id} part={part} />
        ))}
      </group>
    </group>
  );
}

function FoodModelPartMesh({ part }: { part: FoodModelPart }) {
  const material = (
    <meshStandardMaterial
      color={part.color}
      roughness={part.material?.roughness ?? 0.85}
      metalness={part.material?.metalness ?? 0}
      transparent={part.material?.opacity !== undefined}
      opacity={part.material?.opacity ?? 1}
      flatShading={part.appearance?.flatShading ?? false}
    />
  );

  if (part.shape === 'roundedBox') {
    return (
      <RoundedBox
        args={[...part.size]}
        position={[...part.position]}
        rotation={[...part.rotation]}
        radius={part.appearance?.radius ?? 0.08}
        smoothness={part.appearance?.segments ?? 4}
      >
        {material}
      </RoundedBox>
    );
  }

  return (
    <mesh
      position={[...part.position]}
      rotation={[...part.rotation]}
      scale={[...part.size]}
    >
      <PrimitiveGeometry part={part} />
      {material}
    </mesh>
  );
}

function PrimitiveGeometry({ part }: { part: FoodModelPart }) {
  const segments = part.appearance?.segments ?? 8;

  switch (part.shape) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'cylinder':
      return <cylinderGeometry args={[0.5, 0.5, 1, segments]} />;
    case 'cone':
      return <coneGeometry args={[0.5, 1, segments]} />;
    case 'hemisphere':
      return (
        <sphereGeometry
          args={[
            0.5,
            segments,
            Math.max(4, segments / 2),
            0,
            Math.PI * 2,
            0,
            Math.PI / 2,
          ]}
        />
      );
    case 'sphere':
      return <sphereGeometry args={[0.5, segments, segments]} />;
    case 'capsule':
      return <capsuleGeometry args={[0.5, 1, 4, segments]} />;
    case 'wedge':
      return <coneGeometry args={[0.6, 1, 3]} />;
    case 'fanWedge':
      return <cylinderGeometry args={[0.5, 0.5, 1, 6]} />;
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}
