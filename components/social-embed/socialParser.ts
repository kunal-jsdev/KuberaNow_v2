export type SocialEmbedInfo =
  | {
      platform: 'youtube';
      videoId: string;
      originalUrl: string;
    }
  | {
      platform: 'twitter';
      username: string;
      tweetId: string;
      originalUrl: string;
    }
  | {
      platform: 'instagram';
      postType: 'p' | 'reel' | 'tv';
      code: string;
      originalUrl: string;
    }
  | {
      platform: 'facebook';
      embedType: 'video' | 'post';
      originalUrl: string;
    };

const YOUTUBE_ID_REGEX = /^[\w-]{11}$/;

export function parseSocialUrl(rawUrl?: string | null): SocialEmbedInfo | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const text = rawUrl.trim();
  if (!text) return null;

  // 1. Direct Twitter / X Matcher (matches URLs, status IDs & HTML blockquotes)
  const twitterMatch = text.match(
    /(?:twitter\.com|x\.com)\/(?:#!\/)?(?:([a-zA-Z0-9_]+)\/)?status(?:es)?\/(\d+)/i
  );
  if (twitterMatch && twitterMatch[2]) {
    const tweetId = twitterMatch[2];
    const username =
      twitterMatch[1] &&
      twitterMatch[1] !== 'i' &&
      twitterMatch[1] !== 'status' &&
      twitterMatch[1] !== 'statuses'
        ? twitterMatch[1]
        : 'twitter';
    return {
      platform: 'twitter',
      username,
      tweetId,
      originalUrl: `https://x.com/${username}/status/${tweetId}`,
    };
  }

  // 2. Direct Instagram Matcher (matches /p/, /reel/, /tv/ & HTML blockquotes)
  const instagramMatch = text.match(
    /(?:instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/([a-zA-Z0-9_\-]+)/i
  );
  if (instagramMatch && instagramMatch[2]) {
    const typeRaw = instagramMatch[1].toLowerCase();
    const postType =
      typeRaw === 'reels' ? 'reel' : (typeRaw as 'p' | 'reel' | 'tv');
    const code = instagramMatch[2];
    return {
      platform: 'instagram',
      postType,
      code,
      originalUrl: `https://www.instagram.com/${postType}/${code}/`,
    };
  }

  const facebookShareMatch = text.match(
    /facebook\.com\/share\/(reel|r|v|p)\/([\w-]+)/i
  );
  if (facebookShareMatch) {
    const kind = facebookShareMatch[1].toLowerCase();
    const token = facebookShareMatch[2];
    return {
      platform: 'facebook',
      embedType: kind === 'p' ? 'post' : 'video',
      originalUrl: `https://www.facebook.com/share/${kind}/${token}/`,
    };
  }

  // 4. Direct Facebook Matcher (matches videos/, reel/, watch?v=, fb.watch/ & permalink/story posts)
  const facebookVideoMatch = text.match(
    /(?:facebook\.com\/(?:[\w.\-]+\/)?(?:videos|reel)\/\d+|facebook\.com\/watch\/?\?v=\d+|fb\.watch\/[\w-]+)/i
  );
  const facebookPostMatch = text.match(
    /(?:facebook\.com\/(?:[\w.\-]+\/posts\/[\w:]+|permalink\.php\?story_fbid=[\w:.=&%-]+|photo(?:\.php)?\?fbid=\d+|story\.php\?story_fbid=[\w:.=&%-]+|[\w.\-]+\/photos\/[\w./-]+))/i
  );
  if (facebookVideoMatch || facebookPostMatch) {
    const matched = (facebookVideoMatch?.[0] ||
      facebookPostMatch?.[0]) as string;
    const withScheme = /^https?:\/\//i.test(matched)
      ? matched
      : `https://${matched}`;
    return {
      platform: 'facebook',
      embedType: facebookVideoMatch ? 'video' : 'post',
      originalUrl: withScheme,
    };
  }

  // 5. Direct YouTube Matcher (matches watch?v=, youtu.be, embed/, shorts/, live/)
  const youtubeMatch =
    text.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i
    ) || text.match(/v=([\w-]{11})/i);

  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      platform: 'youtube',
      videoId,
      originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // 6. Candidate URL Fallback Loop (URL hostname & pathname parsing)
  const urlMatches = text.match(/(https?:\/\/[^\s<>"']+)/gi) || [text];

  for (const candidate of urlMatches) {
    const urlStr = candidate.replace(/[.,;:!?)]+$/, '');
    const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(urlStr)
      ? urlStr
      : `https://${urlStr}`;

    let parsed: URL;
    try {
      parsed = new URL(withScheme);
    } catch {
      continue;
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // YouTube
    if (
      hostname === 'youtube.com' ||
      hostname === 'm.youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'youtube-nocookie.com'
    ) {
      let videoId: string | null = null;
      if (hostname === 'youtu.be') {
        const seg = parsed.pathname.split('/').filter(Boolean)[0];
        if (seg && YOUTUBE_ID_REGEX.test(seg)) videoId = seg;
      } else {
        const vParam = parsed.searchParams.get('v');
        if (vParam && YOUTUBE_ID_REGEX.test(vParam)) {
          videoId = vParam;
        } else {
          const segments = parsed.pathname.split('/').filter(Boolean);
          const [first, second] = segments;
          if (
            (first === 'embed' ||
              first === 'shorts' ||
              first === 'live' ||
              first === 'v') &&
            second &&
            YOUTUBE_ID_REGEX.test(second)
          ) {
            videoId = second;
          }
        }
      }
      if (videoId) {
        return { platform: 'youtube', videoId, originalUrl: urlStr };
      }
    }

    // Twitter / X
    if (
      hostname === 'twitter.com' ||
      hostname === 'x.com' ||
      hostname === 'platform.twitter.com' ||
      hostname === 'platform.x.com'
    ) {
      const statusMatch = parsed.pathname.match(
        /\/(?:status|statuses)\/(\d+)/i
      );
      if (statusMatch && statusMatch[1]) {
        return {
          platform: 'twitter',
          username: 'twitter',
          tweetId: statusMatch[1],
          originalUrl: urlStr,
        };
      }
    }

    // Instagram
    if (hostname === 'instagram.com' || hostname === 'instagr.am') {
      const igMatch = parsed.pathname.match(
        /\/(p|reel|reels|tv)\/([a-zA-Z0-9_\-]+)/i
      );
      if (igMatch && igMatch[2]) {
        return {
          platform: 'instagram',
          postType:
            igMatch[1] === 'reels'
              ? 'reel'
              : (igMatch[1] as 'p' | 'reel' | 'tv'),
          code: igMatch[2],
          originalUrl: urlStr,
        };
      }
    }

    // Facebook
    if (
      hostname === 'facebook.com' ||
      hostname === 'm.facebook.com' ||
      hostname === 'web.facebook.com' ||
      hostname === 'fb.watch'
    ) {
      const isVideo =
        hostname === 'fb.watch' ||
        /\/(videos|reel)\//i.test(parsed.pathname) ||
        parsed.pathname.replace(/\/+$/, '') === '/watch';

      return {
        platform: 'facebook',
        embedType: isVideo ? 'video' : 'post',
        originalUrl: urlStr,
      };
    }
  }

  return null;
}
