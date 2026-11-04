import type { PayloadHandler } from 'payload';

import { deleteR2VideoBackup } from '@/Payload/lib/r2';

export async function deleteVideoFromCloudflare(
  streamUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken || accountId.includes('your_')) {
      return { success: true };
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamUid}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (res.ok || res.status === 404) {
      return { success: true };
    }

    const json = (await res.json().catch(() => ({}))) as {
      errors?: { message: string }[];
    };
    const errMsg =
      json?.errors?.[0]?.message || `Cloudflare HTTP ${res.status}`;
    return { success: false, error: errMsg };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: msg };
  }
}

export const deleteCloudflareVideoHandler: PayloadHandler = async (req) => {
  try {
    let streamUid: string | null = null;
    let r2Key: string | null = null;

    if (req.json) {
      const body = await req.json().catch(() => ({}));
      streamUid = body?.streamUid;
      r2Key = body?.r2Key;
    }

    if (!streamUid && req.url) {
      const url = new URL(req.url, 'http://localhost');
      streamUid = url.searchParams.get('streamUid');
      if (!r2Key) r2Key = url.searchParams.get('r2Key');
    }

    if (!streamUid) {
      return Response.json(
        { error: 'Missing streamUid parameter' },
        { status: 400 }
      );
    }

    if (!r2Key) {
      try {
        const mediaDocs = await req.payload.find({
          collection: 'videos-media',
          where: { streamUid: { equals: streamUid } },
          limit: 1,
          req,
        });
        if (mediaDocs.docs.length > 0 && (mediaDocs.docs[0] as any).r2Key) {
          r2Key = (mediaDocs.docs[0] as any).r2Key;
        }
      } catch {}
    }

    try {
      await deleteR2VideoBackup({
        streamUid,
        r2Key,
      });
      req.payload.logger.info(
        `[R2 Delete] Successfully deleted backup for ${streamUid} (key: ${r2Key || 'auto-resolved'}) from Cloudflare R2.`
      );
    } catch (r2Err) {
      req.payload.logger.warn(
        `[R2 Delete] Failed to delete backup object ${r2Key}: ${r2Err}`
      );
    }

    const result = await deleteVideoFromCloudflare(streamUid);
    if (!result.success) {
      req.payload.logger.warn(
        `[CF Delete] Failed to delete video ${streamUid}: ${result.error}`
      );
      return Response.json({ success: true, warning: result.error });
    }

    req.payload.logger.info(
      `[CF Delete] Successfully deleted video ${streamUid} from Cloudflare Stream.`
    );
    return Response.json({ success: true, deletedUid: streamUid });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to delete video';
    req.payload.logger.warn(`[CF Delete] ${msg}`);
    return Response.json({ success: true, warning: msg });
  }
};
