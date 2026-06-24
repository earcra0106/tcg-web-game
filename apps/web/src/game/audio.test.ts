import { describe, expect, it, vi } from 'vitest';
import { createGameAudioController, GAME_SOUND_URLS } from './audio.ts';

describe('audio', () => {
  it('creates audio elements lazily when a sound is played', () => {
    const urls: string[] = [];

    const controller = createGameAudioController((url) => {
      urls.push(url);

      return {
        currentTime: 0,
        muted: false,
        preload: '',
        volume: 1,
        play: vi.fn(),
      };
    });

    expect(urls).toEqual([]);

    controller.play('select');

    expect(urls).toEqual([GAME_SOUND_URLS.select]);
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

  it('reuses one audio element per sound id', () => {
    const createAudioElement = vi.fn((url: string) => ({
      currentTime: 0,
      muted: false,
      preload: '',
      volume: 1,
      play: vi.fn(),
      url,
    }));
    const controller = createGameAudioController(createAudioElement);

    controller.play('select');
    controller.play('select');
    controller.play('confirm');

    expect(createAudioElement).toHaveBeenCalledTimes(2);
    expect(createAudioElement).toHaveBeenNthCalledWith(
      1,
      GAME_SOUND_URLS.select,
    );
    expect(createAudioElement).toHaveBeenNthCalledWith(
      2,
      GAME_SOUND_URLS.confirm,
    );
  });

  it('disposes created audio elements', () => {
    const pause = vi.fn();
    const load = vi.fn();
    const removeAttribute = vi.fn();
    const controller = createGameAudioController(() => ({
      currentTime: 0,
      muted: false,
      preload: '',
      volume: 1,
      pause,
      load,
      removeAttribute,
      play: vi.fn(),
    }));

    controller.play('success');
    controller.dispose();

    expect(pause).toHaveBeenCalledOnce();
    expect(removeAttribute).toHaveBeenCalledWith('src');
    expect(load).toHaveBeenCalledOnce();
  });
});
