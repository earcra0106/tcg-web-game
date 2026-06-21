import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { MOUSE, TOUCH } from 'three';
import type { EditorModel } from '../game/editorActions.ts';
import { GameScene } from './GameScene.tsx';

type GameCanvasProps = {
  model: EditorModel;
  onModelChange: (updater: (model: EditorModel) => EditorModel) => void;
};

export function GameCanvas({ model, onModelChange }: GameCanvasProps) {
  return (
    <div className="game-canvas" aria-label="Game viewport">
      <Canvas camera={{ position: [4.5, 5.2, 5.8], fov: 42 }}>
        <color attach="background" args={['#F4EAE1']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <GameScene model={model} onModelChange={onModelChange} />
        <OrbitControls
          enablePan
          minDistance={2.2}
          maxDistance={10}
          target={[0, 0, 0]}
          mouseButtons={{
            LEFT: undefined,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.ROTATE,
          }}
          touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE }}
        />
      </Canvas>
    </div>
  );
}
