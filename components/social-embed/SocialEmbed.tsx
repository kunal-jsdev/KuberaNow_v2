'use client';

import FacebookEmbed from './FacebookEmbed';
import InstagramEmbed from './InstagramEmbed';
import { parseSocialUrl, type SocialEmbedInfo } from './socialParser';
import TwitterEmbed from './TwitterEmbed';
import YouTubeEmbed from './YouTubeEmbed';

type SocialEmbedProps = {
  url?: string | null;
  info?: SocialEmbedInfo | null;
  fallbackText?: string;
  className?: string;
};

export default function SocialEmbed({
  url,
  info: initialInfo,
  fallbackText,
  className,
}: SocialEmbedProps) {
  const info = initialInfo || (url ? parseSocialUrl(url) : null);

  if (!info) {
    if (!url) return null;
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='break-all text-blue-600 hover:underline'
      >
        {fallbackText || url}
      </a>
    );
  }

  switch (info.platform) {
    case 'youtube':
      return (
        <YouTubeEmbed
          videoId={info.videoId}
          originalUrl={info.originalUrl}
          className={className}
        />
      );
    case 'twitter':
      return (
        <TwitterEmbed
          username={info.username}
          tweetId={info.tweetId}
          originalUrl={info.originalUrl}
          className={className}
        />
      );
    case 'instagram':
      return (
        <InstagramEmbed
          postType={info.postType}
          code={info.code}
          originalUrl={info.originalUrl}
          className={className}
        />
      );
    case 'facebook':
      return (
        <FacebookEmbed
          embedType={info.embedType}
          originalUrl={info.originalUrl}
          className={className}
        />
      );
    default:
      return null;
  }
}
