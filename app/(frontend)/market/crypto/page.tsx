/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';

import MobileInterleaveRoot from '@/components/layout/MobileInterleaveRoot';
import MarketWidgetBlock from '@/components/market/MarketWidgetBlock';
import {
  CRYPTO_DESCRIPTION,
  CRYPTO_H1,
  CRYPTO_KEYWORDS,
  CRYPTO_TITLE,
  CRYPTO_WIDGET_BLOCKS,
} from '@/constants/cryptoPage';
import { getServerSideURL } from '@/Payload/lib/utilities/getURL';
import { robotsMetadata } from '@/utils';

const siteUrl = getServerSideURL().replace(/\/+$/, '');

export const metadata: Metadata = {
  title: CRYPTO_TITLE,
  description: CRYPTO_DESCRIPTION,
  keywords: CRYPTO_KEYWORDS,
  robots: robotsMetadata,
};

export default function CryptoPage() {
  const cryptoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/crypto#webpage`,
    url: `${siteUrl}/crypto`,
    name: CRYPTO_TITLE,
    description: CRYPTO_DESCRIPTION,
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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(cryptoJsonLd) }}
          />
          <h1 className='sr-only'>{CRYPTO_H1}</h1>
        </>
      }
    >
      {/* Crypto Widget Blocks */}
      {CRYPTO_WIDGET_BLOCKS.map((widget) => (
        <MarketWidgetBlock
          key={widget.id}
          title={widget.title}
          contentScript={widget.contentScript}
        />
      ))}
    </MobileInterleaveRoot>
  );
}
