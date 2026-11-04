'use client';

import { Fragment, useCallback } from 'react';

import { fetchMoreHomeNews } from '@/app/(frontend)/actions/newsActions';
import { FeedLoadMore } from '@/components/common/FeedLoadMore';
import { CardWrapper } from '@/components/main-page/CardWrapper';
import type { ContentImageProps } from '@/components/main-page/types';
import InterleavedShortsSection from '@/components/videos/InterleavedShortsSection';
import InterleavedVideoSection from '@/components/videos/InterleavedVideoSection';
import { FEED_BATCH_SIZE } from '@/constants/newsFeed';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import type { InterleavedSectionMedia } from '@/Payload/lib/utilities/getInterleavedVideos';

interface InfiniteScrollNewsProps {
  initialNews: ContentImageProps[];
  initialHasMore: boolean;
  pinnedIds?: (string | number)[];
  interleavedMedia?: InterleavedSectionMedia;
}

export function InfiniteScrollNews({
  initialNews = [],
  initialHasMore,
  pinnedIds = [],
  interleavedMedia,
}: InfiniteScrollNewsProps) {
  const fetchPage = useCallback(
    (page: number) =>
      fetchMoreHomeNews({ page, limit: FEED_BATCH_SIZE, pinnedIds }),
    [pinnedIds]
  );

  const feed = useNewsFeed({
    initialItems: initialNews,
    initialHasMore,
    fetchPage,
  });

  if (feed.sections.length === 0) {
    return (
      <>
        {interleavedMedia?.videos && interleavedMedia.videos.length >= 3 && (
          <InterleavedVideoSection
            videos={interleavedMedia.videos}
            moreHref={interleavedMedia.moreVideosHref}
            className='my-2'
          />
        )}
        {interleavedMedia?.shorts && interleavedMedia.shorts.length >= 3 && (
          <InterleavedShortsSection
            shorts={interleavedMedia.shorts}
            moreHref={interleavedMedia.moreShortsHref}
            className='my-2'
          />
        )}
      </>
    );
  }

  return (
    <>
      {feed.sections.map((section, i) => (
        <Fragment key={section[0]?.id ?? i}>
          <CardWrapper cards={section} />
          {i === 0 &&
            interleavedMedia?.videos &&
            interleavedMedia.videos.length >= 3 && (
              <InterleavedVideoSection
                videos={interleavedMedia.videos}
                moreHref={interleavedMedia.moreVideosHref}
                className='my-2'
              />
            )}
          {(i === 1 || (i === 0 && feed.sections.length === 1)) &&
            interleavedMedia?.shorts &&
            interleavedMedia.shorts.length >= 3 && (
              <InterleavedShortsSection
                shorts={interleavedMedia.shorts}
                moreHref={interleavedMedia.moreShortsHref}
                className='my-2'
              />
            )}
        </Fragment>
      ))}

      <FeedLoadMore
        status={feed.status}
        onLoadMore={feed.showMore}
        isLoading={feed.isLoading}
        onRetry={feed.retry}
      />
    </>
  );
}
