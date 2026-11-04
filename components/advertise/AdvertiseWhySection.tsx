import { ADVERTISE_WHY } from '../../constants/advertise';
import PageSectionHeader from '../common/PageSectionHeader';
import ContactCardShell from '../contact-us/ContactCardShell';

export default function AdvertiseWhySection() {
  return (
    <ContactCardShell
      padding='mobile'
      className='lg:rounded-lg lg:p-5'
    >
      <div className='flex w-full flex-col gap-4 lg:gap-6'>
        <PageSectionHeader
          title={ADVERTISE_WHY.title}
          titleClassName='text-lg leading-[22px] text-career-heading lg:text-2xl lg:leading-7'
        />

        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-5'>
          {ADVERTISE_WHY.benefits.map((benefit) => (
            <article
              key={benefit.title}
              className='border-career-stroke bg-career-tint rounded-md border p-3 shadow-[1px_1px_2px_rgba(0,0,0,0.1)] lg:p-4'
            >
              <h3 className='text-career-dark mb-3 text-base leading-5 font-bold lg:mb-4 lg:text-[22px] lg:leading-6.5'>
                {benefit.title}
              </h3>
              <p className='text-career-dark text-xs leading-4 lg:text-base lg:leading-5'>
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </ContactCardShell>
  );
}
