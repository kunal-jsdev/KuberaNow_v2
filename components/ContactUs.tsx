import { CONTACT_DETAILS } from '../constants/constants';

import SidebarCardWrapper from './SidebarCardWrapper';

export default function ContactUs() {
  return (
    <div className='md:mb-4'>
      <SidebarCardWrapper title='Contact Us'>
        <div className='flex min-w-full flex-col p-4 text-sm leading-4.5'>
          {CONTACT_DETAILS.map(({ label, value }) => (
            <div
              key={label}
              className='border-divider flex min-h-9 min-w-68 gap-4 border-b last:border-b-0'
            >
              <p className='flex min-w-20.75 flex-col justify-center leading-4.5'>
                {label}
              </p>
              <p className='text-text-disclaimer mx-auto w-38.75 py-2.25 leading-4.5 font-semibold'>
                {value}
              </p>
            </div>
          ))}
        </div>
      </SidebarCardWrapper>
    </div>
  );
}
