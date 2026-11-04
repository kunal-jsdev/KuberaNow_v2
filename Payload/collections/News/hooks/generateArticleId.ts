import { createDailyIdHook, dateKey } from '@/Payload/hooks/generateDailyId';
import { SEQUENCE_LENGTH } from '@/Payload/lib/utilities/articleId';

export const COUNTER_COLLECTION = 'article_id_counters';

export { dateKey, SEQUENCE_LENGTH };

export const generateArticleId = createDailyIdHook(
  'article_id',
  COUNTER_COLLECTION
);
