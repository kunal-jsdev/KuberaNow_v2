'use client';

import { useEffect, useState } from 'react';

import {
  PROMPT_VERSION,
  PWAPromptAction,
  PWAPromptParams,
  trackPWAInstallPrompt,
} from './usePWAInstall';

const TIME_THRESHOLD_MS = 15000; // 15 seconds
const PAGEVIEW_THRESHOLD = 2; // 2 pageviews
const STORAGE_KEY_PAGEVIEWS = 'pwa_session_pageviews';

export {
  PROMPT_VERSION,
  type PWAPromptAction,
  type PWAPromptParams,
  trackPWAInstallPrompt,
};

export function usePWAEngagement() {
  const [isEngaged, setIsEngaged] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_PAGEVIEWS);
      const currentViews = stored ? parseInt(stored, 10) + 1 : 1;
      sessionStorage.setItem(STORAGE_KEY_PAGEVIEWS, currentViews.toString());
      return currentViews >= PAGEVIEW_THRESHOLD;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isEngaged || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      setIsEngaged(true);
    }, TIME_THRESHOLD_MS);

    return () => clearTimeout(timer);
  }, [isEngaged]);

  return { isEngaged };
}
