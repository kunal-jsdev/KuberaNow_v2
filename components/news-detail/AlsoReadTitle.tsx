'use client';

import { useIsArticleLive } from '@/components/common/GlobalLiveBlogSyncProvider';

import LiveIndicatorDot from './LiveIndicatorDot';

type AlsoReadTitleProps = {
  articleId: string | number;
  title: string;
  fallbackIsLive: boolean;
};

export default function AlsoReadTitle({
  articleId,
  title,
  fallbackIsLive,
}: AlsoReadTitleProps) {
  const isLive = useIsArticleLive(String(articleId), fallbackIsLive);

  return (
    <>
      {isLive && (
        <LiveIndicatorDot
          size='sm'
          className='mr-2 ml-1.5 inline-flex align-middle'
        />
      )}
      <span>{title}</span>
    </>
  );
}
