export type ViewportSize = {
  width: number;
  height: number;
  pixelRatio: number;
};

export function getViewportSize(
  element: Pick<HTMLElement, 'clientWidth' | 'clientHeight'>,
  devicePixelRatio: number,
): ViewportSize {
  return {
    width: Math.max(1, element.clientWidth),
    height: Math.max(1, element.clientHeight),
    pixelRatio: Math.min(devicePixelRatio, 2),
  };
}

export function getAspectRatio(size: Pick<ViewportSize, 'width' | 'height'>) {
  return size.width / size.height;
}
