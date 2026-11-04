'use client';

import { useEffect, useState } from 'react';

export const STORAGE_KEYS = {
  SESSIONS: 'kuberanow_sessions',
  SESSION_ACTIVE: 'kubera_session_active',
  PROMPT_DISMISSED: 'kuberanow_prompt_dismissed',
  PWA_INSTALLED: 'kuberanow_pwa_installed',
};

export const PROMPT_VERSION = 'v1';

export type PWAPromptAction =
  'shown' | 'add_to_home_screen' | 'not_now' | 'close' | 'installed';

export interface PWAPromptParams {
  prompt_session?: number;
  pwa_status?: 'not_installed' | 'installed';
  [key: string]: any;
}

export function getPWASessionCount(): number {
  if (typeof window === 'undefined') return 1;
  const currentSessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return currentSessionsStr ? parseInt(currentSessionsStr, 10) : 1;
}

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  const isInstalledInStorage =
    localStorage.getItem(STORAGE_KEYS.PWA_INSTALLED) === 'true';

  return isStandalone || isInstalledInStorage;
}

let hasTrackedInstalled = false;

/**
 * Track PWA Install Prompt events on Google Analytics & GTM
 *
 * Event Name: pwa_install_prompt
 * Actions: shown | add_to_home_screen | not_now | close | installed
 * Parameters: prompt_session, pwa_status, prompt_version
 */
export function trackPWAInstallPrompt(
  action: PWAPromptAction,
  params?: PWAPromptParams
) {
  if (typeof window === 'undefined') return;

  if (action === 'installed') {
    if (hasTrackedInstalled) return;
    hasTrackedInstalled = true;
  }

  const prompt_session = params?.prompt_session ?? getPWASessionCount();
  const pwa_status =
    params?.pwa_status ?? (isPWAInstalled() ? 'installed' : 'not_installed');
  const prompt_version = params?.prompt_version ?? PROMPT_VERSION;

  const eventPayload = {
    action,
    prompt_session,
    pwa_status,
    prompt_version,
    ...params,
  };

  // Google Tag Manager dataLayer
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'pwa_install_prompt',
      ...eventPayload,
      timestamp: new Date().toISOString(),
    });
  }

  // Google Analytics (GA4)
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'pwa_install_prompt', eventPayload);
  }
}

/**
 * Track legacy or custom PWA-related analytics events
 */
export function trackPWAEvent(
  eventName:
    | 'pwa_prompt_triggered'
    | 'pwa_install_accepted'
    | 'pwa_install_dismissed'
    | 'pwa_ios_guidance_opened'
    | 'pwa_install_prompt',
  additionalData?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  // Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push(eventPayload);
  }

  // Google Analytics
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, additionalData);
  }
}

function getInitialPWAState() {
  if (typeof window === 'undefined') {
    return {
      isIOS: false,
      isIOSSafari: false,
      isIOSNonSafari: false,
      isInstalled: false,
      sessionCount: 1,
      isSessionEligible: true,
      isDismissed: false,
    };
  }

  /**
   * Detect iOS
   */
  const userAgent = window.navigator.userAgent.toLowerCase();

  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

  let isIOSSafariDevice = false;
  let isIOSNonSafariDevice = false;

  if (isIOSDevice) {
    const isOtherBrowserOnIOS = /crios|fxios|edgios|optios/.test(userAgent);

    isIOSSafariDevice =
      /safari/.test(userAgent) &&
      !isOtherBrowserOnIOS &&
      !/opera/.test(userAgent);

    isIOSNonSafariDevice = !isIOSSafariDevice;
  }

  /**
   * Detect if PWA is already installed
   */
  const isInstalled = isPWAInstalled();

  let sessionCount = 1;

  const isSessionActive = sessionStorage.getItem(STORAGE_KEYS.SESSION_ACTIVE);

  if (!isSessionActive) {
    const currentSessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);

    const prevCount = currentSessionsStr ? parseInt(currentSessionsStr, 10) : 0;

    sessionCount = prevCount + 1;

    localStorage.setItem(STORAGE_KEYS.SESSIONS, sessionCount.toString());

    sessionStorage.setItem(STORAGE_KEYS.SESSION_ACTIVE, 'true');
  } else {
    const currentSessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);

    sessionCount = currentSessionsStr ? parseInt(currentSessionsStr, 10) : 1;
  }

  /**
   * Every odd session is eligible
   */
  const isSessionEligible = sessionCount % 2 === 1;

  const isDismissed =
    sessionStorage.getItem(STORAGE_KEYS.PROMPT_DISMISSED) === 'true';

  return {
    isIOS: isIOSDevice,
    isIOSSafari: isIOSSafariDevice,
    isIOSNonSafari: isIOSNonSafariDevice,
    isInstalled,
    sessionCount,
    isSessionEligible,
    isDismissed,
  };
}

export function usePWAInstall() {
  const [initialState] = useState(getInitialPWAState);

  const [isIOS] = useState(initialState.isIOS);

  const [isIOSSafari] = useState(initialState.isIOSSafari);

  const [isIOSNonSafari] = useState(initialState.isIOSNonSafari);

  const [isInstalled, setIsInstalled] = useState(initialState.isInstalled);

  const [isDismissed, setIsDismissed] = useState(initialState.isDismissed);

  const [isTriggered, setIsTriggered] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      return (window as any).deferredPrompt;
    }

    return null;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * Chrome / Edge / supported browsers
     *
     * This event is fired when the browser determines
     * that the website can be installed as a PWA.
     */
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      setDeferredPrompt(e);

      /**
       * Store globally so other components can also
       * access the deferred prompt if required.
       */
      (window as any).deferredPrompt = e;
    };

    /**
     * Fired after PWA has been successfully installed.
     */
    const handleAppInstalled = () => {
      setIsInstalled(true);

      localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');

      setDeferredPrompt(null);

      (window as any).deferredPrompt = null;

      trackPWAInstallPrompt('installed', {
        prompt_session: initialState.sessionCount,
        pwa_status: 'installed',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', handleAppInstalled);

    /**
     * Cleanup
     */
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [initialState.sessionCount]);

  /**
   * -----------------------------------------
   * Engagement Trigger
   * -----------------------------------------
   *
   * Prompt can be triggered by:
   *
   * 1. User stays on page for 10 seconds
   *
   * OR
   *
   * 2. User scrolls meaningfully
   *
   * Whichever happens first wins.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * Don't trigger if:
     *
     * - Already installed
     * - Current session is not eligible
     * - Prompt was already dismissed
     * - Prompt already triggered
     */
    if (
      isInstalled ||
      !initialState.isSessionEligible ||
      isDismissed ||
      isTriggered
    ) {
      return;
    }

    // eslint-disable-next-line prefer-const
    let timerId: ReturnType<typeof setTimeout>;

    const initialScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > initialScrollY + 20 || window.scrollY > 20) {
        triggerPrompt();
      }
    };

    /**
     * Trigger the prompt
     */
    function triggerPrompt() {
      setIsTriggered(true);

      if (timerId) {
        clearTimeout(timerId);
      }

      window.removeEventListener('scroll', handleScroll);
    }

    /**
     * -----------------------------------------
     * Trigger A — 10 seconds
     * -----------------------------------------
     */
    timerId = setTimeout(() => {
      triggerPrompt();
    }, 10000);

    /**
     * -----------------------------------------
     * Trigger B — Meaningful Scroll
     * -----------------------------------------
     */
    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }

      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    isInstalled,
    initialState.isSessionEligible,
    initialState.sessionCount,
    isDismissed,
    isTriggered,
  ]);

  const dismissPrompt = (reason: 'not_now' | 'close' = 'close') => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEYS.PROMPT_DISMISSED, 'true');
    }

    setIsDismissed(true);

    trackPWAInstallPrompt(reason, {
      prompt_session: initialState.sessionCount,
      pwa_status: isInstalled ? 'installed' : 'not_installed',
    });
  };

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);

        if (typeof window !== 'undefined') {
          (window as any).deferredPrompt = null;

          localStorage.setItem(STORAGE_KEYS.PWA_INSTALLED, 'true');
        }

        setIsInstalled(true);

        trackPWAInstallPrompt('installed', {
          prompt_session: initialState.sessionCount,
          pwa_status: 'installed',
        });
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(STORAGE_KEYS.PROMPT_DISMISSED, 'true');
        }

        setIsDismissed(true);

        trackPWAInstallPrompt('close', {
          prompt_session: initialState.sessionCount,
          pwa_status: isInstalled ? 'installed' : 'not_installed',
        });
      }
    } else {
      if (typeof window !== 'undefined') {
        alert(
          'To install KuberaNow:\n\n' +
            '1. Click your browser menu (⋮ / ⋯ or Share icon)\n' +
            "2. Select 'Install KuberaNow' or 'Add to Home Screen'"
        );
      }

      dismissPrompt('close');
    }
  };

  const isTestMode =
    typeof window !== 'undefined' &&
    window.location.search.includes('pwa_test=true');

  const isInstallable = !isInstalled;

  const shouldShowPrompt =
    isTestMode ||
    (isInstallable &&
      initialState.isSessionEligible &&
      !isDismissed &&
      isTriggered);

  return {
    isIOS,
    isIOSSafari,
    isIOSNonSafari,
    isInstalled,
    isInstallable,
    shouldShowPrompt,
    sessionCount: initialState.sessionCount,
    promptInstall,
    dismissPrompt,
    trackPWAAction: (
      action: PWAPromptAction,
      extra?: Partial<PWAPromptParams>
    ) =>
      trackPWAInstallPrompt(action, {
        prompt_session: initialState.sessionCount,
        pwa_status: isInstalled ? 'installed' : 'not_installed',
        ...extra,
      }),
  };
}
