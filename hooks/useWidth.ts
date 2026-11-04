'use client';

import { useEffect, useState } from 'react';

export function useWidth() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (width === null || width > 1024) {
    return 'DESKTOP';
  } else if (width > 768) {
    return 'TABLET';
  } else {
    return 'MOBILE';
  }
}
