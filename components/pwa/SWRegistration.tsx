'use client';

import { useEffect } from 'react';

export default function SWRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Silence SW registration errors in production
        });
      });
    }
  }, []);

  return null;
}
