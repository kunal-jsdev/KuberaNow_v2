import type { Metadata } from 'next';

import PageSectionHeader from '@/components/common/PageSectionHeader';
import ContactCardShell from '@/components/contact-us/ContactCardShell';
import HodCarousel from '@/components/leadership/HodCarousel';
import LeaderCard from '@/components/leadership/LeaderCard';
import TeamOrbit from '@/components/leadership/TeamOrbit';
import {
  HEADS_OF_DEPARTMENT,
  LEADERS,
  LEADERSHIP_JSON_LD,
  LEADERSHIP_KEYWORDS,
  LEADERSHIP_PATH,
  TEAM_MEMBERS,
} from '@/constants/leadership';
import { STATIC_PAGE_SEO } from '@/constants/pageSeo';
import { buildAboutSubPageJsonLd, SITE_URL } from '@/lib/utils/jsonLd';
import { robotsMetadata } from '@/utils';

const LEADERSHIP_URL = `${SITE_URL}${LEADERSHIP_PATH}`;
const SHARE_IMAGE = {
  url: '/assets/openGraph.jpg',
  alt: STATIC_PAGE_SEO.leadership.title,
};

export const metadata: Metadata = {
  title: STATIC_PAGE_SEO.leadership.title,
  description: STATIC_PAGE_SEO.leadership.description,
  keywords: LEADERSHIP_KEYWORDS,
  alternates: { canonical: LEADERSHIP_URL },
  openGraph: {
    type: 'website',
    title: STATIC_PAGE_SEO.leadership.title,
    description: STATIC_PAGE_SEO.leadership.description,
    url: LEADERSHIP_URL,
    siteName: 'KuberaNow',
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: STATIC_PAGE_SEO.leadership.title,
    description: STATIC_PAGE_SEO.leadership.description,
    images: [SHARE_IMAGE.url],
  },
  robots: robotsMetadata,
};

export default function LeadershipPage() {
  const leadershipJsonLd = buildAboutSubPageJsonLd({
    path: LEADERSHIP_PATH,
    title: LEADERSHIP_JSON_LD.name,
    breadcrumbName: LEADERSHIP_JSON_LD.breadcrumbName,
    description: LEADERSHIP_JSON_LD.description,
  });

  return (
    <div className='leadership-page flex flex-col gap-4 font-sans lg:gap-6'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(leadershipJsonLd) }}
      />
      <ContactCardShell
        padding='mobile'
        className='flex w-full flex-col gap-3 lg:gap-6 lg:rounded-lg lg:p-5'
      >
        <PageSectionHeader
          as='h1'
          title={STATIC_PAGE_SEO.leadership.h1}
          titleClassName='text-lg leading-5.5 text-career-dark lg:text-2xl lg:leading-7'
        />
        <div className='flex gap-3.75 lg:gap-5'>
          {LEADERS.map((leader) => (
            <LeaderCard
              key={leader.id}
              leader={leader}
            />
          ))}
        </div>
      </ContactCardShell>

      <ContactCardShell
        padding='mobile'
        className='w-full overflow-hidden lg:rounded-lg lg:p-5'
      >
        <h2 className='sr-only'>Heads of Department</h2>
        <HodCarousel hods={HEADS_OF_DEPARTMENT} />
      </ContactCardShell>

      <ContactCardShell
        padding='mobile'
        className='w-full overflow-hidden px-0 py-2 lg:rounded-lg lg:px-0 lg:py-5'
      >
        <h2 className='sr-only'>Our Team</h2>
        <TeamOrbit members={TEAM_MEMBERS} />
      </ContactCardShell>
    </div>
  );
}
