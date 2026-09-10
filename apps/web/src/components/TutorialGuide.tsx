import { FastForward, MousePointer2, MoveUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type {
  TutorialIconId,
  TutorialMessageToken,
  TutorialView,
} from '../game/tutorial.ts';

const TUTORIAL_ANCHOR_SELECTOR = '[data-tutorial-anchor="active"]';

function TutorialIcon({ icon }: { icon: TutorialIconId }) {
  switch (icon) {
    case 'beginner':
      return (
        <span className="tutorial-guide__beginner-icon" aria-hidden="true">
          🔰
        </span>
      );
    case 'connect':
      return <MoveUpRight aria-hidden="true" size={18} />;
    case 'select':
      return <MousePointer2 aria-hidden="true" size={18} />;
    case 'fast-forward':
      return <FastForward aria-hidden="true" size={18} />;
  }
}

function MessageToken({ token }: { token: TutorialMessageToken }) {
  return token.type === 'text' ? (
    token.value
  ) : (
    <span className="tutorial-guide__inline-icon">
      <TutorialIcon icon={token.icon} />
    </span>
  );
}

function TutorialArrow({ view }: { view: TutorialView }) {
  const arrowRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const arrow = arrowRef.current;

    if (arrow === null || view.arrowTarget === null) {
      return;
    }

    let animationFrameId = 0;
    let scrollTarget: Element | null = null;

    const update = () => {
      const target = document.querySelector<HTMLElement>(
        TUTORIAL_ANCHOR_SELECTOR,
      );

      if (target === null) {
        arrow.style.visibility = 'hidden';
      } else {
        if (
          target.dataset.tutorialScroll === 'true' &&
          scrollTarget !== target
        ) {
          target.scrollIntoView({ block: 'nearest', inline: 'center' });
          scrollTarget = target;
        }

        const rect = target.getBoundingClientRect();
        arrow.style.left = `${rect.left}px`;
        arrow.style.top = `${rect.bottom}px`;
        arrow.style.visibility = 'visible';
      }

      animationFrameId = window.requestAnimationFrame(update);
    };

    update();

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [view.arrowTarget]);

  if (view.arrowTarget === null) {
    return null;
  }

  return (
    <img
      ref={arrowRef}
      className="tutorial-guide__arrow"
      src="/assets/sprites/arrow.png"
      alt=""
      aria-hidden="true"
    />
  );
}

export function TutorialGuide({ view }: { view: TutorialView | null }) {
  if (view === null) {
    return null;
  }

  return (
    <>
      <aside
        className="tutorial-guide__bubble"
        role="status"
        aria-live="polite"
        data-tutorial-step={view.step}
      >
        {view.lines.map((line, lineIndex) => (
          <p key={lineIndex}>
            {line.map((token, tokenIndex) => (
              <MessageToken key={tokenIndex} token={token} />
            ))}
          </p>
        ))}
      </aside>
      <TutorialArrow view={view} />
    </>
  );
}
