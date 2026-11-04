'use client';

import Image from 'next/image';
import Link from 'next/link';

import iconFavicon from '../../../public/assets/kuberaFavicon.svg';

export default function OfflinePage() {
  return (
    <div className='flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12 text-center font-sans'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 p-4 shadow-xs'>
        <Image
          src={iconFavicon}
          alt='KuberaNow Logo'
          width={56}
          height={56}
          className='h-14 w-14 object-contain'
        />
      </div>

      <h1 className='mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
        You are currently offline
      </h1>

      <p className='mb-8 max-w-md text-base leading-relaxed text-gray-600 sm:text-lg'>
        Please check your internet connection and try reloading the application
        to read breaking financial news and market updates.
      </p>

      <div className='flex flex-wrap items-center justify-center gap-4'>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='cursor-pointer rounded-lg bg-[#000ec0] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#000799] active:scale-98'
        >
          Retry Connection
        </button>

        <Link
          href='/'
          className='cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 active:scale-98'
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
