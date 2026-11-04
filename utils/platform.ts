export type PlatformType = 'pwa' | 'web';
export type DisplayMode =
  'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

export interface PlatformInfo {
  platform: PlatformType;
  displayMode: DisplayMode;
  isIOSPWA: boolean;
  isAndroidTWA: boolean;
  isStandalone: boolean;
}

/**
 * Returns detailed information about the current client platform mode.
 * Safe to call during SSR (returns safe 'web' / 'browser' defaults).
 */
export function getDetailedPlatformInfo(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      platform: 'web',
      displayMode: 'browser',
      isIOSPWA: false,
      isAndroidTWA: false,
      isStandalone: false,
    };
  }

  const isStandaloneMatch =
    window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
  const isFullscreenMatch =
    window.matchMedia?.('(display-mode: fullscreen)')?.matches ?? false;
  const isMinimalUIMatch =
    window.matchMedia?.('(display-mode: minimal-ui)')?.matches ?? false;

  // iOS Safari standalone detection
  const isIOSPWA = Boolean(
    (window.navigator as unknown as { standalone?: boolean }).standalone
  );

  // Android Trusted Web Activity (TWA) detection
  const isAndroidTWA =
    typeof document !== 'undefined' &&
    typeof document.referrer === 'string' &&
    document.referrer.startsWith('android-app://');

  const isStandalone =
    isStandaloneMatch ||
    isFullscreenMatch ||
    isMinimalUIMatch ||
    isIOSPWA ||
    isAndroidTWA;

  let displayMode: DisplayMode = 'browser';
  if (isStandaloneMatch) displayMode = 'standalone';
  else if (isFullscreenMatch) displayMode = 'fullscreen';
  else if (isMinimalUIMatch) displayMode = 'minimal-ui';

  return {
    platform: isStandalone ? 'pwa' : 'web',
    displayMode,
    isIOSPWA,
    isAndroidTWA,
    isStandalone,
  };
}

/**
 * Helper to quickly determine if the user is visiting from PWA or standard Web.
 */
export function getPlatformType(): PlatformType {
  return getDetailedPlatformInfo().platform;
}
