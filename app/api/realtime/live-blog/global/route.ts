import { NextRequest } from 'next/server';

import {
  type LiveBlogRealtimePayload,
  subscribeGlobalLiveBlog,
  unsubscribeGlobalLiveBlog,
} from '@/lib/realtime/liveBlogEmitter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const safeEnqueue = (chunk: Uint8Array) => {
        if (isClosed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          isClosed = true;
        }
      };

      // 1. Initial handshake
      const connectedPayload = {
        event: 'connected',
        timestamp: new Date().toISOString(),
      };
      safeEnqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify(connectedPayload)}\n\n`
        )
      );

      // 2. Global live status listener
      const onGlobalStatus = (payload: LiveBlogRealtimePayload) => {
        if (isClosed) return;
        try {
          const data = {
            articleId: payload.articleId,
            article_id: payload.article_id,
            slug: payload.slug,
            isLiveBlog: Boolean(payload.isLiveBlog),
            liveBlogStatus: payload.liveBlogStatus,
            updatedAt: payload.updatedAt,
          };
          safeEnqueue(
            encoder.encode(
              `event: status_change\ndata: ${JSON.stringify(data)}\n\n`
            )
          );
        } catch {}
      };

      subscribeGlobalLiveBlog(onGlobalStatus);

      // 3. Heartbeat ping every 25 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(pingInterval);
          return;
        }
        safeEnqueue(encoder.encode(`: ping\n\n`));
      }, 25000);

      // 4. Cleanup on disconnect
      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        clearInterval(pingInterval);
        unsubscribeGlobalLiveBlog(onGlobalStatus);
        try {
          controller.close();
        } catch {}
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
