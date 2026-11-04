import { NextResponse } from 'next/server';

import { generateRssFeedXml } from '@/lib/rss/buildFeed';

export const revalidate = 300; // 5 minutes cache

type Args = {
  params: Promise<{ category: string }>;
};

export async function GET(
  _request: Request,
  { params }: Args
): Promise<Response> {
  try {
    const { category: rawCategory } = await params;
    const cleanCategory = decodeURIComponent(rawCategory || '')
      .replace(/\.xml$/i, '')
      .replace(/\/+$/, '')
      .trim();

    if (!cleanCategory) {
      return new NextResponse('Category parameter missing', { status: 400 });
    }

    const { xml, notFound } = await generateRssFeedXml({
      categorySlug: cleanCategory,
    });

    if (notFound) {
      return new NextResponse(
        `<?xml version="1.0" encoding="utf-8"?><error>Category '${cleanCategory}' not found</error>`,
        {
          status: 404,
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        }
      );
    }

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control':
          'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new NextResponse(
      'Internal Server Error generating category RSS feed',
      {
        status: 500,
      }
    );
  }
}
