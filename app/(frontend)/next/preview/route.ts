import configPromise from '@payload-config';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getPayload, type PayloadRequest } from 'payload';

export type PreviewSearchParams = {
  path: string;
  previewSecret: string;
};

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const path = searchParams.get('path');
  const previewSecret = searchParams.get('previewSecret');

  if (
    !process.env.PREVIEW_SECRET ||
    previewSecret !== process.env.PREVIEW_SECRET
  ) {
    return new Response('You are not allowed to preview this page', {
      status: 403,
    });
  }

  if (!path) {
    return new Response('Insufficient search params', { status: 400 });
  }

  if (
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path.startsWith('/\\')
  ) {
    return new Response(
      'This endpoint can only be used for relative previews',
      { status: 400 }
    );
  }

  const payload = await getPayload({ config: configPromise });

  let user;

  try {
    user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });
  } catch (error) {
    payload.logger.error(
      { err: error },
      'Error verifying token for live preview'
    );
    return new Response('You are not allowed to preview this page', {
      status: 403,
    });
  }

  const draft = await draftMode();

  if (!user) {
    draft.disable();
    return new Response('You are not allowed to preview this page', {
      status: 403,
    });
  }

  draft.enable();

  redirect(path);
}
