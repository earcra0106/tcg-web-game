import type { WheelEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

export function useHorizontalScroll<T extends HTMLElement>(
  contentVersion: unknown,
) {
  const elementRef = useRef<T | null>(null);
  const [hasHorizontalScrollbar, setHasHorizontalScrollbar] = useState(false);

  const handleWheel = (event: WheelEvent<T>) => {
    const element = elementRef.current;

    if (
      element === null ||
      event.deltaY === 0 ||
      element.scrollWidth <= element.clientWidth
    ) {
      return;
    }

    event.preventDefault();
    element.scrollLeft += event.deltaY;
  };

  useEffect(() => {
    const element = elementRef.current;

    if (element === null) {
      return;
    }

    const updateScrollbarState = () => {
      setHasHorizontalScrollbar(element.scrollWidth > element.clientWidth);
    };

    updateScrollbarState();

    const resizeObserver = new ResizeObserver(updateScrollbarState);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentVersion]);

  return { elementRef, handleWheel, hasHorizontalScrollbar };
}
