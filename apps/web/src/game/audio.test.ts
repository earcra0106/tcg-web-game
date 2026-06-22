import { describe, expect, it, vi } from 'vitest';
import { createGameAudioController, GAME_SOUND_URLS } from './audio.ts';

describe('audio', () => {
  it('preloads configured sound assets', () => {
    const urls: string[] = [];

    createGameAudioController((url) => {
      urls.push(url);

      return {
        currentTime: 0,
        muted: false,
        preload: '',
        volume: 1,
        play: vi.fn(),
      };
    });

    expect(urls).toEqual(Object.values(GAME_SOUND_URLS));
  });

  it('does not play sounds while muted', () => {
    const play = vi.fn();
    const controller = createGameAudioController(() => ({
      currentTime: 0,
      muted: false,
      preload: '',
      volume: 1,
      play,
    }));

    controller.setMuted(true);
    controller.play('select');

    expect(controller.isMuted()).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it('rewinds and plays the requested sound when unmuted', () => {
    const elements: Record<string, { currentTime: number; play: () => void }> =
      {};
    const controller = createGameAudioController((url) => {
      const element = {
        currentTime: 12,
        muted: false,
        preload: '',
        volume: 1,
        play: vi.fn(),
      };
      elements[url] = element;

      return element;
    });

    controller.play('confirm');

    expect(elements[GAME_SOUND_URLS.confirm]?.currentTime).toBe(0);
    expect(elements[GAME_SOUND_URLS.confirm]?.play).toHaveBeenCalledOnce();
  });
});
