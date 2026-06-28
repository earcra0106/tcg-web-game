import { useEffect, useRef, useState } from 'react';

export function useHorizontalScroll<T extends HTMLElement>(
  contentVersion: unknown,
) {
  const elementRef = useRef<T | null>(null);
  const [hasHorizontalScrollbar, setHasHorizontalScrollbar] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (element === null) {
      return;
    }

    const updateScrollbarState = () => {
      setHasHorizontalScrollbar(element.scrollWidth > element.clientWidth);
    };
    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();

      if (event.deltaY === 0 || element.scrollWidth <= element.clientWidth) {
        return;
      }

      event.preventDefault();
      element.scrollLeft += event.deltaY;
    };

    updateScrollbarState();

    const resizeObserver = new ResizeObserver(updateScrollbarState);
    resizeObserver.observe(element);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener('wheel', handleWheel);
    };
  }, [contentVersion]);

  return { elementRef, hasHorizontalScrollbar };
}
