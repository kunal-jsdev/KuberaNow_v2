import { useEffect, useRef } from 'react';

export function useOutsideClick<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      ) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', callback);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', callback);
    };
  }, [callback]);

  return ref;
}
