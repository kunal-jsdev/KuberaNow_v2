'use client';

import { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';

import Image from 'next/image';

import { trackPWAInstallPrompt, usePWAInstall } from '@/hooks/usePWAInstall';

import iconFavicon from '../../public/assets/kuberaFavicon.svg';

import IOSInstallModal from './IOSInstallModal';

export default function PWAInstallBanner() {
  const {
    shouldShowPrompt,
    isIOS,
    isInstalled,
    sessionCount,
    promptInstall,
    dismissPrompt,
  } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const hasTrackedShown = useRef(false);

  const isVisible = shouldShowPrompt;

  // Track event & lock body scroll when prompt is visible on ANY screen (Mobile or Desktop)
  useEffect(() => {
    if (isVisible || showIOSModal) {
      document.body.style.overflow = 'hidden';
      if (isVisible && !hasTrackedShown.current) {
        trackPWAInstallPrompt('shown', {
          prompt_session: sessionCount,
          pwa_status: isInstalled ? 'installed' : 'not_installed',
        });
        hasTrackedShown.current = true;
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible, showIOSModal, sessionCount, isInstalled]);

  if (!isVisible && !showIOSModal) return null;

  const handleInstallClick = () => {
    trackPWAInstallPrompt('add_to_home_screen', {
      prompt_session: sessionCount,
      pwa_status: isInstalled ? 'installed' : 'not_installed',
    });

    if (isIOS) {
      setShowIOSModal(true);
    } else {
      promptInstall();
    }
  };

  const handleNotNowClick = () => {
    dismissPrompt('not_now');
  };

  const handleCloseClick = () => {
    dismissPrompt('close');
  };

  return (
    <>
      {isVisible && (
        <>
          <div
            className='fixed inset-0 z-[140] touch-none bg-black/50 backdrop-blur-xs transition-opacity duration-300'
            aria-hidden='true'
          />
          <div
            role='dialog'
            aria-label='Add KuberaNow to Home Screen'
            className='animate-in fade-in slide-in-from-bottom-full fixed right-0 bottom-0 left-0 z-[150] flex w-full flex-col rounded-t-2xl border-x border-t border-gray-100 bg-white p-5 text-gray-900 shadow-[0_-4px_30px_rgba(0,0,0,0.22)] duration-300 md:hidden'
          >
            {/* Top Handle Bar */}
            <div className='mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-200' />

            {/* Top Right Close Button */}
            <button
              type='button'
              onClick={handleCloseClick}
              className='absolute top-3.5 right-4 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              aria-label='Close'
            >
              <IoClose className='h-5 w-5' />
            </button>

            {/* Header: Centered Logo + Domain */}
            <div className='mb-3 flex items-center justify-center gap-2'>
              <Image
                src={iconFavicon}
                alt='KuberaNow Logo'
                width={38}
                height={38}
                className='h-9.5 w-9.5 shrink-0 object-contain'
              />
              <span className='text-base font-bold tracking-tight text-gray-900'>
                kuberanow.com
              </span>
            </div>

            {/* Body Description: Centered */}
            <p className='px-2 text-center text-sm leading-relaxed font-normal text-gray-700'>
              Add <strong>KuberaNow</strong> to your home screen for
              lightning-fast access to Stock market news, real-time market
              updates, and offline reading.
            </p>

            {/* Action Buttons */}
            <div className='mt-5 flex w-full items-center gap-3'>
              <button
                type='button'
                onClick={handleNotNowClick}
                className='flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white py-2.5 text-center text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 active:scale-98'
              >
                Not Now
              </button>

              <button
                type='button'
                onClick={handleInstallClick}
                className='flex-1 cursor-pointer rounded-lg bg-[#000ec0] py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#000799] active:scale-98'
              >
                Add to Home Screen
              </button>
            </div>
          </div>

          <div
            role='dialog'
            aria-label='Add KuberaNow to Home Screen'
            className='animate-in fade-in slide-in-from-top-4 fixed top-[96px] right-6 z-[150] hidden w-[400px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl border border-gray-100 bg-white p-6 text-gray-900 shadow-[0_10px_40px_rgba(0,0,0,0.22)] duration-300 md:flex'
          >
            {/* Top Right Close Button */}
            <button
              type='button'
              onClick={handleCloseClick}
              className='absolute top-4 right-4 cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
              aria-label='Close'
            >
              <IoClose className='h-5 w-5' />
            </button>

            {/* Header: Centered Logo + Domain */}
            <div className='mb-4 flex items-center justify-center gap-2.5'>
              <Image
                src={iconFavicon}
                alt='KuberaNow Logo'
                width={42}
                height={42}
                className='h-10.5 w-10.5 shrink-0 object-contain'
              />
              <span className='text-lg font-bold tracking-tight text-gray-900'>
                kuberanow.com
              </span>
            </div>

            {/* Body Description: Centered */}
            <p className='px-2 text-center text-base leading-relaxed font-normal text-gray-700'>
              Add <strong>KuberaNow</strong> to your home screen for
              lightning-fast access to Stock market news, real-time market
              updates, and offline reading.
            </p>

            {/* Action Buttons */}
            <div className='mt-6 flex w-full items-center gap-3'>
              <button
                type='button'
                onClick={handleNotNowClick}
                className='flex-1 cursor-pointer rounded-lg border border-gray-300 bg-white py-3 text-center text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 active:scale-98'
              >
                Not Now
              </button>

              <button
                type='button'
                onClick={handleInstallClick}
                className='flex-1 cursor-pointer rounded-lg bg-[#000ec0] py-3 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#000799] active:scale-98'
              >
                Add to Home Screen
              </button>
            </div>
          </div>
        </>
      )}

      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => {
          setShowIOSModal(false);
          dismissPrompt();
        }}
      />
    </>
  );
}
