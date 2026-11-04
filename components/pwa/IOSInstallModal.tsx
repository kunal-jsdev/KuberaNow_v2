'use client';

import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

import Image from 'next/image';

import {
  trackPWAEvent,
  trackPWAInstallPrompt,
  usePWAInstall,
} from '@/hooks/usePWAInstall';

import iconFavicon from '../../public/assets/kuberaFavicon.svg';

type IOSInstallModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function IOSInstallModal({
  isOpen,
  onClose,
}: IOSInstallModalProps) {
  const { isIOSNonSafari } = usePWAInstall();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      trackPWAEvent('pwa_ios_guidance_opened');
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    trackPWAInstallPrompt('close');
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay - prevents scrolling and background interaction */}
      <div
        className='fixed inset-0 z-[200] touch-none bg-black/50 backdrop-blur-xs transition-opacity duration-300'
        aria-hidden='true'
      />

      {/* MOBILE UI (< 768px): Bottom Sheet Modal */}
      <div className='animate-in fade-in slide-in-from-bottom-full fixed right-0 bottom-0 left-0 z-[210] mx-auto flex w-full flex-col rounded-t-2xl border-x border-t border-gray-100 bg-white p-5 text-gray-900 shadow-[0_-4px_30px_rgba(0,0,0,0.22)] duration-300 md:hidden'>
        {/* Top Handle Bar */}
        <div className='mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-200' />

        <div className='flex w-full items-start justify-between'>
          {/* Header: Centered Logo + Title */}
          <div className='mb-3 flex items-center justify-center gap-2.5'>
            <Image
              src={iconFavicon}
              alt='KuberaNow'
              width={38}
              height={38}
              className='h-9.5 w-9.5 shrink-0 object-contain'
            />
            <h2 className='text-lg font-bold tracking-tight text-gray-900'>
              Install KuberaNow
            </h2>
          </div>
          {/* Top Right Close Button */}
          <button
            type='button'
            onClick={handleClose}
            className='cursor-pointer rounded-full p-1.5 text-black transition-colors hover:bg-gray-100 hover:text-gray-600'
            aria-label='Close'
          >
            <IoClose className='h-7 w-7' />
          </button>
        </div>

        {isIOSNonSafari ? (
          /* Non-Safari iOS Warning */
          <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900'>
            <div className='flex items-start gap-3'>
              <span className='text-xl'>⚠️</span>
              <div>
                <p className='mb-1 text-sm font-semibold'>
                  Safari Browser Required
                </p>
                <p className='text-xs leading-relaxed text-amber-800'>
                  iOS requires Safari to install Progressive Web Apps. Please
                  copy the URL and open this site in <strong>Safari</strong> to
                  install KuberaNow to your Home Screen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Safari Steps Container */
          <div className='mt-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-[#f0f4ff] p-4 text-sm text-gray-800'>
            <div className='flex items-center gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#000ec0] shadow-xs'>
                1
              </div>
              <p className='text-xs leading-snug text-gray-800 sm:text-sm'>
                Tap the <strong>Share</strong> button at the bottom of Safari.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#000ec0] shadow-xs'>
                2
              </div>
              <p className='text-xs leading-snug text-gray-800 sm:text-sm'>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Action Row: Full Width Button */}
        <div className='mt-5 w-full'>
          <button
            onClick={handleClose}
            className='w-full cursor-pointer rounded-lg bg-[#000ec0] py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#000799] active:scale-98'
          >
            Got it
          </button>
        </div>
      </div>

      {/* DESKTOP UI (>= 768px): Top Right Modal Card */}
      <div className='animate-in fade-in slide-in-from-top-4 fixed top-[96px] right-6 z-[210] hidden w-[400px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-gray-100 bg-white p-6 text-gray-900 shadow-[0_10px_40px_rgba(0,0,0,0.22)] duration-300 md:flex'>
        {/* Top Right Close Button */}
        <button
          type='button'
          onClick={handleClose}
          className='absolute top-4 right-4 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          aria-label='Close'
        >
          <IoClose className='h-5 w-5' />
        </button>

        {/* Header: Centered Logo + Title */}
        <div className='mb-4 flex items-center justify-center gap-2.5'>
          <Image
            src={iconFavicon}
            alt='KuberaNow'
            width={40}
            height={40}
            className='h-10 w-10 shrink-0 object-contain'
          />
          <h2 className='text-lg font-bold tracking-tight text-gray-900'>
            Install KuberaNow
          </h2>
        </div>

        {isIOSNonSafari ? (
          <div className='mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900'>
            <div className='flex items-start gap-3'>
              <span className='text-xl'>⚠️</span>
              <div>
                <p className='mb-1 text-sm font-semibold'>
                  Safari Browser Required
                </p>
                <p className='text-xs leading-relaxed text-amber-800'>
                  iOS requires Safari to install Progressive Web Apps. Please
                  copy the URL and open this site in <strong>Safari</strong> to
                  install KuberaNow to your Home Screen.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='mt-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-[#f0f4ff] p-4 text-sm text-gray-800'>
            <div className='flex items-center gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#000ec0] shadow-xs'>
                1
              </div>
              <p className='text-sm leading-snug text-gray-800'>
                Tap the <strong>Share</strong> button at the bottom of Safari.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#000ec0] shadow-xs'>
                2
              </div>
              <p className='text-sm leading-snug text-gray-800'>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
            </div>
          </div>
        )}

        <div className='mt-6 w-full'>
          <button
            onClick={handleClose}
            className='w-full cursor-pointer rounded-lg bg-[#000ec0] py-3 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#000799] active:scale-98'
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
