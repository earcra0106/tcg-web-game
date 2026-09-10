import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TutorialView } from '../game/tutorial.ts';
import { TutorialGuide } from './TutorialGuide.tsx';

const view: TutorialView = {
  step: 7,
  lines: [
    [{ type: 'text', value: 'ラインを完成させましょう！' }],
    [
      { type: 'icon', icon: 'connect' },
      { type: 'text', value: ' ボタンをクリックしてください。' },
    ],
  ],
  arrowTarget: { kind: 'mode', tool: 'connect' },
};

describe('TutorialGuide', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders message lines and inline button icons', () => {
    render(<TutorialGuide view={{ ...view, arrowTarget: null }} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-tutorial-step', '7');
    expect(status.querySelectorAll('p')).toHaveLength(2);
    expect(status.querySelector('svg')).toBeInTheDocument();
  });

  it('renders nothing while the tutorial view is hidden', () => {
    const { container } = render(<TutorialGuide view={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('positions the arrow from the active target', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const target = document.createElement('button');
    target.dataset.tutorialAnchor = 'active';
    target.getBoundingClientRect = () => ({ right: 70, bottom: 80 }) as DOMRect;
    document.body.append(target);

    const { container } = render(<TutorialGuide view={view} />);

    const arrow = container.querySelector<HTMLImageElement>(
      '.tutorial-guide__arrow',
    );
    expect(arrow?.style.left).toBe('70px');
    expect(arrow?.style.top).toBe('80px');
    expect(arrow?.style.visibility).toBe('visible');

    target.remove();
  });
});
