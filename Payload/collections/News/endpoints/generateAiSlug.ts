import type { PayloadHandler } from 'payload';

import { isAdminOrEditorUser } from '@/Payload/lib/Auth/roles';
import { generateAiSlug } from '@/Payload/lib/services/geminiSlugService';

export const generateAiSlugHandler: PayloadHandler = async (req) => {
  if (!req.user || !isAdminOrEditorUser(req.user)) {
    return Response.json(
      { error: 'Unauthorized: Admin or Editor role required.' },
      { status: 401 }
    );
  }

  try {
    let body: { title?: unknown } | null = null;
    if (typeof req.json === 'function') {
      body = (await req.json()) as { title?: unknown };
    } else {
      const rawText = await (req as unknown as Request).text?.();
      if (rawText) {
        body = JSON.parse(rawText) as { title?: unknown };
      }
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : '';

    if (!title) {
      return Response.json(
        { error: 'Title is required to generate an AI slug.' },
        { status: 400 }
      );
    }

    const slug = await generateAiSlug({ title });
    return Response.json({ slug });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate AI slug.';
    return Response.json({ error: message }, { status: 500 });
  }
};
