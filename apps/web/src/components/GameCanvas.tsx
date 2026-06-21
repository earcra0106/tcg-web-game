import { OrbitControls } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { MOUSE, TOUCH, TextureLoader } from 'three';
import type { EditorModel } from '../game/editorActions.ts';
import type { EditorTool } from '../game/editorState.ts';
import { FOOD_SPRITESHEET_URL } from '../game/foodSprites.ts';
import { MACHINE_SPRITESHEET_URL } from '../game/machineSprites.ts';
import { GameScene } from './GameScene.tsx';

type PlaceMachineTool = Extract<EditorTool, { kind: 'place-machine' }>;

type GameCanvasProps = {
  model: EditorModel;
  dragPlacementTool: PlaceMachineTool | null;
  isDraggingPlacement: boolean;
  onModelChange: (updater: (model: EditorModel) => EditorModel) => void;
  onPlacementDrop: () => void;
};

useLoader.preload(TextureLoader, MACHINE_SPRITESHEET_URL);
useLoader.preload(TextureLoader, FOOD_SPRITESHEET_URL);

export function GameCanvas({
  model,
  dragPlacementTool,
  isDraggingPlacement,
  onModelChange,
  onPlacementDrop,
}: GameCanvasProps) {
  return (
    <div className="game-canvas" aria-label="Game viewport">
      <Canvas camera={{ position: [0, 5.2, 6.2], fov: 42 }}>
        <color attach="background" args={['#F4EAE1']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <GameScene
          model={model}
          dragPlacementTool={dragPlacementTool}
          isDraggingPlacement={isDraggingPlacement}
          onModelChange={onModelChange}
          onPlacementDrop={onPlacementDrop}
        />
        <OrbitControls
          enablePan
          enableRotate={false}
          minDistance={2.2}
          maxDistance={10}
          target={[0, 0, 0]}
          mouseButtons={{
            LEFT: undefined,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN,
          }}
          touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
        />
      </Canvas>
    </div>
  );
}
