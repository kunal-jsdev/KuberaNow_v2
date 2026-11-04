import configPromise from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';

import {
  getLatestLiveBlogState,
  type LiveBlogRealtimePayload,
  type LiveBlogUpdateItem,
  publishLiveBlogUpdate,
} from '@/lib/realtime/liveBlogEmitter';
import type { News } from '@/payload-types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId || '').trim();

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Missing article identifier' },
      { status: 400 }
    );
  }

  const cached = getLatestLiveBlogState(id);
  if (cached) {
    return NextResponse.json({
      success: true,
      source: 'cache',
      data: cached,
    });
  }

  try {
    const payloadClient = await getPayload({ config: configPromise });
    let doc: News | null = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      try {
        doc = await payloadClient.findByID({
          collection: 'news',
          id,
          depth: 1,
          draft: false,
          overrideAccess: false,
        });
      } catch {}
    }

    if (!doc) {
      const results = await payloadClient.find({
        collection: 'news',
        draft: false,
        overrideAccess: false,
        where: {
          _status: { equals: 'published' },
          or: [{ article_id: { equals: id } }, { slug: { equals: id } }],
        },
        limit: 1,
        depth: 1,
      });
      doc = results.docs[0] || null;
    }

    if (!doc || doc._status !== 'published') {
      return NextResponse.json(
        {
          success: false,
          error: 'Live blog article not found or not published',
        },
        { status: 404 }
      );
    }

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

    const payload: LiveBlogRealtimePayload = {
      type: 'update',
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

    publishLiveBlogUpdate(payload);

    return NextResponse.json({
      success: true,
      source: 'database',
      data: payload,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in live-blog latest route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
