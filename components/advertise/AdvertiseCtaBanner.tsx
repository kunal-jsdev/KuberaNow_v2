import { ADVERTISE_CTA } from '../../constants/advertise';

export default function AdvertiseCtaBanner() {
  return (
    <section className='border-career-stroke bg-contact-ad-gradient shadow-contact-promo overflow-hidden rounded-md border lg:rounded-lg'>
      <div className='flex flex-col items-center gap-6 p-3 text-center lg:gap-10 lg:p-8'>
        <div className='flex w-full flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-1.5 lg:text-left'>
          <h2 className='text-center text-lg leading-5.5 font-bold text-white lg:max-w-86.5 lg:text-[32px] lg:leading-10'>
            <span className='text-career-accent'>
              {ADVERTISE_CTA.highlight}
            </span>
            {` ${ADVERTISE_CTA.title}`}
          </h2>
          <p className='text-center text-xs leading-4.5 text-white/90 lg:max-w-85.5 lg:text-lg lg:leading-5.5'>
            {ADVERTISE_CTA.description}
          </p>
        </div>
        <div className='bg-career-accent text-career-dark flex flex-wrap items-center justify-center gap-3 rounded-lg px-4 py-2 text-xs leading-5 font-bold shadow-[0px_0px_3px_rgba(0,0,0,0.5)] lg:gap-4 lg:text-base'>
          <a
            href={`tel:${ADVERTISE_CTA.phone.replace(/\s/g, '')}`}
            className='hover:opacity-80'
          >
            {ADVERTISE_CTA.phone}
          </a>
          <span aria-hidden>|</span>
          <a
            href={`mailto:${ADVERTISE_CTA.email}`}
            className='hover:opacity-80'
          >
            {ADVERTISE_CTA.email}
          </a>
        </div>
      </div>
    </section>
  );
}
