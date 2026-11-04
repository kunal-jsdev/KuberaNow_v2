import { EventEmitter } from 'events';

import type { News } from '@/payload-types';

export type LiveBlogUpdateItem = NonNullable<News['liveUpdates']>[number];

export interface LiveBlogRealtimePayload {
  type: 'update' | 'status_change' | 'init';
  articleId: string;
  article_id?: string;
  slug?: string;
  isLiveBlog?: boolean;
  liveBlogStatus: 'active' | 'concluded';
  updatedAt: string;
  liveUpdates: LiveBlogUpdateItem[];
  latestUpdate: LiveBlogUpdateItem | null;
  totalUpdates: number;
}

declare global {
  var __liveBlogEmitter: EventEmitter | undefined;

  var __liveBlogLatestState: Map<string, LiveBlogRealtimePayload> | undefined;
}

const emitter = globalThis.__liveBlogEmitter ?? new EventEmitter();
emitter.setMaxListeners(2000);
globalThis.__liveBlogEmitter = emitter;

const latestStateCache =
  globalThis.__liveBlogLatestState ??
  new Map<string, LiveBlogRealtimePayload>();
globalThis.__liveBlogLatestState = latestStateCache;

function getChannelNames(identifier: string): string[] {
  const clean = identifier.trim().toLowerCase();
  return [`article:${clean}`, `article:${identifier.trim()}`];
}

export function publishLiveBlogUpdate(payload: LiveBlogRealtimePayload): void {
  if (payload.articleId) {
    latestStateCache.set(payload.articleId.toLowerCase(), payload);
  }
  if (payload.article_id) {
    latestStateCache.set(payload.article_id.toLowerCase(), payload);
  }
  if (payload.slug) {
    latestStateCache.set(payload.slug.toLowerCase(), payload);
  }

  const channelsToEmit = new Set<string>();

  if (payload.articleId) {
    getChannelNames(payload.articleId).forEach((c) => channelsToEmit.add(c));
  }
  if (payload.article_id) {
    getChannelNames(payload.article_id).forEach((c) => channelsToEmit.add(c));
  }
  if (payload.slug) {
    getChannelNames(payload.slug).forEach((c) => channelsToEmit.add(c));
  }

  channelsToEmit.forEach((channel) => {
    emitter.emit(channel, payload);
  });

  // Also emit to the global channel for sitewide live status sync
  emitter.emit('live-blog:global', payload);
}

export function subscribeGlobalLiveBlog(
  listener: (payload: LiveBlogRealtimePayload) => void
): void {
  emitter.on('live-blog:global', listener);
}

export function unsubscribeGlobalLiveBlog(
  listener: (payload: LiveBlogRealtimePayload) => void
): void {
  emitter.off('live-blog:global', listener);
}

export function subscribeLiveBlog(
  identifier: string,
  listener: (payload: LiveBlogRealtimePayload) => void
): void {
  const primaryChannel = `article:${identifier.trim().toLowerCase()}`;
  emitter.on(primaryChannel, listener);
}

export function unsubscribeLiveBlog(
  identifier: string,
  listener: (payload: LiveBlogRealtimePayload) => void
): void {
  const primaryChannel = `article:${identifier.trim().toLowerCase()}`;
  emitter.off(primaryChannel, listener);
}

export function getLatestLiveBlogState(
  identifier: string
): LiveBlogRealtimePayload | null {
  const key = identifier.trim().toLowerCase();
  return latestStateCache.get(key) ?? null;
}

export function clearLiveBlogCache(identifiers: string[]): void {
  identifiers.forEach((id) => {
    if (id) {
      latestStateCache.delete(id.trim().toLowerCase());
    }
  });
}

export function clearAllLiveBlogCache(): void {
  latestStateCache.clear();
}
