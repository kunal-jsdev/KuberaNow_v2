import type { CollectionAfterDeleteHook } from 'payload';

export const clearPinnedArticlesOnNewsCategoryDelete: CollectionAfterDeleteHook =
  async ({ doc, req: { payload } }) => {
    if (doc?.category) {
      const categoryId =
        typeof doc.category === 'object' && doc.category !== null
          ? doc.category.id
          : doc.category;

      try {
        await payload.update({
          collection: 'news-categories',
          id: categoryId,
          data: {
            pinnedArticles: [],
          },
        });
      } catch (error) {
        payload.logger.error(
          { err: error },
          'Failed to clear pinned articles on news-categories'
        );
      }
    }

    return doc;
  };
