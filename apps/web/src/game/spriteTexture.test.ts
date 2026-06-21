import { describe, expect, it } from 'vitest';
import { createSpriteTextureLayout } from './spriteTexture.ts';

describe('sprite texture layout', () => {
  it('uses the actual machine frame height for a 1024x512 sheet', () => {
    expect(
      createSpriteTextureLayout({
        frame: { x: 256, y: 0, width: 256, height: 256 },
        sheetWidth: 1024,
        sheetHeight: 512,
      }),
    ).toEqual({
      repeat: [0.25, 0.5],
      offset: [0.25, 0.5],
    });
  });

  it('keeps food frames square on a 1024x1024 sheet', () => {
    expect(
      createSpriteTextureLayout({
        frame: { x: 128, y: 256, width: 128, height: 128 },
        sheetWidth: 1024,
        sheetHeight: 1024,
      }),
    ).toEqual({
      repeat: [0.125, 0.125],
      offset: [0.125, 0.625],
    });
  });
});
