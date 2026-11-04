'use client';

import { Fragment, useCallback } from 'react';

import {
  fetchMoreCategoryNews,
  fetchMoreTagNews,
} from '@/app/(frontend)/actions/newsActions';
import InterleavedShortsSection from '@/components/videos/InterleavedShortsSection';
import InterleavedVideoSection from '@/components/videos/InterleavedVideoSection';
import { FEED_BATCH_SIZE } from '@/constants/newsFeed';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import type { InterleavedSectionMedia } from '@/Payload/lib/utilities/getInterleavedVideos';

import ContentPanel from '../common/ContentPanel';
import { FeedLoadMore } from '../common/FeedLoadMore';
import NewsCard, { type NewsCardData } from '../news/NewsCard';

interface InfiniteScrollCategoryNewsProps {
  initialCards: NewsCardData[];
  initialHasMore: boolean;
  /** Category id, or tag id when `source` is `'tag'`. */
  categoryId: string | number;
  source?: 'category' | 'tag';
  pinnedIds?: (string | number)[];
  midSlot?: React.ReactNode;
  interleavedMedia?: InterleavedSectionMedia;
}

export function InfiniteScrollCategoryNews({
  initialCards = [],
  initialHasMore,
  categoryId,
  source = 'category',
  pinnedIds = [],
  midSlot,
  interleavedMedia,
}: InfiniteScrollCategoryNewsProps) {
  const fetchPage = useCallback(
    (page: number) =>
      source === 'tag'
        ? fetchMoreTagNews({ page, limit: FEED_BATCH_SIZE, tagId: categoryId })
        : fetchMoreCategoryNews({
            page,
            limit: FEED_BATCH_SIZE,
            categoryId,
            pinnedIds,
          }),
    [source, categoryId, pinnedIds]
  );

  const feed = useNewsFeed<NewsCardData>({
    initialItems: initialCards,
    initialHasMore,
    fetchPage,
  });

  if (feed.sections.length === 0) {
    return (
      <>
        {midSlot}
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
      {feed.sections.map((group, i) => (
        <Fragment key={group[0]?.id || i}>
          <ContentPanel className='flex flex-col gap-5'>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'>
              {group.map((item) => (
                <NewsCard
                  key={item.id}
                  news={item}
                  orientation='vertical'
                  titleTextSize='lg:text-lg!'
                />
              ))}
            </div>
          </ContentPanel>
          {i === 0 && midSlot}
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
        skeletonGridClassName='sm:grid-cols-3'
      />
    </>
  );
}
