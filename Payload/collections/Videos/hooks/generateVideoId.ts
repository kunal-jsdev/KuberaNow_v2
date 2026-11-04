import { createDailyIdHook } from '@/Payload/hooks/generateDailyId';

export const VIDEO_COUNTER_COLLECTION = 'video_id_counters';

export const generateVideoId = createDailyIdHook(
  'video_id',
  VIDEO_COUNTER_COLLECTION
);
