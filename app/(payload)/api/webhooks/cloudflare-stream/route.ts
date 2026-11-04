import config from '@payload-config';
import { getPayload } from 'payload';

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as {
      uid?: string;
      status?: { state?: string };
      duration?: number;
      thumbnail?: string;
    };

    const streamUid = body.uid;
    const state = body.status?.state;

    if (!streamUid) {
      return Response.json({ error: 'Missing streamUid' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const streamDomain =
      process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net';

    if (state === 'ready') {
      const found = await payload.find({
        collection: 'videos',
        where: { streamUid: { equals: streamUid } },
        limit: 1,
      });

      if (found.docs.length > 0) {
        const videoDoc = found.docs[0];
        await payload.update({
          collection: 'videos',
          id: videoDoc.id,
          data: {
            cfStatus: 'ready',
            hlsUrl: `https://${streamDomain}/${streamUid}/manifest/video.m3u8`,
            thumbnailUrl:
              body.thumbnail ||
              `https://${streamDomain}/${streamUid}/thumbnails/thumbnail.jpg?time=1s&height=720`,
          },
        });
      }
    } else if (state === 'error') {
      const found = await payload.find({
        collection: 'videos',
        where: { streamUid: { equals: streamUid } },
        limit: 1,
      });
      if (found.docs.length > 0) {
        await payload.update({
          collection: 'videos',
          id: found.docs[0].id,
          data: { cfStatus: 'failed' },
        });
      }
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Webhook processing failed';
    return Response.json({ error: msg }, { status: 500 });
  }
}
