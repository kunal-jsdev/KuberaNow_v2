import type { ReactNode } from 'react';

import ContactCardShell from './ContactCardShell';
import ContactIconBadge from './ContactIconBadge';
import ContactInfoBox from './ContactInfoBox';

type ContactDepartmentCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  contacts: { type: 'email' | 'contact' | 'whatsapp'; value: string }[];
  footnote: string;
  layout?: 'split' | 'stacked';
  compact?: boolean;
};

export default function ContactDepartmentCard({
  icon,
  title,
  description,
  contacts,
  footnote,
  layout = 'stacked',
  compact,
}: ContactDepartmentCardProps) {
  const isSplit = layout === 'split';

  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div
        className={`flex w-full flex-col gap-4 ${
          isSplit ? 'lg:flex-row lg:items-start lg:gap-4' : ''
        }`}
      >
        <div
          className={`flex flex-col gap-4 ${
            isSplit ? 'min-w-0 flex-1 lg:gap-6' : 'w-full lg:h-full'
          }`}
        >
          <div className='flex items-center gap-3 lg:gap-4'>
            <ContactIconBadge
              size='sm'
              className='md:hidden'
            >
              {icon}
            </ContactIconBadge>
            <ContactIconBadge
              size='md'
              className='hidden size-4.5 md:flex'
            >
              {icon}
            </ContactIconBadge>
            <h2 className='text-career-dark min-w-0 flex-1 text-base leading-5 font-bold lg:text-xl lg:leading-6'>
              {title}
            </h2>
          </div>

          <p
            className={`text-career-dark min-h-fit text-sm leading-[18px] md:min-h-15 lg:text-base lg:leading-5 ${
              !isSplit ? 'lg:flex-1' : ''
            }`}
          >
            {description}
          </p>

          {!isSplit && (
            <div className='flex flex-col gap-2'>
              <ContactInfoBox
                contacts={contacts}
                compact={compact}
              />
              <p className='text-career-dark text-sm leading-[18px] lg:text-base lg:leading-5'>
                {footnote}
              </p>
            </div>
          )}
        </div>

        {isSplit && (
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <ContactInfoBox
              contacts={contacts}
              compact
            />
            <p className='text-career-dark text-base leading-5'>{footnote}</p>
          </div>
        )}
      </div>
    </ContactCardShell>
  );
}
