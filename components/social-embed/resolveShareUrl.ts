import { unstable_cache } from 'next/cache';

const FB_SHARE_RE =
  /(?:https?:\/\/)?(?:www\.|m\.|web\.|mobile\.)?facebook\.com\/share\/(reel|r|v|p)\/([\w-]+)\/?/i;

const FETCH_TIMEOUT_MS = 4000;
const CACHE_TTL_SECONDS = 3600;
const MAX_REDIRECT_HOPS = 5;

const SCRAPER_UA =
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

const KEEP_PARAMS = new Set(['v', 'story_fbid', 'id', 'fbid']);

export function extractFacebookShareUrl(text?: string | null): string | null {
  if (typeof text !== 'string') return null;
  const match = text.match(FB_SHARE_RE);
  if (!match) return null;
  let url = match[0];
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (!url.endsWith('/')) url += '/';
  return url;
}

export function isFacebookShareUrl(text?: string | null): boolean {
  return extractFacebookShareUrl(text) !== null;
}

const resolveShareUrlCached = unstable_cache(
  (shareUrl: string) => doResolve(shareUrl),
  ['fb-share-url-resolve'],
  { revalidate: CACHE_TTL_SECONDS, tags: ['fb-share-url-resolve'] }
);

export async function resolveShareUrl(
  text?: string | null
): Promise<string | null> {
  const shareUrl = extractFacebookShareUrl(text);
  if (!shareUrl) return null;
  try {
    return await resolveShareUrlCached(shareUrl);
  } catch {
    return null;
  }
}

async function doResolve(shareUrl: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let current = shareUrl;

    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
      const res = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': SCRAPER_UA,
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'en-US,en;q=0.9',
        },
      });

      const location = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && location) {
        const next = new URL(location, current).toString();
        const canonical = canonicalize(next, current);
        if (canonical) return canonical;
        current = next;
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await res.text();
        return canonicalize(extractCanonicalFromHtml(html), current);
      }
      return null;
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
function canonicalize(
  candidate: string | null | undefined,
  base: string
): string | null {
  if (!candidate) return null;

  let url: URL;
  try {
    url = new URL(candidate, base);
  } catch {
    return null;
  }

  let host = url.hostname.toLowerCase().replace(/^www\./, '');

  const isInterstitial =
    /^\/(?:login|checkpoint|recover|confirmemail)/i.test(url.pathname) ||
    host === 'l.facebook.com' ||
    host === 'lm.facebook.com';

  if (isInterstitial) {
    const nested =
      url.searchParams.get('next') ||
      url.searchParams.get('u') ||
      url.searchParams.get('url');
    if (nested) {
      try {
        const inner = new URL(decodeURIComponent(nested));
        if (!/\/share\//i.test(inner.pathname)) {
          return canonicalize(inner.toString(), base);
        }
      } catch {}
    }
    return null;
  }

  if (/\/share\//i.test(url.pathname)) return null;

  if (
    host === 'm.facebook.com' ||
    host === 'web.facebook.com' ||
    host === 'mobile.facebook.com'
  ) {
    url.hostname = 'www.facebook.com';
    host = 'facebook.com';
  }

  if (host !== 'facebook.com' && host !== 'fb.watch') return null;

  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (!KEEP_PARAMS.has(key.toLowerCase())) url.searchParams.delete(key);
  }

  return url.toString();
}

function extractCanonicalFromHtml(html: string): string | null {
  const canonical = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  if (canonical?.[1]) return htmlDecode(canonical[1]);

  const ogUrl = html.match(
    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogUrl?.[1]) return htmlDecode(ogUrl[1]);

  return null;
}

function htmlDecode(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&#0*47;/g, '/')
    .replace(/&#x0*2f;/gi, '/');
}
