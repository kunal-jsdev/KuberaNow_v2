import { ADVERTISE_DISCLAIMER } from '../../constants/advertise';

export default function AdvertiseDisclaimer() {
  return (
    <div className='border-career-stroke bg-surface rounded-md border px-6 py-4 lg:rounded-lg'>
      <p className='text-career-dark text-xs leading-4 lg:text-sm'>
        {ADVERTISE_DISCLAIMER}
      </p>
    </div>
  );
}
