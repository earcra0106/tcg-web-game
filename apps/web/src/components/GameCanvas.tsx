import { useEffect, useRef } from 'react';
import { ThreeGame } from '../game/ThreeGame.ts';

export function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const game = new ThreeGame(host);
    game.start();

    return () => {
      game.dispose();
    };
  }, []);

  return (
    <div ref={hostRef} className="game-canvas" aria-label="3D game viewport" />
  );
}
