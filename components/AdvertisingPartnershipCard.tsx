import { MdOutlineMailOutline } from 'react-icons/md';

export default function AdvertisingPartnershipCard() {
  return (
    <div className='border-divider from-dark-navy2 to-primary-navy flex h-61 min-w-76 flex-col gap-2 rounded-lg border bg-linear-to-r px-4.25 py-5.75 xl:w-76 xl:px-4'>
      <div className='text-content-small bg-light-navy4 flex h-6 w-48.75 items-center gap-2 rounded-[999px] px-2 py-1 font-semibold'>
        <MdOutlineMailOutline className='size-3.25' />
        <span className='text-text-disclaimer'>Advertising & Partnerships</span>
      </div>
      <p className='text-content-small text-white'>
        For advertising inquiries, branded content partnerships, sponsorship
        opportunities, and media kit requests, please contact our Business
        Development team:
      </p>

      <div className='bg-indigo-light border-indigo-dark flex h-23.5 flex-col gap-2.5 rounded-md border px-4 py-2'>
        <div className='border-indigo-dark flex gap-4 border-b pb-2'>
          <span className='text-content-small text-light-red-2 min-w-12.5 font-normal md:font-semibold'>
            Email
          </span>
          <span className='text-sm font-normal text-white md:font-semibold'>
            info@kuberanow.com
          </span>
        </div>
        <div className='flex gap-4'>
          <span className='text-content-small text-light-red-2 min-w-12.5 font-normal md:font-semibold'>
            Phone
          </span>
          <span className='text-sm font-normal text-white md:font-semibold'>
            +91 99042 77760
          </span>
        </div>
      </div>
    </div>
  );
}
