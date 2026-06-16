import { GameCanvas } from './components/GameCanvas.tsx';

export function App() {
  return (
    <main className="app-shell">
      <GameCanvas />
      <section className="hud" aria-label="Game status">
        <p className="hud__label">Three Game Template</p>
        <dl className="hud__stats">
          <div>
            <dt>Move</dt>
            <dd>WASD / Arrow</dd>
          </div>
          <div>
            <dt>Look</dt>
            <dd>Pointer</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
