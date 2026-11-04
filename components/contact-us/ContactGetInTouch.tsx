import Image from 'next/image';
import Link from 'next/link';

import {
  CONTACT_INTRO,
  CONTACT_RESPONSE_NOTICE,
} from '../../constants/contact';
import { SOCIAL_LINKS } from '../../constants/navigation';
import { STATIC_PAGE_SEO } from '../../constants/pageSeo';

import ContactCardShell from './ContactCardShell';

export default function ContactGetInTouch() {
  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:gap-6'>
        <div className='border-career-stroke border-b-2 pb-2'>
          <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
            <div className='relative flex h-8.25 shrink-0 items-center'>
              <span
                className='bg-primary absolute left-0 h-5.5 w-1 rounded-xs shadow-[2px_0px_0px_0px_var(--color-career-accent)]'
                aria-hidden
              />
              <h1 className='text-career-heading pl-3 text-lg leading-5.5 font-bold lg:text-2xl lg:leading-7'>
                {STATIC_PAGE_SEO.contact.h1}
              </h1>
            </div>

            <div className='flex items-center gap-1'>
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative size-6.5 shrink-0 overflow-hidden rounded-full shadow-[0_2px_6px_0_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_4px_10px_0_rgba(0,0,0,0.2)]'
                  aria-label={social.name}
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    fill
                    className='scale-125 object-cover'
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className='text-sm leading-[18px] text-black lg:text-base lg:leading-5'>
          {CONTACT_INTRO}
        </p>

        <div className='border-career-stroke bg-career-chip-bg rounded border-[1.25px] p-3 lg:rounded-sm lg:p-4'>
          <p className='text-primary text-sm leading-[18px] lg:leading-[18px] lg:font-semibold'>
            {CONTACT_RESPONSE_NOTICE}
          </p>
        </div>
      </div>
    </ContactCardShell>
  );
}
