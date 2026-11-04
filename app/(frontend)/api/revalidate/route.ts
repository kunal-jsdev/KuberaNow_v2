import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret =
      process.env.CRON_SECRET || process.env.PAYLOAD_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paths, tags } = await req.json();

    if (Array.isArray(paths)) {
      for (const { path, type } of paths) {
        revalidatePath(path, type);
      }
    }

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        // Next.js versions/patches used in this project require a second argument for revalidateTag
        revalidateTag(tag, 'max');
      }
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      {
        revalidated: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
