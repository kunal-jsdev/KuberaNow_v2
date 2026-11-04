'use client';

import { useEffect } from 'react';

import LogRocket from 'logrocket';

import { getDetailedPlatformInfo } from '@/utils/platform';

export default function LogRocketSetup() {
  useEffect(() => {
    LogRocket.init('aiewc3/kuberanow');
    const info = getDetailedPlatformInfo();
    /* eslint-disable camelcase */
    LogRocket.identify({
      platform_type: info.platform,
      display_mode: info.displayMode,
      is_pwa: info.isStandalone,
    });
    /* eslint-enable camelcase */
  }, []);

  return null;
}
