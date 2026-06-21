export type SpriteTextureFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SpriteTextureLayout = {
  repeat: [number, number];
  offset: [number, number];
};

export function createSpriteTextureLayout({
  frame,
  sheetWidth,
  sheetHeight,
}: {
  frame: SpriteTextureFrame;
  sheetWidth: number;
  sheetHeight: number;
}): SpriteTextureLayout {
  const repeatX = frame.width / sheetWidth;
  const repeatY = frame.height / sheetHeight;

  return {
    repeat: [repeatX, repeatY],
    offset: [frame.x / sheetWidth, 1 - frame.y / sheetHeight - repeatY],
  };
}
