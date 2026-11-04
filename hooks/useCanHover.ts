'use client';

import { useCallback, useSyncExternalStore } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

export function useCanHover() {
  const subscribe = useCallback((onChange: () => void) => {
    const query = window.matchMedia(QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
