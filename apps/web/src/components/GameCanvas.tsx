import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export function GameCanvas() {
  return (
    <div className="game-canvas" aria-label="Game viewport">
      <Canvas camera={{ position: [2.8, 2.2, 3.2], fov: 38 }}>
        <color attach="background" args={['#F4EAE1']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
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
