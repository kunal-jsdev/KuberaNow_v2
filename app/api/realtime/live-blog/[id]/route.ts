import configPromise from '@payload-config';
import { NextRequest } from 'next/server';
import { getPayload } from 'payload';

import {
  getLatestLiveBlogState,
  type LiveBlogRealtimePayload,
  type LiveBlogUpdateItem,
  publishLiveBlogUpdate,
  subscribeLiveBlog,
  unsubscribeLiveBlog,
} from '@/lib/realtime/liveBlogEmitter';
import type { News } from '@/payload-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function fetchLiveBlogDoc(identifier: string): Promise<News | null> {
  try {
    const payloadClient = await getPayload({ config: configPromise });

    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      try {
        const byId = await payloadClient.findByID({
          collection: 'news',
          id: identifier,
          depth: 1,
          draft: false,
          overrideAccess: false,
        });
        if (byId && byId._status === 'published') return byId;
      } catch {}
    }

    const results = await payloadClient.find({
      collection: 'news',
      draft: false,
      overrideAccess: false,
      where: {
        _status: { equals: 'published' },
        or: [
          { article_id: { equals: identifier } },
          { slug: { equals: identifier } },
        ],
      },
      limit: 1,
      depth: 1,
    });

    const doc = results.docs[0] || null;
    if (doc && doc._status === 'published') {
      return doc;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching live blog document for SSE:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId || '').trim();

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Missing article identifier' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const encoder = new TextEncoder();

  const doc = await fetchLiveBlogDoc(id);
  if (!doc || doc._status !== 'published') {
    return new Response(
      JSON.stringify({
        error: 'Article not found or not published',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  let initialState = getLatestLiveBlogState(id);
  if (!initialState) {
    const updates = Array.isArray(doc.liveUpdates)
      ? (doc.liveUpdates as LiveBlogUpdateItem[])
      : [];
    const sorted = [...updates].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return (
        (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
      );
    });

    const isLive = Boolean(doc.isLiveBlog);

    initialState = {
      type: 'init',
      articleId: String(doc.id),
      article_id: doc.article_id ?? undefined,
      slug: doc.slug,
      isLiveBlog: isLive,
      liveBlogStatus: isLive ? 'active' : 'concluded',
      updatedAt: doc.updatedAt || new Date().toISOString(),
      liveUpdates: sorted,
      latestUpdate: sorted[0] ?? null,
      totalUpdates: sorted.length,
    };

    publishLiveBlogUpdate(initialState);
  }

  const stream = new ReadableStream({
    start(controller) {
      const connectedPayload = {
        event: 'connected',
        identifier: id,
        timestamp: new Date().toISOString(),
        initialState: initialState ?? null,
      };

      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify(connectedPayload)}\n\n`
        )
      );

      const onLiveUpdate = (payload: LiveBlogRealtimePayload) => {
        try {
          const sseMessage = `event: update\ndata: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch {}
      };

      subscribeLiveBlog(id, onLiveUpdate);

      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 20000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribeLiveBlog(id, onLiveUpdate);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
