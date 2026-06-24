export const GAME_SOUND_URLS = {
  select: '/assets/sounds/select.mp3',
  confirm: '/assets/sounds/confirm.mp3',
  success: '/assets/sounds/clear.mp3',
  cancel: '/assets/sounds/cancel.mp3',
  reject: '/assets/sounds/reject.mp3',
} as const;

export type GameSoundId = keyof typeof GAME_SOUND_URLS;

type AudioElementLike = {
  currentTime: number;
  muted: boolean;
  preload: string;
  volume: number;
  pause?: () => void;
  load?: () => void;
  removeAttribute?: (qualifiedName: string) => void;
  play: () => Promise<unknown> | unknown;
};

export type AudioElementFactory = (url: string) => AudioElementLike;

function createDefaultAudioElement(url: string): AudioElementLike {
  return new Audio(url);
}

export function createGameAudioController(
  createAudioElement: AudioElementFactory = createDefaultAudioElement,
) {
  let muted = false;
  const elements = new Map<GameSoundId, AudioElementLike>();

  const getElement = (soundId: GameSoundId) => {
    const current = elements.get(soundId);

    if (current !== undefined) {
      return current;
    }

    const element = createAudioElement(GAME_SOUND_URLS[soundId]);
    element.preload = 'auto';
    element.volume = soundId === 'success' ? 0.72 : 0.52;
    element.muted = muted;
    elements.set(soundId, element);

    return element;
  };

  return {
    play(soundId: GameSoundId) {
      if (muted) {
        return;
      }

      const element = getElement(soundId);
      element.currentTime = 0;
      element.muted = false;

      void Promise.resolve(element.play()).catch(() => {
        // Browser autoplay policies can reject play(); user input will unlock it later.
      });
    },
    setMuted(nextMuted: boolean) {
      muted = nextMuted;
      elements.forEach((element) => {
        element.muted = nextMuted;
      });
    },
    isMuted() {
      return muted;
    },
    dispose() {
      elements.forEach((element) => {
        element.pause?.();
        element.removeAttribute?.('src');
        element.load?.();
      });
      elements.clear();
    },
  };
}
