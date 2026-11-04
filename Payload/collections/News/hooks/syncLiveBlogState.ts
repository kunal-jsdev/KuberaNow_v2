import type { CollectionBeforeChangeHook } from 'payload';

export const syncLiveBlogState: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (!data) return data;

  const isPublishing =
    data._status === 'published' || req?.data?._status === 'published';

  const isLiveBlogDraft = Boolean(data.isLiveBlog);

  let isLiveBlogPublished = false;

  if (isPublishing) {
    isLiveBlogPublished = isLiveBlogDraft;
  } else {
    const docId = originalDoc?.id || (data as any)?.id;
    if (docId && req?.payload) {
      try {
        const publishedDoc = await req.payload.findByID({
          collection: 'news',
          id: docId,
          draft: false,
          depth: 0,
        });
        if (publishedDoc) {
          isLiveBlogPublished = Boolean(publishedDoc.isLiveBlog);
        }
      } catch {
        isLiveBlogPublished = false;
      }
    } else if (originalDoc?.publishedIsLiveBlog !== undefined) {
      isLiveBlogPublished = Boolean(originalDoc.publishedIsLiveBlog);
    } else if (originalDoc?._status === 'published') {
      isLiveBlogPublished = Boolean(originalDoc.isLiveBlog);
    }
  }

  data.publishedIsLiveBlog = isLiveBlogPublished;
  data.isInActiveBlogs = Boolean(isLiveBlogDraft || isLiveBlogPublished);
  data.liveBlogStatus =
    isLiveBlogDraft || isLiveBlogPublished ? 'active' : 'concluded';

  return data;
};
