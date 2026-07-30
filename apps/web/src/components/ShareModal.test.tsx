import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { COOKERS_GAME_URL } from '../game/share.ts';
import { ShareModal } from './ShareModal.tsx';

const postText = 'ステージ 1 の生産目標を達成！';

describe('ShareModal', () => {
  it('shows the image and sharing controls', () => {
    render(
      <ShareModal
        imageUrl="data:image/png;base64,test"
        postText={postText}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'シェア' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'シェア画像' })).toHaveAttribute(
      'src',
      'data:image/png;base64,test',
    );
    expect(
      screen.getByRole('button', { name: 'Xで共有する' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'LINEで共有する' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'リンクをコピーする' }),
    ).toBeInTheDocument();
  });

  it('opens X and LINE sharing URLs', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    render(
      <ShareModal
        imageUrl="data:image/png;base64,test"
        postText={postText}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Xで共有する' }));
    fireEvent.click(screen.getByRole('button', { name: 'LINEで共有する' }));

    expect(open).toHaveBeenCalledTimes(2);
    expect(open.mock.calls[0]?.[0]).toContain('x.com/intent/tweet');
    expect(open.mock.calls[1]?.[0]).toContain('social-plugins.line.me');
  });

  it('copies the game link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(
      <ShareModal
        imageUrl="data:image/png;base64,test"
        postText={postText}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'リンクをコピーする' }));

    await vi.waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(COOKERS_GAME_URL),
    );
  });
});
