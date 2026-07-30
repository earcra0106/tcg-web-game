import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { buildShareText, ShareModal } from './ShareModal.tsx';

const seed = '123e4567-e89b-42d3-a456-426614174000';
const shareText = `ステージ 3 の生産目標を達成！\nシード値: ${seed}\n\nプレイはこちらから\nhttps://cookers-web-game.vercel.app/\n\n#cookers!`;

describe('ShareModal', () => {
  it('builds the requested share text', () => {
    expect(buildShareText(3, seed)).toBe(shareText);
  });

  it('shows the logo and share links with the current stage and seed', () => {
    render(<ShareModal stageNumber={3} seed={seed} onClose={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'cookers!' })).toHaveAttribute(
      'src',
      '/assets/sprites/logo.png',
    );
    expect(screen.getByRole('link', { name: 'Xで共有する' })).toHaveAttribute(
      'href',
      `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    );
    expect(
      screen.getByRole('link', { name: 'LINEで共有する' }),
    ).toHaveAttribute(
      'href',
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
        'https://cookers-web-game.vercel.app/',
      )}&text=${encodeURIComponent(shareText)}`,
    );
  });

  it('uses the LINE app share URL with the complete message on mobile', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
    );

    render(<ShareModal stageNumber={3} seed={seed} onClose={vi.fn()} />);

    expect(
      screen.getByRole('link', { name: 'LINEで共有する' }),
    ).toHaveAttribute(
      'href',
      `https://line.me/R/share?text=${encodeURIComponent(shareText)}`,
    );
  });

  it('copies the share text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ShareModal stageNumber={3} seed={seed} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '共有文をコピーする' }));

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith(shareText));
  });

  it('closes from the backdrop, close button, and Escape key', () => {
    const onClose = vi.fn();
    render(<ShareModal stageNumber={3} seed={seed} onClose={onClose} />);

    fireEvent.pointerDown(screen.getByRole('presentation'));
    fireEvent.click(
      screen.getByRole('button', { name: 'シェアモーダルを閉じる' }),
    );
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
