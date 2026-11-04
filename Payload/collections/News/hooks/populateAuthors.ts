import type { CollectionBeforeChangeHook } from 'payload';

export const populateAuthors: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const updatedData = { ...data };

  // On article creation, set author to the logged-in user if not already set
  if (operation === 'create' && req?.user) {
    if (!updatedData.author) {
      updatedData.author = req.user.id;
    }
  }

  if (operation === 'update') {
    if (!updatedData.author) {
      if (originalDoc?.author) {
        const authorId =
          typeof originalDoc.author === 'object' && originalDoc.author !== null
            ? (originalDoc.author as any).id || (originalDoc.author as any)._id
            : originalDoc.author;
        updatedData.author = authorId;
      } else if (req?.user) {
        updatedData.author = req.user.id;
      }
    }
  }

  // Record who modified the article on every create and update operation
  if (req?.user) {
    updatedData.updatedBy = req.user.id;
  } else if (!updatedData.updatedBy && originalDoc?.updatedBy) {
    const updatedById =
      typeof originalDoc.updatedBy === 'object' &&
      originalDoc.updatedBy !== null
        ? (originalDoc.updatedBy as any).id ||
          (originalDoc.updatedBy as any)._id
        : originalDoc.updatedBy;
    updatedData.updatedBy = updatedById;
  }

  return updatedData;
};
