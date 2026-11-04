import type { CollectionAfterChangeHook } from 'payload';

export const syncPinnedArticlesToNewsCategory: CollectionAfterChangeHook =
  async ({ doc, req: { payload } }) => {
    if (doc?.category) {
      const categoryId =
        typeof doc.category === 'object' && doc.category !== null
          ? doc.category.id
          : doc.category;

      const articleIds = Array.isArray(doc.pinnedArticles)
        ? doc.pinnedArticles.map((art: any) =>
            typeof art === 'object' && art !== null ? art.id : art
          )
        : [];

      try {
        await payload.update({
          collection: 'news-categories',
          id: categoryId,
          data: {
            pinnedArticles: articleIds,
          },
        });
      } catch (error) {
        payload.logger.error(
          { err: error },
          'Failed to sync pinned articles to news-categories'
        );
      }
    }

    return doc;
  };
