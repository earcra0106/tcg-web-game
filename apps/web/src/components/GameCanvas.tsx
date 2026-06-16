import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { FoodModel } from './FoodModel.tsx';
import type { FoodModelData } from '../game/food.ts';

export function GameCanvas({ model }: { model: FoodModelData }) {
  return (
    <div className="game-canvas" aria-label="3D game viewport">
      <Canvas camera={{ position: [2.8, 2.2, 3.2], fov: 38 }}>
        <color attach="background" args={['#F4EAE1']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <group position={[0, 0.02, 0]}>
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[2.6, 0.08, 1.8]} />
            <meshStandardMaterial color="#FFFDF9" roughness={0.82} />
          </mesh>
          <group position={[0, model.pivot[1], 0]}>
            <FoodModel model={model} scale={1.35} />
          </group>
        </group>
        <gridHelper
          args={[8, 8, '#EEDCC8', '#EEDCC8']}
          position={[0, -0.05, 0]}
        />
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={6}
          target={[0, 0.55, 0]}
        />
      </Canvas>
    </div>
  );
}
