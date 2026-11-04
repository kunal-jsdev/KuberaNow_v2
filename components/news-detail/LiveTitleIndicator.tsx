'use client';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';

import { useOptionalLiveBlogRealtime } from './live-blog/LiveBlogRealtimeContext';
import LiveIndicatorDot from './LiveIndicatorDot';

interface LiveTitleIndicatorProps {
  fallbackIsLive?: boolean;
  articleId?: string | number | null;
}

function useIsTitleLive(
  articleId: LiveTitleIndicatorProps['articleId'],
  fallbackIsLive: boolean
) {
  const realtimeCtx = useOptionalLiveBlogRealtime();
  const globalIsLive = useIsArticleLive(articleId, fallbackIsLive);
  return realtimeCtx !== null && realtimeCtx !== undefined
    ? Boolean(realtimeCtx.isLiveBlog)
    : globalIsLive;
}

export default function LiveTitleIndicator({
  fallbackIsLive = false,
  articleId,
}: LiveTitleIndicatorProps) {
  const isLive = useIsTitleLive(articleId, fallbackIsLive);

  if (!isLive) return null;

  return <LiveIndicatorDot size='sm' />;
}

interface LiveArticleTitleProps extends LiveTitleIndicatorProps {
  title: string;
  className?: string;
}

export function LiveArticleTitle({
  title,
  className = '',
  fallbackIsLive = false,
  articleId,
}: LiveArticleTitleProps) {
  const isLive = useIsTitleLive(articleId, fallbackIsLive);

  return (
    <h1
      className={`${className} ${isLive ? 'text-[#010874]' : 'text-career-dark'}`}
    >
      {isLive && <LiveIndicatorDot size='sm' />}
      {title}
    </h1>
  );
}
