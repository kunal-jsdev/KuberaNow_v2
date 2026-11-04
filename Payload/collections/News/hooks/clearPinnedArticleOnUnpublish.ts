import type { CollectionAfterChangeHook, Payload } from 'payload';

const PINNED_GLOBAL_SLUGS = ['pinned-articles'] as const;

type PinnedGlobalSlug = (typeof PINNED_GLOBAL_SLUGS)[number];

const relatedArticleId = (article: unknown): string | number | null => {
  if (typeof article === 'string' || typeof article === 'number') {
    return article;
  }
  if (typeof article === 'object' && article !== null && 'id' in article) {
    return (article as { id?: string | number }).id ?? null;
  }
  return null;
};

const removeFromGlobal = async (
  payload: Payload,
  slug: PinnedGlobalSlug,
  articleId: string | number
) => {
  const global = await payload.findGlobal({ slug, depth: 0 });
  const rows = Array.isArray(global?.articles) ? global.articles : [];

  const remaining = rows.filter(
    (row: { article?: unknown }) =>
      String(relatedArticleId(row?.article)) !== String(articleId)
  );

  if (remaining.length === rows.length) return;

  await payload.updateGlobal({
    slug,
    data: { articles: remaining },
    draft: false,
  });
};

export const clearPinnedArticleOnUnpublish: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  const { payload } = req;
  const becameUnpublished =
    previousDoc?._status === 'published' && doc?._status !== 'published';

  if (!becameUnpublished || !doc?.id) return doc;

  // Draft saves (autosave / "Save Draft") only add a draft version; the live
  // article stays published, so it must stay pinned.
  const live = await payload.db.findOne<{ id: string; _status?: string }>({
    collection: 'news',
    where: { id: { equals: doc.id } },
    req,
  });
  if (live?._status === 'published') return doc;

  for (const slug of PINNED_GLOBAL_SLUGS) {
    try {
      await removeFromGlobal(payload, slug, doc.id);
    } catch (error) {
      payload.logger.error(
        { err: error },
        `Failed to clear unpublished article from ${slug}`
      );
    }
  }

  return doc;
};
