import type { News } from '@/payload-types';

export type LiveBlogUpdateItem = NonNullable<News['liveUpdates']>[number];

export type LiveBlogConnectionState =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface LiveBlogRealtimeContextValue {
  articleId: string;
  slug?: string;
  isLiveBlog: boolean;
  status: 'active' | 'concluded';
  updates: LiveBlogUpdateItem[];
  connectionState: LiveBlogConnectionState;
  newUpdatesCount: number;
  newestUpdateId: string | null;
  isRefreshing: boolean;
  lastUpdatedTime: Date | null;
  refresh: () => Promise<void>;
  clearNewUpdatesCount: () => void;
  scrollToLatest: () => void;
}
