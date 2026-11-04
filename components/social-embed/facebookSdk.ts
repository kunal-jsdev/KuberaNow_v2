declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      XFBML: {
        parse: (node?: HTMLElement, callback?: () => void) => void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

const FB_SDK_VERSION = 'v19.0';
const FB_ROOT_ID = 'fb-root';
const FB_SCRIPT_ID = 'facebook-jssdk';

let sdkPromise: Promise<void> | null = null;

/** Loads (once, across every FacebookEmbed instance on the page) and initializes the Facebook JS SDK. */
export function loadFacebookSdk(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Facebook SDK requires a browser environment')
    );
  }

  if (window.FB?.XFBML) {
    return Promise.resolve();
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    if (!document.getElementById(FB_ROOT_ID)) {
      const root = document.createElement('div');
      root.id = FB_ROOT_ID;
      document.body.appendChild(root);
    }

    const previousInit = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      previousInit?.();
      window.FB?.init({ xfbml: true, version: FB_SDK_VERSION });
      resolve();
    };

    if (document.getElementById(FB_SCRIPT_ID)) {
      // Script tag already requested by an earlier instance; fbAsyncInit above will resolve us too.
      return;
    }

    const script = document.createElement('script');
    script.id = FB_SCRIPT_ID;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load the Facebook SDK'));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}
