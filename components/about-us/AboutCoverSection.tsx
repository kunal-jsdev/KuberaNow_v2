import type { ReactNode } from 'react';

import { ABOUT_COVERAGE } from '../../constants/about';
import GlobalIcon from '../../lib/Icons/GlobalIcon';
import NationalIcon from '../../lib/Icons/NationalIcon';
import NewsIcon from '../../lib/Icons/NewsIcon';
import PageSectionHeader from '../common/PageSectionHeader';
import ContactCardShell from '../contact-us/ContactCardShell';
import ContactIconBadge from '../contact-us/ContactIconBadge';

const COVERAGE_ICONS: Record<(typeof ABOUT_COVERAGE)[number]['id'], ReactNode> =
  {
    regional: <NewsIcon className='h-3.5 w-3.5 md:h-4.5 md:w-4.5' />,
    global: <GlobalIcon className='h-3.5 w-3.5 md:h-4.5 md:w-4.5' />,
    national: <NationalIcon className='h-3.5 w-3.5 md:h-4.5 md:w-4.5' />,
  };

export default function AboutCoverSection() {
  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:gap-6'>
        <PageSectionHeader
          title='What We Cover'
          titleClassName='text-lg leading-[22px] text-career-heading lg:text-2xl lg:leading-7'
        />

        <div className='grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4'>
          {ABOUT_COVERAGE.map((item) => (
            <article
              key={item.id}
              className='border-career-stroke bg-career-tint flex flex-col gap-3 rounded-lg border p-4 lg:gap-4'
            >
              <div className='flex flex-col gap-2 lg:gap-4'>
                <ContactIconBadge className='size-6 rounded-sm lg:size-10.5 lg:rounded-lg'>
                  {COVERAGE_ICONS[item.id]}
                </ContactIconBadge>
                <h4 className='text-career-dark lg:text-subheading-big text-base leading-5 font-bold lg:leading-6.5'>
                  {item.title}
                </h4>
              </div>
              <p className='text-career-dark text-xs leading-4.5 lg:text-base lg:leading-5'>
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </ContactCardShell>
  );
}
