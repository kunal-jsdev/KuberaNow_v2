import { NextResponse } from 'next/server';

import { generateRssFeedXml } from '@/lib/rss/buildFeed';

export const revalidate = 300; // 5 minutes ISR revalidation

export async function GET(): Promise<Response> {
  try {
    const { xml } = await generateRssFeedXml();

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
    return new NextResponse('Internal Server Error generating RSS feed', {
      status: 500,
    });
  }
}
