import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import CategoryPageSection from '@/components/category/CategoryPage';
import LeaderboardAdBanner from '@/components/common/LeaderboardAdBanner';
import { getInterleavedMedia } from '@/Payload/lib/utilities/getInterleavedVideos';
import type { News, Tag } from '@/payload-types';

export const revalidate = 600;

type Args = {
  params: Promise<{ tagSlug: string }>;
};

const newsCardSelect = {
  slug: true,
  title: true,
  summary: true,
  heroImage: true,
  category: true,
  article_id: true,
  isLiveBlog: true,
  liveUpdates: true,
  liveBlogStatus: true,
} as const;

async function queryTagBySlug(slug: string): Promise<Tag | null> {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'tags',
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  });

  return result.docs[0] || null;
}

// export async function generateStaticParams() {
//   const payload = await getPayload({ config: configPromise });
//   const result = await payload.find({
//     collection: 'tags',
//     limit: 1000,
//     pagination: false,
//     overrideAccess: false,
//     select: { slug: true },
//   });

//   return result.docs
//     .filter((tag) => tag.slug)
//     .map((tag) => ({ tagSlug: tag.slug }));
// }

export default async function TagPage({ params }: Args) {
  const { tagSlug: rawTagSlug } = await params;
  const tagSlug = decodeURIComponent(rawTagSlug);
  const tag = await queryTagBySlug(tagSlug);

  if (!tag) notFound();

  const payload = await getPayload({ config: configPromise });
  const [result, interleavedMedia] = await Promise.all([
    payload.find({
      collection: 'news',
      draft: false,
      limit: 1000,
      pagination: false,
      overrideAccess: false,
      depth: 1,
      sort: '-publishedAt',
      select: newsCardSelect,
      where: {
        and: [{ _status: { equals: 'published' } }, { tags: { in: [tag.id] } }],
      },
    }),
    getInterleavedMedia({
      tagId: tag.id,
      tagSlug,
    }),
  ]);

  return (
    <>
      <CategoryPageSection
        leading={<LeaderboardAdBanner />}
        mobileInterleave
        news={result.docs as News[]}
        pinnedArticles={[]}
        title={tag.title}
        emptyMessage='No news published with this tag yet.'
        showFeatured={false}
        categoryId={tag.id}
        source='tag'
        hasMore={result.hasNextPage}
        pinnedIds={[]}
        interleavedMedia={interleavedMedia}
      />
    </>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { tagSlug: rawTagSlug } = await params;
  const tag = await queryTagBySlug(decodeURIComponent(rawTagSlug));

  return {
    title: tag ? `${tag.title} News | KuberaNow` : 'Tag | KuberaNow',
    description: tag
      ? `Latest news tagged ${tag.title} from KuberaNow.`
      : 'Browse news by tag on KuberaNow.',
  };
}
