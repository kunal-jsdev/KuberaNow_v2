import type { CollectionAfterReadHook } from 'payload';

import { DEFAULT_DISCLAIMER } from '../constants';

export const populateDisclaimer: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc;

  return {
    ...doc,
    showDisclaimer: doc.showDisclaimer ?? true,
    disclaimer: doc.disclaimer || DEFAULT_DISCLAIMER,
  };
};

export default populateDisclaimer;
