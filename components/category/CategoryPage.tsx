import {
  BSEStockHeatmap,
  GlobalMarketData,
  IndianStockMarket,
  MarketTickerTape,
  TopGainersLosers,
} from '@/components/market/MarketWidgets';
import { hasLiveBlogTimeline } from '@/lib/utils/liveBlog';
import type { InterleavedSectionMedia } from '@/Payload/lib/utilities/getInterleavedVideos';

import ContentPanel from '../common/ContentPanel';
import PageSectionHeader from '../common/PageSectionHeader';
import ActiveLiveBlogLeadCard from '../news/ActiveLiveBlogLeadCard';
import NewsCard, { type NewsCardData } from '../news/NewsCard';
import NewsLeadCard from '../news/NewsLeadCard';

import { InfiniteScrollCategoryNews } from './InfiniteScrollCategoryNews';

type CategoryPageSectionProps = {
  news: NewsCardData[];
  pinnedArticles: NewsCardData[];
  categoryName?: string;
  title: string;
  heading?: string;
  categoryId: string | number;
  pinnedIds?: (string | number)[];
  hasMore?: boolean;
  source?: 'category' | 'tag';
  emptyMessage?: string;
  showFeatured?: boolean;
  /** Marks this section's items for mobile interleaving with the sidebar. */
  mobileInterleave?: boolean;
  /** Rendered as the section's first item (e.g. a leaderboard ad). */
  leading?: React.ReactNode;
  afterPinnedSlot?: React.ReactNode;
  interleavedMedia?: InterleavedSectionMedia;
};

const FEATURED_COUNT = 3;
const MAX_GRID_CARDS = 24;
function CategoryPageSection({
  pinnedArticles,
  news,
  title,
  heading = title,
  categoryId,
  categoryName,
  pinnedIds = [],
  hasMore = false,
  source = 'category',
  emptyMessage = 'No news published in this category yet.',
  showFeatured = true,
  mobileInterleave = false,
  leading,
  afterPinnedSlot,
  interleavedMedia,
}: CategoryPageSectionProps) {
  const hasPinned = showFeatured && pinnedArticles?.length > 0;
  const featured = showFeatured
    ? (hasPinned ? pinnedArticles : news).slice(0, FEATURED_COUNT)
    : [];
  const [lead, ...belowLead] = featured;
  const isLeadTimelineVisible = hasLiveBlogTimeline(lead);

  const otherCards = (
    showFeatured && !hasPinned ? news.slice(featured.length) : news
  ).slice(0, MAX_GRID_CARDS);
  const showEmptyMessage = showFeatured ? !lead : news.length === 0;

  const isMarket = categoryName === 'market';
  const isWorld = categoryName === 'world';

  let marketMidSlot = null;
  if (isMarket) {
    marketMidSlot = (
      <div className='flex w-full flex-col gap-5'>
        <TopGainersLosers />
        <IndianStockMarket />
        <BSEStockHeatmap />
        <GlobalMarketData />
      </div>
    );
  } else if (isWorld) {
    marketMidSlot = <GlobalMarketData />;
  }

  return (
    <div
      data-mobile-interleave={mobileInterleave || undefined}
      data-source={source}
      className='flex w-full flex-col gap-5'
    >
      {leading}
      <ContentPanel className='flex flex-col gap-5'>
        <PageSectionHeader
          title={heading}
          as='h1'
        />

        {showEmptyMessage && (
          <p className='text-text-muted text-sm'>{emptyMessage}</p>
        )}

        {showFeatured && lead && (
          <div className='flex flex-col gap-3'>
            {isLeadTimelineVisible ? (
              <ActiveLiveBlogLeadCard
                news={lead}
                pinned={hasPinned}
              />
            ) : (
              <NewsLeadCard
                news={lead}
                pinned={hasPinned}
              />
            )}

            {belowLead.length > 0 && (
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                {belowLead.map((article) => (
                  <NewsCard
                    key={article.id}
                    news={article}
                    pinned={hasPinned}
                    orientation='horizontal'
                    titleTextSize='lg:text-xl'
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </ContentPanel>
      {afterPinnedSlot}
      {isMarket && MarketTickerTape && <MarketTickerTape />}
      <InfiniteScrollCategoryNews
        initialCards={otherCards}
        initialHasMore={hasMore}
        source={source}
        categoryId={categoryId}
        pinnedIds={pinnedIds}
        midSlot={marketMidSlot}
        interleavedMedia={interleavedMedia}
      />
    </div>
  );
}

export default CategoryPageSection;
