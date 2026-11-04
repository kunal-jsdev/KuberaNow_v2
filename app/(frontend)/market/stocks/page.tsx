/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';

import MobileInterleaveRoot from '@/components/layout/MobileInterleaveRoot';
import MarketWidgetBlock from '@/components/market/MarketWidgetBlock';
import {
  MARKET_DESCRIPTION,
  MARKET_H1,
  MARKET_KEYWORDS,
  MARKET_TITLE,
  MARKET_WIDGET_BLOCKS,
} from '@/constants/marketPage';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import { robotsMetadata } from '@/utils';

const siteUrl = getServerSideURL().replace(/\/+$/, '');

type PageProps = {
  params: Promise<{ marketSlug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { marketSlug } = await params;
  const formattedSlug = marketSlug
    ? marketSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Live Market';

  return {
    title: `${formattedSlug} - ${MARKET_TITLE}`,
    description: MARKET_DESCRIPTION,
    keywords: MARKET_KEYWORDS,
    robots: robotsMetadata,
  };
}

export default async function MarketSlugPage({ params }: PageProps) {
  const { marketSlug } = await params;

  const marketJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/market/${marketSlug}#webpage`,
    url: `${siteUrl}/market/${marketSlug}`,
    name: MARKET_TITLE,
    description: MARKET_DESCRIPTION,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: 'KuberaNow',
    },
    inLanguage: 'gu-IN',
  };

  return (
    <MobileInterleaveRoot
      as='main'
      className='flex w-full flex-col items-center gap-6'
      preamble={
        <>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(marketJsonLd) }}
          />
          <h1 className='sr-only'>{MARKET_H1}</h1>
        </>
      }
    >
      {/* Market Widget Blocks */}
      {MARKET_WIDGET_BLOCKS.map((widget) => (
        <MarketWidgetBlock
          key={widget.id}
          title={widget.title}
          contentScript={widget.contentScript}
        />
      ))}
    </MobileInterleaveRoot>
  );
}
