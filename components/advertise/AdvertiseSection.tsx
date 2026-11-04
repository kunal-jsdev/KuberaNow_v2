import type { ReactNode } from 'react';
import {
  HiOutlineEnvelope,
  HiOutlineGlobeAlt,
  HiOutlineShare,
  HiOutlineTv,
} from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';

import { ADVERTISE_FORMATS, ADVERTISE_HERO } from '../../constants/advertise';
import { STATIC_PAGE_SEO } from '../../constants/pageSeo';
import PageSectionHeader from '../common/PageSectionHeader';
import ContactCardShell from '../contact-us/ContactCardShell';
import ContactIconBadge from '../contact-us/ContactIconBadge';

import AdvertiseCtaBanner from './AdvertiseCtaBanner';
import AdvertiseDisclaimer from './AdvertiseDisclaimer';
import AdvertiseWhySection from './AdvertiseWhySection';

const FORMAT_ICONS: Record<
  (typeof ADVERTISE_FORMATS)[number]['id'],
  ReactNode
> = {
  television: <HiOutlineTv className='size-full' />,
  digital: <HiOutlineGlobeAlt className='size-full' />,
  newsletter: <HiOutlineEnvelope className='size-full' />,
  social: <HiOutlineShare className='size-full' />,
};

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className='text-career-dark flex flex-col gap-2 text-xs leading-4 lg:text-sm lg:leading-5'>
      {items.map((item) => (
        <li
          key={item}
          className='flex gap-2'
        >
          <span className='text-primary mt-1 shrink-0 lg:mt-1.5'>
            <IoSend className='size-2.5' />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionIconTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className='flex items-center gap-3 lg:gap-4'>
      <ContactIconBadge
        size='sm'
        className='lg:hidden'
      >
        {icon}
      </ContactIconBadge>
      <ContactIconBadge className='hidden lg:flex'>{icon}</ContactIconBadge>
      <h3 className='text-career-dark text-base leading-5 font-bold lg:text-xl lg:leading-6'>
        {title}
      </h3>
    </div>
  );
}

export default function AdvertiseSection() {
  return (
    <section className='flex w-full max-w-[950px] flex-col gap-4 lg:gap-5'>
      {/* <div className='hidden px-5 lg:block lg:px-7.5'>
        <LeaderboardAdBanner />
      </div> */}

      <ContactCardShell
        padding='mobile'
        className='lg:rounded-lg lg:p-5'
      >
        <div className='flex w-full flex-col gap-4 lg:gap-6'>
          <PageSectionHeader
            titleClassName='text-lg leading-[22px] text-career-heading lg:text-2xl lg:leading-7'
            title={STATIC_PAGE_SEO.advertise.h1}
            as='h1'
          />

          <div className='flex flex-col gap-3 lg:gap-4'>
            <h2 className='text-career-heading text-base leading-5 font-bold lg:text-xl lg:leading-6'>
              {ADVERTISE_HERO.subtitle}
            </h2>
            <p className='text-career-dark text-xs leading-4 lg:text-sm lg:leading-5'>
              {ADVERTISE_HERO.description}
            </p>
          </div>
        </div>
      </ContactCardShell>

      <ContactCardShell
        padding='mobile'
        className='lg:rounded-lg lg:p-5'
      >
        <div className='flex w-full flex-col gap-4 lg:gap-6'>
          <PageSectionHeader
            title='Advertising Formats'
            titleClassName='text-lg leading-[22px] text-career-heading lg:text-2xl lg:leading-7'
          />

          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
            {ADVERTISE_FORMATS.map((format, index) => (
              <div
                key={format.id}
                className={`bg-surface flex h-full flex-col gap-4
                ${
                  index < ADVERTISE_FORMATS.length - 1
                    ? 'border-career-stroke border-b pb-5'
                    : ''
                }
                ${index >= ADVERTISE_FORMATS.length - 2 ? 'lg:border-b-0 lg:pb-0' : ''}
                `}
              >
                <SectionIconTitle
                  icon={FORMAT_ICONS[format.id]}
                  title={format.title}
                />
                <BulletList items={format.items} />
              </div>
            ))}
          </div>
        </div>
      </ContactCardShell>

      <AdvertiseCtaBanner />
      <AdvertiseWhySection />
      <AdvertiseDisclaimer />
    </section>
  );
}
