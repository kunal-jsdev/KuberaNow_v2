import Image from 'next/image';

import comingSoonImage from '../../public/assets/coming_soon.png';
export default function ComingSoon() {
  return (
    <div className='my-12.5 flex w-full flex-col items-center justify-center gap-4 text-center md:gap-6'>
      <Image
        className='mx-auto h-36.5 w-41.75 md:h-55.5 md:w-63.5'
        src={comingSoonImage}
        alt='Coming Soon'
      />
      <h3 className='text-primary text-[32px] leading-9 font-bold md:text-[50px] md:leading-14.5'>
        Coming Soon
      </h3>
    </div>
  );
}
