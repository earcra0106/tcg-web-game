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
  const elements = Object.fromEntries(
    Object.entries(GAME_SOUND_URLS).map(([id, url]) => {
      const element = createAudioElement(url);
      element.preload = 'auto';
      element.volume = id === 'success' ? 0.72 : 0.52;

      return [id, element];
    }),
  ) as Record<GameSoundId, AudioElementLike>;

  return {
    play(soundId: GameSoundId) {
      if (muted) {
        return;
      }

      const element = elements[soundId];
      element.currentTime = 0;
      element.muted = false;

      void Promise.resolve(element.play()).catch(() => {
        // Browser autoplay policies can reject play(); user input will unlock it later.
      });
    },
    setMuted(nextMuted: boolean) {
      muted = nextMuted;
      Object.values(elements).forEach((element) => {
        element.muted = nextMuted;
      });
    },
    isMuted() {
      return muted;
    },
  };
}
