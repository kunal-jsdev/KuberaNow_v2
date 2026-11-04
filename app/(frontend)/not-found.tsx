import { TiHome } from 'react-icons/ti';

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import NotFound404Image from '../../public/assets/not_found_404.png';

export const metadata: Metadata = {
  title: 'Page Not Found | KuberaNow',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className='bg-background-color flex max-h-[60vh] flex-col items-center rounded-lg px-4 py-4 text-center md:items-center md:py-12 lg:items-center'>
      <div className='relative mx-auto w-full max-w-90 sm:max-w-115 md:max-w-130'>
        <Image
          src={NotFound404Image}
          alt='404 Page Not Found'
          width={180}
          height={120}
          priority
          className='mx-auto object-contain md:w-[300px]'
        />
      </div>

      <h1 className='mt-6 mb-6 font-["Noto_Sans"] text-3xl leading-9 font-bold tracking-normal whitespace-normal text-[#010874] md:text-5xl md:leading-14.5'>
        Page Not Found
      </h1>

      <Link
        href='/'
        className='inline-flex h-9 w-24.25 items-center justify-center gap-1 rounded-sm bg-linear-to-r from-[#000EC0] to-[#000764] text-base font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:opacity-95 md:h-auto md:w-auto md:px-5 md:py-2'
      >
        <TiHome className='h-3 w-3' />
        <span className='text-center align-middle font-["Noto_Sans"] text-sm leading-4.5 font-semibold tracking-normal'>
          Home
        </span>
      </Link>
    </main>
  );
}
